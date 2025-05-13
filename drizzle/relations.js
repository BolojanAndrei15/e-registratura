import { relations } from "drizzle-orm/relations";
import { documentType, registerDocumentType, register, department, notification, role, registration, user, status, document, permission, rolePermission, loginAttempt, auditLog } from "@/lib/schema.js";

export const registerDocumentTypeRelations = relations(registerDocumentType, ({one}) => ({
	documentType: one(documentType, {
		fields: [registerDocumentType.documentTypeId],
		references: [documentType.id]
	}),
	register: one(register, {
		fields: [registerDocumentType.registerId],
		references: [register.id]
	}),
}));

export const documentTypeRelations = relations(documentType, ({many}) => ({
	registerDocumentTypes: many(registerDocumentType),
	registrations: many(registration),
	documents: many(document),
}));

export const registerRelations = relations(register, ({many}) => ({
	registerDocumentTypes: many(registerDocumentType),
	registrations: many(registration),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	department: one(department, {
		fields: [notification.departmentId],
		references: [department.id]
	}),
	role: one(role, {
		fields: [notification.roleId],
		references: [role.id]
	}),
}));

export const departmentRelations = relations(department, ({many}) => ({
	notifications: many(notification),
	registrations: many(registration),
}));

export const roleRelations = relations(role, ({many}) => ({
	notifications: many(notification),
	rolePermissions: many(rolePermission),
}));

export const registrationRelations = relations(registration, ({one, many}) => ({
	department: one(department, {
		fields: [registration.departmentId],
		references: [department.id]
	}),
	documentType: one(documentType, {
		fields: [registration.documentTypeId],
		references: [documentType.id]
	}),
	user_handlerId: one(user, {
		fields: [registration.handlerId],
		references: [user.id],
		relationName: "registration_handlerId_user_id"
	}),
	register: one(register, {
		fields: [registration.registerId],
		references: [register.id]
	}),
	user_registrantId: one(user, {
		fields: [registration.registrantId],
		references: [user.id],
		relationName: "registration_registrantId_user_id"
	}),
	status: one(status, {
		fields: [registration.statusId],
		references: [status.id]
	}),
	documents: many(document),
}));

export const userRelations = relations(user, ({many}) => ({
	registrations_handlerId: many(registration, {
		relationName: "registration_handlerId_user_id"
	}),
	registrations_registrantId: many(registration, {
		relationName: "registration_registrantId_user_id"
	}),
	loginAttempts: many(loginAttempt),
	auditLogs: many(auditLog),
}));

export const statusRelations = relations(status, ({many}) => ({
	registrations: many(registration),
	documents: many(document),
}));

export const documentRelations = relations(document, ({one}) => ({
	documentType: one(documentType, {
		fields: [document.documentTypeId],
		references: [documentType.id]
	}),
	registration: one(registration, {
		fields: [document.registrationId],
		references: [registration.id]
	}),
	status: one(status, {
		fields: [document.statusId],
		references: [status.id]
	}),
}));

export const rolePermissionRelations = relations(rolePermission, ({one}) => ({
	permission: one(permission, {
		fields: [rolePermission.permissionId],
		references: [permission.id]
	}),
	role: one(role, {
		fields: [rolePermission.roleId],
		references: [role.id]
	}),
}));

export const permissionRelations = relations(permission, ({many}) => ({
	rolePermissions: many(rolePermission),
}));

export const loginAttemptRelations = relations(loginAttempt, ({one}) => ({
	user: one(user, {
		fields: [loginAttempt.userId],
		references: [user.id]
	}),
}));

export const auditLogRelations = relations(auditLog, ({one}) => ({
	user: one(user, {
		fields: [auditLog.userId],
		references: [user.id]
	}),
}));