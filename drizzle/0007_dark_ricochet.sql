ALTER TABLE "SeriesConfig" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "SeriesConfig" ALTER COLUMN "current" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "SeriesConfig" ALTER COLUMN "updatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "SeriesConfig" ADD COLUMN "year" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "SeriesConfig" ADD CONSTRAINT "unique_year" UNIQUE("year");