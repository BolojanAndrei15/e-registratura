import { getNextRegistrationNumber } from '@/lib/schema.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const registerId = searchParams.get('registerId');
  if (!registerId) {
    return NextResponse.json({ error: 'registerId lipsă în query.' }, { status: 400 });
  }
  try {
    const nextNo = await getNextRegistrationNumber(registerId);
    return NextResponse.json({ nextRegistrationNo: nextNo });
  } catch (error) {
    console.error('nextRegistrationNo error:', error);
    return NextResponse.json({ error: 'Eroare la calcularea numărului de înregistrare.' }, { status: 500 });
  }
}
