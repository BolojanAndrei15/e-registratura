import { db } from "@/lib/drizzle";
import { departments } from "@/lib/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// Returnează un singur departament după id
export async function GET(req, context) {
  const { id } = context.params;
  try {
    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));
    if (!department || department.length === 0) {
      return NextResponse.json({ error: "Departament inexistent" }, { status: 404 });
    }
    return NextResponse.json({ success: true, department: department[0] });
  } catch (error) {
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

// Actualizează un departament după id
export async function PUT(req, context) {
  const { id } = context.params;
  try {
    const { name, description } = await req.json();
    const updated = await db
      .update(departments)
      .set({ name, description })
      .where(eq(departments.id, id))
      .returning();
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Departamentul nu a fost găsit sau nu s-a putut actualiza." }, { status: 404 });
    }
    return NextResponse.json({ success: true, department: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la actualizarea departamentului." }, { status: 500 });
  }
}

// Șterge un departament după id
export async function DELETE(req, context) {
  const { id } = context.params;
  try {
    const deleted = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: "Departamentul nu a fost găsit sau nu s-a putut șterge." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Departament șters cu succes!" });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la ștergerea departamentului." }, { status: 500 });
  }
}
