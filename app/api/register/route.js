import { db } from "@/lib/drizzle";
import { user } from "@/lib/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return Response.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
    }
    // Verifică dacă utilizatorul există deja
    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      return Response.json({ error: "Email deja folosit" }, { status: 400 });
    }
    // Hash parola
    const passwordHash = await bcrypt.hash(password, 10);
    // Creează utilizatorul
    await db.insert(user).values({
      name,
      email,
      passwordHash,
      isDeleted: false,
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error("Register error:", e);
    return Response.json({ error: "Eroare la înregistrare" }, { status: 500 });
  }
}
