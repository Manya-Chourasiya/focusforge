import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are a productivity assistant. The user has these tasks:
${tasks.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

Respond ONLY with valid JSON, no markdown, no extra text:
{"schedule":[{"time":"9:00 AM","task":"task name","duration":"30 mins","tip":"short tip"}]}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ schedule: [] }, { status: 500 });
  }
}