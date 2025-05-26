import { db } from '@/lib/drizzle.js';
import { register, registration, registerType, department } from '@/lib/schema.js';
import { count, eq, sql } from 'drizzle-orm';
import axios from 'axios';

export async function GET(req) {
  try {
    // Extrage departmentId din query string
    const url = new URL(req.url, 'http://localhost');
    const departmentId = url.searchParams.get('departmentId');

    // Construiește query cu condiția de departmentId dacă există
    const query = db
      .select({
        register: register,
        registerTypeName: registerType.name,
        registrationsCount: sql`COALESCE((
          SELECT COUNT(*)::int 
          FROM ${registration} 
          WHERE ${registration.registerId} = ${register.id}
        ), 0)`.as('registrationsCount')
      })
      .from(register)
      .leftJoin(registerType, eq(register.registerTypeId, registerType.id));

    // Aplică filtrarea după departmentId dacă este furnizat
    if (departmentId) {
      query.where(eq(register.departmentId, departmentId));
    }

    // Execută query-ul
    const results = await query;

    // Formatează rezultatele într-o structură clară
    const formattedResults = results.map(row => ({
      ...row.register,
      registerType: row.registerTypeName || null,
      registrationsCount: row.registrationsCount
    }));

    return Response.json(formattedResults);
  } catch (error) {
    console.error('Eroare la obținerea registrelor:', error);
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      year,
      minNumber,
      maxNumber,
      departmentId,
      registerTypeId
    } = body;

    // Validare detaliată
    if (!name || !year || !departmentId || !registerTypeId) {
      return Response.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 });
    }

    // Validare pentru an (presupunem că anul trebuie să fie rezonabil)
    const currentYear = new Date().getFullYear();
    if (year < 1992 || year > currentYear + 10) {
      return Response.json({ error: 'An invalid' }, { status: 400 });
    }

    // Validare pentru minNumber și maxNumber dacă sunt furnizate
    if (minNumber !== null && maxNumber !== null && minNumber > maxNumber) {
      return Response.json({ error: 'Numărul minim nu poate fi mai mare decât numărul maxim' }, { status: 400 });
    }

    // Verificare dacă departmentId și registerTypeId există
    const [departmentExists] = await db
      .select({ count: count() })
      .from(department)
      .where(eq(department.id, departmentId));

    if (departmentExists.count === 0) {
      return Response.json({ error: 'Departamentul specificat nu există' }, { status: 400 });
    }

    const [registerTypeExists] = await db
      .select({ count: count() })
      .from(registerType)
      .where(eq(registerType.id, registerTypeId));

    if (registerTypeExists.count === 0) {
      return Response.json({ error: 'Tipul de registru specificat nu există' }, { status: 400 });
    }

    // Crearea registrului
    const [newRegister] = await db.insert(register).values({
      name,
      description: description || null,
      year,
      minNumber: minNumber ?? null,
      maxNumber: maxNumber ?? null,
      departmentId,
      registerTypeId
    }).returning();

    // Webhook n8n pentru creare registry
    try {
      await axios.post(`${process.env.N8N_URL}/webhook-test/registries`, {
        action: "create",
        registerId: newRegister.id,
        registerStorageId: newRegister.registerStorageId,
        name: newRegister.name,
        departmentId: newRegister.departmentId
      });
    } catch (webhookError) {
      console.error("n8n webhook error (registry create):", webhookError?.message || webhookError);
    }

    return Response.json({ 
      success: true, 
      data: newRegister 
    }, { status: 201 });
  } catch (error) {
    console.error('Eroare la crearea registrului:', error);
    
    // Răspuns mai detaliat pentru erori cunoscute (ex. chei duplicate)
    if (error.code === '23505') { // Cod PostgreSQL pentru cheie duplicată
      return Response.json(
        { error: 'Un registru cu acest nume deja există' }, 
        { status: 409 }
      );
    }
    
    return Response.json({ error: 'Eroare server' }, { status: 500 });
  }
}