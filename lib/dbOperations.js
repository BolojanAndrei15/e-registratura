import { db } from '@/lib/drizzle.js';
import { department, auditLog } from '@/lib/schema.js';
import { eq } from 'drizzle-orm';

// Creează un departament și loghează acțiunea
export async function createDepartment({ name, description, userId, userName, ipAddress }) {
  const [created] = await db.insert(department).values({
    name,
    description,
  }).returning();
  const now = new Date();
  const message = `Userul (${userName || 'necunoscut'}) cu IP-ul (${ipAddress}) a creat departamentul cu numele (${name}) la (${now.toLocaleString('ro-RO')})`;
  await db.insert(auditLog).values({
    tableName: 'Department',
    primaryKey: created.id,
    action: 'CREATE',
    userId,
    newData: JSON.stringify(created),
    ipAddress,
    message,
    createdAt: now.toISOString(),
  });
  return created;
}

// Actualizează un departament și loghează acțiunea
export async function updateDepartment({ id, name, description, userId, userName, ipAddress }) {
  const [oldDepartment] = await db.select().from(department).where(eq(department.id, id));
  const [updated] = await db.update(department)
    .set({ name, description })
    .where(eq(department.id, id))
    .returning();
  const now = new Date();
  const message = `Userul (${userName || 'necunoscut'}) cu IP-ul (${ipAddress}) a actualizat departamentul (${name}) la (${now.toLocaleString('ro-RO')})`;
  await db.insert(auditLog).values({
    tableName: 'Department',
    primaryKey: id,
    action: 'UPDATE',
    userId,
    oldData: JSON.stringify(oldDepartment),
    newData: JSON.stringify(updated),
    ipAddress,
    message,
    createdAt: now.toISOString(),
  });
  return updated;
}

// Șterge un departament și loghează acțiunea
export async function deleteDepartment({ id, userId, ipAddress }) {
  const [oldDepartment] = await db.select().from(department).where(eq(department.id, id));
  const [deleted] = await db.delete(department).where(eq(department.id, id)).returning();
  await db.insert(auditLog).values({
    tableName: 'Department',
    primaryKey: id,
    action: 'DELETE',
    userId,
    oldData: JSON.stringify(oldDepartment),
    ipAddress,
  });
  return deleted;
}
