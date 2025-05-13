import { db } from '@/lib/drizzle.js';
import { status } from '@/lib/schema.js';

export async function GET() {
  try {
    const data = await db.select().from(status);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Eroare la obținerea statusurilor' }, { status: 500 });
  }
}
