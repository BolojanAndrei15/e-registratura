import { db } from '@/lib/drizzle.js';
import { registrations } from '@/lib/schema.js';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const registerId = searchParams.get('registerId');
  if (!registerId) {
    return NextResponse.json({ error: 'registerId lipsă în query.' }, { status: 400 });
  }
  try {
    // Select all fields, including registrantId
    const regs = await db.select().from(registrations).where(eq(registrations.registerId, registerId));
    return NextResponse.json(regs);
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la preluarea înregistrărilor.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Extrage și validează datele necesare din body
    const {
      registerId,
      departmentId,
      documentNo,
      registrantId,
      handlerId,
      documentDate,
      sentDate,
      source,
      statusId,
      documentTypeId,
      summary
    } = body;

    // Creează noua înregistrare fără registrationNo (se va genera automat în backend)
    const [created] = await db.insert(registrations).values({
      registerId,
      departmentId,
      documentNo,
      registrantId,
      handlerId,
      documentDate: documentDate ? new Date(documentDate) : null,
      sentDate: sentDate ? new Date(sentDate) : null,
      source,
      statusId,
      documentTypeId,
      summary,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Eroare la crearea înregistrării.' }, { status: 500 });
  }
}