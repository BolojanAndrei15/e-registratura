import { pgTable, uuid, integer, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import { varchar, boolean } from 'drizzle-orm/pg-core';
import { db } from './drizzle.js';

// Tabela Statuses pentru gestionarea statusurilor personalizabile
export const statuses = pgTable('Status', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 32 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 32 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

// Tabela DocumentTypes pentru gestionarea tipurilor de documente personalizabile
export const documentTypes = pgTable('DocumentType', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 32 }), // Pentru personalizare UI
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

// Tabela RegisterDocumentTypes pentru asocierea tipurilor de documente cu registraturile
export const registerDocumentTypes = pgTable('RegisterDocumentType', {
  id: uuid('id').primaryKey().defaultRandom(),
  registerId: uuid('registerId').notNull().references(() => registers.id),
  documentTypeId: uuid('documentTypeId').notNull().references(() => documentTypes.id),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const departments = pgTable('Department', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  departmentId: uuid('departmentId'),
  roleId: uuid('roleId'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  image: varchar('image', { length: 255 }).default('https://github.com/shadcn.png'),
});

export const registers = pgTable('Register', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  year: integer('year').notNull(),
  minNumber: integer('minNumber'),
  maxNumber: integer('maxNumber'),
  departmentId: uuid('departmentId').notNull(),
  registerTypeId: uuid('registerTypeId').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const registrations = pgTable('Registration', {
  id: uuid('id').primaryKey().defaultRandom(),
  registerId: uuid('registerId').notNull().references(() => registers.id),
  registrationNo: integer('registrationNo').notNull(),
  departmentId: uuid('departmentId').notNull().references(() => departments.id),
  documentNo: varchar('documentNo', { length: 255 }),
  registrantId: uuid('registrantId').references(() => users.id),
  handlerId: uuid('handlerId').references(() => users.id),
  documentDate: timestamp('documentDate', { withTimezone: true }),
  sentDate: timestamp('sentDate', { withTimezone: true }),
  source: varchar('source', { length: 255 }),
  statusId: uuid('statusId').notNull().references(() => statuses.id),
  documentTypeId: uuid('documentTypeId').notNull().references(() => documentTypes.id),
  summary: text('summary'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const roles = pgTable('Role', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 32 }).default('#6366f1'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const permissions = pgTable('Permission', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const rolePermissions = pgTable('RolePermission', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('roleId').notNull().references(() => roles.id),
  permissionId: uuid('permissionId').notNull().references(() => permissions.id),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const registerTypes = pgTable('RegisterType', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export const auditLogs = pgTable('AuditLog', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableName: varchar('tableName', { length: 255 }).notNull(),
  primaryKey: varchar('primaryKey', { length: 255 }).notNull(),
  action: varchar('action', { length: 32 }).notNull(),
  userId: uuid('userId').references(() => users.id),
  oldData: text('oldData'),
  newData: text('newData'),
  severity: varchar('severity', { length: 32 }).default('INFO'),
  message: text('message').default(''),
  diffDetails: text('diffDetails'),
  ipAddress: varchar('ipAddress', { length: 255 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const documents = pgTable('Document', {
  id: uuid('id').primaryKey().defaultRandom(),
  registrationId: uuid('registrationId').notNull().references(() => registrations.id),
  fileUrl: varchar('fileUrl', { length: 255 }).notNull(),
  type: varchar('type', { length: 32 }).notNull(), // Ex. PDF, DOC
  statusId: uuid('statusId').notNull().references(() => statuses.id),
  documentTypeId: uuid('documentTypeId').notNull().references(() => documentTypes.id),
  summary: text('summary'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
});

export const notifications = pgTable('Notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  status: varchar('status', { length: 32 }).default('UNASSIGNED'),
  isRead: boolean('isRead').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  eventType: varchar('eventType', { length: 255 }),
  relatedId: uuid('relatedId'),
  roleId: uuid('roleId').references(() => roles.id),
  departmentId: uuid('departmentId').references(() => departments.id),
});

export const loginAttempts = pgTable('LoginAttempt', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id),
  email: varchar('email', { length: 255 }),
  ipAddress: varchar('ipAddress', { length: 255 }).notNull(),
  success: boolean('success').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const seriesConfig = pgTable('SeriesConfig', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  size: integer('size').notNull(),
});

// Returnează următorul număr de înregistrare pentru un registru dat
export async function getNextRegistrationNumber(registerId) {
  // Caută înregistrările existente pentru acest registru
  const regs = await db.select({ registrationNo: registrations.registrationNo })
    .from(registrations)
    .where(eq(registrations.registerId, registerId));
  // Filtrează valorile null/undefined
  const validNos = regs.map(r => r.registrationNo).filter(n => typeof n === 'number' && !isNaN(n));
  const maxNo = validNos.length > 0 ? Math.max(...validNos) : 0;
  return maxNo + 1;
}