ALTER TABLE "SeriesConfig" DROP CONSTRAINT "unique_year";--> statement-breakpoint
ALTER TABLE "SeriesConfig" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "SeriesConfig" DROP COLUMN "year";--> statement-breakpoint
ALTER TABLE "SeriesConfig" DROP COLUMN "current";--> statement-breakpoint
ALTER TABLE "SeriesConfig" DROP COLUMN "interval_size";--> statement-breakpoint
ALTER TABLE "SeriesConfig" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "SeriesConfig" DROP COLUMN "updatedAt";