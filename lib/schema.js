import { pgTable, foreignKey, uuid, timestamp, unique, varchar, text, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import {db} from '@/lib/drizzle.js';



export const registerDocumentType = pgTable("RegisterDocumentType", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	registerId: uuid().notNull(),
	documentTypeId: uuid().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.documentTypeId],
			foreignColumns: [documentType.id],
			name: "RegisterDocumentType_documentTypeId_DocumentType_id_fk"
		}),
	foreignKey({
			columns: [table.registerId],
			foreignColumns: [register.id],
			name: "RegisterDocumentType_registerId_Register_id_fk"
		}),
]);

export const documentType = pgTable("DocumentType", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	color: varchar({ length: 32 }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("DocumentType_name_unique").on(table.name),
]);

export const status = pgTable("Status", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 32 }).notNull(),
	description: text(),
	color: varchar({ length: 32 }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("Status_name_unique").on(table.name),
]);

export const seriesConfig = pgTable("SeriesConfig", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	size: integer().notNull(),
});

export const notification = pgTable("Notification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	message: text().notNull(),
	status: varchar({ length: 32 }).default('UNASSIGNED'),
	isRead: boolean().default(false),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	eventType: varchar({ length: 255 }),
	relatedId: uuid(),
	roleId: uuid(),
	departmentId: uuid(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "Notification_departmentId_Department_id_fk"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [role.id],
			name: "Notification_roleId_Role_id_fk"
		}),
]);

export const registration = pgTable("Registration", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	registerId: uuid().notNull(),
	registrationNo: integer().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	departmentId: uuid().notNull(),
	registrantId: uuid(),
	handlerId: uuid(),
	documentNo: varchar({ length: 255 }),
	documentDate: timestamp({ withTimezone: true, mode: 'string' }),
	sentDate: timestamp({ withTimezone: true, mode: 'string' }),
	source: varchar({ length: 255 }),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	statusId: uuid().notNull(),
	documentTypeId: uuid().notNull(),
	summary: text(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "Registration_departmentId_Department_id_fk"
		}),
	foreignKey({
			columns: [table.documentTypeId],
			foreignColumns: [documentType.id],
			name: "Registration_documentTypeId_DocumentType_id_fk"
		}),
	foreignKey({
			columns: [table.handlerId],
			foreignColumns: [user.id],
			name: "Registration_handlerId_User_id_fk"
		}),
	foreignKey({
			columns: [table.registerId],
			foreignColumns: [register.id],
			name: "Registration_registerId_Register_id_fk"
		}),
	foreignKey({
			columns: [table.registrantId],
			foreignColumns: [user.id],
			name: "Registration_registrantId_User_id_fk"
		}),
	foreignKey({
			columns: [table.statusId],
			foreignColumns: [status.id],
			name: "Registration_statusId_Status_id_fk"
		}),
]);

export const document = pgTable("Document", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	registrationId: uuid().default(null),
	fileUrl: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	summary: text(),
	isDeleted: boolean().default(false),
	deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
	statusId: uuid().notNull(),
	documentTypeId: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentTypeId],
			foreignColumns: [documentType.id],
			name: "Document_documentTypeId_DocumentType_id_fk"
		}),
	foreignKey({
			columns: [table.registrationId],
			foreignColumns: [registration.id],
			name: "Document_registrationId_Registration_id_fk"
		}),
	foreignKey({
			columns: [table.statusId],
			foreignColumns: [status.id],
			name: "Document_statusId_Status_id_fk"
		}),
]);

export const department = pgTable("Department", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("Department_name_unique").on(table.name),
]);

export const rolePermission = pgTable("RolePermission", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roleId: uuid().notNull(),
	permissionId: uuid().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permission.id],
			name: "RolePermission_permissionId_Permission_id_fk"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [role.id],
			name: "RolePermission_roleId_Role_id_fk"
		}),
]);

export const register = pgTable("Register", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	year: integer().notNull(),
	minNumber: integer(),
	maxNumber: integer(),
	departmentId: uuid().notNull(),
	registerTypeId: uuid().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
});

export const registerType = pgTable("RegisterType", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("RegisterType_name_unique").on(table.name),
]);

export const loginAttempt = pgTable("LoginAttempt", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid(),
	email: varchar({ length: 255 }),
	ipAddress: varchar({ length: 255 }).notNull(),
	success: boolean().notNull(),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "LoginAttempt_userId_User_id_fk"
		}),
]);

export const role = pgTable("Role", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 32 }).default('#6366f1'),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("Role_name_unique").on(table.name),
]);

export const permission = pgTable("Permission", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("Permission_name_unique").on(table.name),
]);

export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	departmentId: uuid(),
	roleId: uuid(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	isDeleted: boolean().default(false),
	deletedAt: timestamp({ withTimezone: true, mode: 'string' }),
	image: varchar({ length: 255 }).default('https://github.com/shadcn.png'),
}, (table) => [
	unique("User_email_unique").on(table.email),
]);

export const auditLog = pgTable("AuditLog", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tableName: varchar({ length: 255 }).notNull(),
	primaryKey: varchar({ length: 255 }).notNull(),
	action: varchar({ length: 32 }).notNull(),
	userId: uuid(),
	oldData: text(),
	newData: text(),
	severity: varchar({ length: 32 }).default('INFO'),
	message: text().default(''),
	diffDetails: text(),
	ipAddress: varchar({ length: 255 }),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "AuditLog_userId_User_id_fk"
		}),
]);

export async function getNextRegistrationNumber(registerId) {
  const regs = await db.select({ registrationNo: registration.registrationNo })
    .from(registration)
    .where(sql`${registration.registerId} = ${registerId}`);
  const validNos = regs.map(r => r.registrationNo).filter(n => typeof n === 'number' && !isNaN(n));
  const maxNo = validNos.length > 0 ? Math.max(...validNos) : 0;
  return maxNo + 1;
}

export { getNextRegistrationNumber };
