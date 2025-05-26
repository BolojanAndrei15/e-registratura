ALTER TABLE "Department" ADD COLUMN "departmentStorageId" varchar(255);--> statement-breakpoint
ALTER TABLE "Register" ADD COLUMN "registerStorageId" varchar(255);--> statement-breakpoint
ALTER TABLE "Register" DROP COLUMN "fileStorageId";