-- AlterTable
ALTER TABLE "CheckWithTech" ADD COLUMN     "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;