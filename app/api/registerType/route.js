import { db } from '@/lib/drizzle.js';
import { registerType } from '@/lib/schema.js';

export async function GET() {
  try {
    const types = await db.select().from(registerType);
    return Response.json(types);
  } catch (error) {
    return Response.json({ error: 'Eroare la obținerea tipurilor de registru' }, { status: 500 });
  }
}
