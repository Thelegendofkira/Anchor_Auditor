
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
    try {

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "return a max length text possible",
        });

        return NextResponse.json({ text: response.text });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }
}