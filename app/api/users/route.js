import { db } from '@/lib/drizzle.js';
import { users } from '@/lib/schema.js';

export async function GET() {
  try {
    const data = await db.select().from(users);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Eroare la obținerea utilizatorilor' }, { status: 500 });
  }
}
