import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Always use a fallback to prevent the whole app from crashing if the key is missing
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 2. CHANGE: Using 'gemini-1.5-flash'. It's faster and widely available.
    // If this still 404s, try "gemini-pro"
    // This is the current stable "workhorse" model as of December 2025
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an event planning assistant. 
    Return ONLY a JSON object. No markdown, no preamble.
    Structure:
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "suggestedCapacity": number,
      "suggestedTicketType": "free" | "paid"
    }
    User Idea: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // 3. Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Raw AI Output:", text);
      throw new Error("AI failed to return valid JSON format");
    }

    const eventData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(eventData);

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { error: "Generation failed", details: error.message },
      { status: 500 }
    );
  }
}