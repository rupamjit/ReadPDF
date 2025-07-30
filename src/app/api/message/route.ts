import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { HfInference } from "@huggingface/inference";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";

// Initialize Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const POST = async (req: Request) => {
  // EndPoint: ask a question to the uploaded pdf
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not Found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // vectorize the user message
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "Qwen/Qwen3-Embedding-8B",
  });

  const pineconeIndex = pinecone.Index("readpdf2");

  const vectorStore = PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await (await vectorStore).similaritySearch(message, 4);

  const previousMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedMessages = previousMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  // Prepare the context and conversation history
  const contextText = results.map((r) => r.pageContent).join("\n\n");
  const conversationHistory = formattedMessages
    .map((message) => {
      if (message.role === "user") return `User: ${message.content}\n`;
      return `Assistant: ${message.content}\n`;
    })
    .join("");

  try {
    // Use Hugging Face Inference API for chat completions with streaming
    const stream = hf.chatCompletionStream({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.",
        },
        {
          role: "user",
          content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.

PREVIOUS CONVERSATION:
${conversationHistory}

CONTEXT:
${contextText}

USER INPUT: ${message}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
      top_p: 0.9,
    });

    let fullOutput = "";

    // Create a readable stream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content || "";
            if (text) {
              fullOutput += text;
              console.log("🔹 Chunk received:", text);

              // Send chunk to client
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ content: text })}\n\n`
                )
              );
            }
          }

          console.log("✅ Full streamed output:", fullOutput);

          // Save the complete response to database
          await db.message.create({
            data: {
              text: fullOutput,
              isUserMessage: false,
              fileId,
              userId,
            },
          });

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error with Hugging Face Inference:", error);

    // Fallback: non-streaming response
    try {
      const response = await hf.chatCompletion({
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.",
          },
          {
            role: "user",
            content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.FORMATTING GUIDELINES:
- Use **bold text** for headings and important information
- Present information in clean lines without bullet points
- Format links as [text](url) when URLs are available
- Structure information clearly with proper headings
- Use code blocks with \`\`\` for code snippets
- Be comprehensive and detailed in your responses

PREVIOUS CONVERSATION:
${conversationHistory}

CONTEXT:
${contextText}

USER INPUT: ${message}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
        top_p: 0.9,
      });

      const content =
        response.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      // Save response to database
      await db.message.create({
        data: {
          text: content,
          isUserMessage: false,
          fileId,
          userId,
        },
      });

      return NextResponse.json({ content });
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
