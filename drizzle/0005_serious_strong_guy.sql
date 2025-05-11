CREATE TABLE "DocumentType" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(32),
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "DocumentType_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "RegisterDocumentType" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registerId" uuid NOT NULL,
	"documentTypeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(32) NOT NULL,
	"description" text,
	"color" varchar(32),
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Status_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "statusId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "documentTypeId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "statusId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "documentTypeId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "RegisterDocumentType" ADD CONSTRAINT "RegisterDocumentType_registerId_Register_id_fk" FOREIGN KEY ("registerId") REFERENCES "public"."Register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RegisterDocumentType" ADD CONSTRAINT "RegisterDocumentType_documentTypeId_DocumentType_id_fk" FOREIGN KEY ("documentTypeId") REFERENCES "public"."DocumentType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_registrationId_Registration_id_fk" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_statusId_Status_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."Status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentTypeId_DocumentType_id_fk" FOREIGN KEY ("documentTypeId") REFERENCES "public"."DocumentType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_departmentId_Department_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_registerId_Register_id_fk" FOREIGN KEY ("registerId") REFERENCES "public"."Register"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_departmentId_Department_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_registrantId_User_id_fk" FOREIGN KEY ("registrantId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_handlerId_User_id_fk" FOREIGN KEY ("handlerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_statusId_Status_id_fk" FOREIGN KEY ("statusId") REFERENCES "public"."Status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_documentTypeId_DocumentType_id_fk" FOREIGN KEY ("documentTypeId") REFERENCES "public"."DocumentType"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_Permission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Registration" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "Registration" DROP COLUMN "documentType";