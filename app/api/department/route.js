import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { departments, users, registers, registrations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { departmentSchema } from "@/lib/utils";
import axios from "axios";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Get all departments
    const deps = await db.select().from(departments);
    // For each department, get users, registers, registrations
    const allUsers = await db.select().from(users);
    const allRegisters = await db.select().from(registers);
    const allRegistrations = await db.select().from(registrations);

    const mapped = deps.map(dep => {
      const depUsers = allUsers.filter(u => u.departmentId === dep.id);
      const depRegisters = allRegisters.filter(r => r.departmentId === dep.id);
      const depRegistrations = allRegistrations.filter(r => r.departmentId === dep.id);
      return {
        id: dep.id,
        name: dep.name,
        description: dep.description,
        lastEdited: dep.updatedAt,
        avatars: depUsers.map(u => ({ fallback: u.name?.[0] || "?", image: u.image, name: u.name })),
        registerNumbers: depRegisters.length,
        totalRegistries: depRegistrations.length,
      };
    });
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/department error:", error);
    return NextResponse.json({ error: "Database error", details: error?.message || error }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { nume, descriere } = parsed.data;
    if (!nume || nume.trim().length < 5) {
      return NextResponse.json({ error: "Numele departamentului trebuie să aibă cel puțin 5 caractere." }, { status: 400 });
    }
    if (!descriere || descriere.trim().length < 10) {
      return NextResponse.json({ error: "Descrierea trebuie să aibă cel puțin 10 caractere." }, { status: 400 });
    }
    // Folosește direct descrierea primită, fără integrare n8n
    if (!descriere || !descriere.trim()) {
      return NextResponse.json({
        error: "Te rog introdu manual descrierea.",
        requireManualDescription: true
      }, { status: 400 });
    }
    // Creează departamentul cu Drizzle
    const [createdDepartment] = await db.insert(departments).values({
      name: nume,
      description: descriere,
    }).returning();
    if (!createdDepartment) {
      return NextResponse.json({ error: "Eroare la crearea departamentului" }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Departamentul a fost creat.",
      department: createdDepartment,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/department error:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
