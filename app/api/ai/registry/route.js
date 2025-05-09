import { NextResponse } from "next/server";
import { db } from '@/lib/drizzle.js';
import { registerTypes } from '@/lib/schema.js';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Numele registrului este obligatoriu." }, { status: 400 });
    }

    // Ia tipurile de registru
    const types = await db.select().from(registerTypes);
    const typeNames = types.map(t => t.name).join(", ");

    // Prompt optimizat
    const prompt = `Tipuri disponibile: ${typeNames}. Pentru registrul '${name}', generează un JSON cu: "description" (max 2 fraze, max 200 caractere) și "recommendedType" (exact unul din listă).`;

    // Cerere către OpenAI
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Ești un asistent pentru completarea registrelor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        }
      }
    );

    const text = openaiRes.data.choices[0].message.content;

    let aiResult = {};

    try {
      aiResult = JSON.parse(text);
    } catch (e) {
      // Fallback cu regex dacă JSON-ul nu e valid
      const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/);
      const typeMatch = text.match(/"recommendedType"\s*:\s*"([^"]+)"/);

      if (descMatch && typeMatch) {
        aiResult = {
          description: descMatch[1],
          recommendedType: typeMatch[1]
        };
      } else {
        return NextResponse.json({ error: "Răspuns AI invalid" }, { status: 500 });
      }
    }

    return NextResponse.json(aiResult);

  } catch (err) {
    console.error("Eroare:", err);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
