
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";


export const geminiAi = () => {

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });
    return ai;
}
export const grokAi = () => {

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
    return groq;
}

