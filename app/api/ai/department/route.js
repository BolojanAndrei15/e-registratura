import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { nume } = await req.json();
    if (!nume) {
      return NextResponse.json({ error: "Numele departamentului este obligatoriu." }, { status: 400 });
    }
    const prompt = `Ești un asistent care scrie descrieri profesionale pentru departamentele unei primării. Răspunde doar cu o descriere profesională, clară, scurtă (maxim 10 cuvinte) pentru departamentul numit: '${nume}'.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 50,
      temperature: 0.7
    });
    const descriere = completion.choices?.[0]?.message?.content?.trim();
    if (!descriere) {
      return NextResponse.json({ error: "Nu s-a putut genera descrierea." }, { status: 500 });
    }
    return NextResponse.json({ descriere });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json({ error: "Eroare la generarea descrierii.", details: error?.message || error }, { status: 500 });
  }
}
