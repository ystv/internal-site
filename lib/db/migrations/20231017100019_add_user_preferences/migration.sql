-- AlterTable
ALTER TABLE "users"
ADD COLUMN "preferences" JSONB NOT NULL DEFAULT '{}';