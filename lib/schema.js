// lib/schema.js
import {
    pgTable, uuid, varchar, text, timestamp, integer, boolean
  } from 'drizzle-orm/pg-core';
  
  // Enum-urile se tratează ca string-uri (validarea se face în cod)
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
    registerId: uuid('registerId').notNull(),
    registrationNo: integer('registrationNo'),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    departmentId: uuid('departmentId'),
    registrantId: uuid('registrantId'),
    handlerId: uuid('handlerId'),
    status: varchar('status', { length: 32 }).default('PENDING'),
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
    roleId: uuid('roleId').notNull(),
    permissionId: uuid('permissionId').notNull(),
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
    userId: uuid('userId'),
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
    registrationId: uuid('registrationId').notNull(),
    fileUrl: varchar('fileUrl', { length: 255 }).notNull(),
    type: varchar('type', { length: 32 }).notNull(),
    status: varchar('status', { length: 32 }).default('DRAFT'),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
    summary: text('summary'),
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
    relatedId: uuid('relatedId'), // ID-ul entității relevante
    roleId: uuid('roleId'), // Dacă notificările sunt trimise către toți utilizatorii cu un anumit rol (de exemplu, admin)
    departmentId: uuid('departmentId'), // Dacă notificările sunt trimise către utilizatori dintr-un anumit departament
  });
  
  
  export const loginAttempts = pgTable('LoginAttempt', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId'),
    email: varchar('email', { length: 255 }),
    ipAddress: varchar('ipAddress', { length: 255 }).notNull(),
    success: boolean('success').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
  });
  
  export const seriesConfig = pgTable('SeriesConfig', {
    id: uuid('id').primaryKey().defaultRandom(),
    current: integer('current').default(1),
    description: text('description'),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  });