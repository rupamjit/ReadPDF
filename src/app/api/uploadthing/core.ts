import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { pinecone } from "@/lib/pinecone";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
    },
  })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new UploadThingError("UNAUTHORIZED");

      return { userID: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📄 Starting file processing for:", file.name);

      const createFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userID,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        // Validate environment variables
        if (!process.env.HUGGINGFACE_API_KEY) {
          throw new Error("HUGGINGFACE_API_KEY is not set");
        }

        const response = await fetch(file.url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch file: ${response.status} ${response.statusText}`
          );
        }

        const blob = await response.blob();

        // Validate blob
        if (blob.size === 0) {
          throw new Error("Downloaded file is empty");
        }

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        if (pageLevelDocs.length === 0) {
          throw new Error("No pages found in PDF");
        }

        // Validate that documents have content
        const hasContent = pageLevelDocs.some(
          (doc) => doc.pageContent.trim().length > 0
        );
        if (!hasContent) {
          throw new Error("PDF contains no readable text content");
        }

        // vectorize and index entire document
        const pineconeIndex = pinecone.Index("readpdf2");

        const embeddings = new HuggingFaceInferenceEmbeddings({
          apiKey: process.env.HUGGINGFACE_API_KEY,
          model: "Qwen/Qwen3-Embedding-8B",
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createFile.id,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createFile.id,
          },
        });

        console.log("🎉 File processing completed successfully");


      } catch (error) {
        console.error("🔴 Error from embedding the file:", error);

        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
