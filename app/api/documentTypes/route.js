import { db } from '@/lib/drizzle.js';
import { documentType } from '@/lib/schema.js';

export async function GET() {
  try {
    const data = await db.select().from(documentType);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Eroare la obținerea tipurilor de document' }, { status: 500 });
  }
}
