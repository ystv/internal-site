-- CreateEnum
CREATE TYPE "CheckWithTechStatus" AS ENUM ('Requested');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "check_with_tech_status" "CheckWithTechStatus";
