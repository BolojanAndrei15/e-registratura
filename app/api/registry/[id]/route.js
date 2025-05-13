import { db } from '@/lib/drizzle.js';
import { register } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    // Extrage doar câmpurile permise pentru update
    const { name, description, year, minNumber, maxNumber, registerTypeId } = body;
    if (!id) return Response.json({ error: 'ID lipsă' }, { status: 400 });
    if (!name || !description || !year || !registerTypeId) {
      return Response.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 });
    }
    const updated = await db.update(register)
      .set({
        name,
        description,
        year,
        minNumber: minNumber ?? null,
        maxNumber: maxNumber ?? null,
        registerTypeId
      })
      .where(eq(register.id, id))
      .returning();
    if (!updated.length) return Response.json({ error: 'Registrul nu a fost găsit' }, { status: 404 });
    return Response.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Eroare la update registru:', error);
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    if (!id) return Response.json({ error: 'ID lipsă' }, { status: 400 });
    const deleted = await db.delete(register).where(eq(register.id, id)).returning();
    if (!deleted.length) return Response.json({ error: 'Registrul nu a fost găsit' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Eroare la ștergere registru:', error);
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }
}
