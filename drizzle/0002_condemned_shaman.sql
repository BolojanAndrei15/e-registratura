ALTER TABLE "Notification" ADD COLUMN "roleId" uuid;--> statement-breakpoint
ALTER TABLE "Notification" ADD COLUMN "departmentId" uuid;--> statement-breakpoint
ALTER TABLE "Notification" DROP COLUMN "recipientId";