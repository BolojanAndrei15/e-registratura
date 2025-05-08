ALTER TABLE "Notification" RENAME COLUMN "registrationId" TO "eventType";--> statement-breakpoint
ALTER TABLE "Notification" ADD COLUMN "relatedId" uuid;