/*
  Warnings:

  - You are about to drop the column `check_with_tech_status` on the `events` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CheckWithTechStatus" ADD VALUE 'Confirmed';
ALTER TYPE "CheckWithTechStatus" ADD VALUE 'Rejected';

-- CreateTable
CREATE TABLE "CheckWithTech" (
    "cwt_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "submitted_by" INTEGER NOT NULL,
    "status" "CheckWithTechStatus" NOT NULL DEFAULT 'Requested',
    "request" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "confirmed_by" INTEGER,
    "confirmed_at" TIMESTAMPTZ(6),

    CONSTRAINT "CheckWithTech_pkey" PRIMARY KEY ("cwt_id")
);

-- AddForeignKey
ALTER TABLE "CheckWithTech" ADD CONSTRAINT "CheckWithTech_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckWithTech" ADD CONSTRAINT "CheckWithTech_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CheckWithTech" ADD CONSTRAINT "CheckWithTech_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- continued in pt2 migration
