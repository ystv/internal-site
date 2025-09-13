-- AlterTable
ALTER TABLE "public"."committee_teams" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;
