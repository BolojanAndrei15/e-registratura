CREATE TABLE "AuditLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tableName" varchar(255) NOT NULL,
	"primaryKey" varchar(255) NOT NULL,
	"action" varchar(32) NOT NULL,
	"userId" uuid,
	"oldData" text,
	"newData" text,
	"severity" varchar(32) DEFAULT 'INFO',
	"message" text DEFAULT '',
	"diffDetails" text,
	"ipAddress" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registrationId" uuid NOT NULL,
	"fileUrl" varchar(255) NOT NULL,
	"type" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'DRAFT',
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"summary" text,
	"isDeleted" boolean DEFAULT false,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "LoginAttempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"email" varchar(255),
	"ipAddress" varchar(255) NOT NULL,
	"success" boolean NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registrationId" uuid NOT NULL,
	"recipientId" uuid NOT NULL,
	"message" text NOT NULL,
	"status" varchar(32) DEFAULT 'UNASSIGNED',
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Permission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Permission_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "RegisterType" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "RegisterType_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "Register" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"year" integer NOT NULL,
	"minNumber" integer,
	"maxNumber" integer,
	"departmentId" uuid NOT NULL,
	"registerTypeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registerId" uuid NOT NULL,
	"registrationNo" integer,
	"createdAt" timestamp with time zone DEFAULT now(),
	"departmentId" uuid,
	"registrantId" uuid,
	"handlerId" uuid,
	"status" varchar(32) DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "RolePermission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleId" uuid NOT NULL,
	"permissionId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(32) DEFAULT '#6366f1',
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "SeriesConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"current" integer DEFAULT 1,
	"description" text,
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"departmentId" uuid,
	"roleId" uuid,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false,
	"deletedAt" timestamp with time zone,
	"image" varchar(255) DEFAULT 'https://github.com/shadcn.png',
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
