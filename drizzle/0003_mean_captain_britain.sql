ALTER TABLE "Registration" ALTER COLUMN "registrationNo" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Registration" ALTER COLUMN "departmentId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "documentNo" varchar(255);--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "documentDate" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "sentDate" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "source" varchar(255);--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "documentType" varchar(32);--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "Registration" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now();