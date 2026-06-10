import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const chatWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  try {
    const { message } = req.body;

    const restaurantInfo = `
      Restaurant Name: The Reserve

      Opening Hours:
      Monday-Sunday: 9 AM - 9 PM

      Address:
      Suite 410, 4th Floor,
      720 Marine Drive Promenade,
      Ernakulam District, 
      682031, India

      Contact:
      +91 9920012466

      Services:
      Table Reservation, Takeaway, Delivery , Online food order

      Reservation:
      Table Reservations available by phone.
    `;

    const prompt = `
      You are a restaurant assistant.

      Use ONLY the information below.

      ${restaurantInfo}

      User Question:
      ${message}

      If information is unavailable,
      politely tell the customer.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate response",
    });
  }
};
