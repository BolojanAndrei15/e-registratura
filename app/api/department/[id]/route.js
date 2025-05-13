import { db } from "@/lib/drizzle";
import { department } from "@/lib/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateDepartment } from "@/lib/dbOperations";

// Returnează un singur departament după id
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const departmentData = await db
      .select()
      .from(department)
      .where(eq(department.id, id));
    if (!departmentData || departmentData.length === 0) {
      return NextResponse.json({ error: "Departament inexistent" }, { status: 404 });
    }
    return NextResponse.json({ success: true, department: departmentData[0] });
  } catch (error) {
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

// Actualizează un departament după id
export async function PUT(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = await context.params;
  const { id } = params;
  try {
    const { name, description } = await req.json();
    const updated = await updateDepartment({
      id,
      name,
      description,
      userId: session.user?.id || null,
      userName: session.user?.name || null,
      ipAddress: req.headers.get("x-forwarded-for") || null
    });
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
  const params = await context.params;
  const { id } = params;
  try {
    const deleted = await db
      .delete(department)
      .where(eq(department.id, id))
      .returning();
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: "Departamentul nu a fost găsit sau nu s-a putut șterge." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Departament șters cu succes!" });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la ștergerea departamentului." }, { status: 500 });
  }
}
