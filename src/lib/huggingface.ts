
import { OpenAI } from "openai";


export const huggingface = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: process.env.HUGGINGFACE_API_KEY,
});

