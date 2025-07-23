-- Rename ForeignKey
ALTER TABLE "CheckWithTech" RENAME CONSTRAINT "CheckWithTech_confirmed_by_fkey" TO "check_with_techs_confirmed_by_fkey";

-- Rename ForeignKey
ALTER TABLE "CheckWithTech" RENAME CONSTRAINT "CheckWithTech_event_id_fkey" TO "check_with_techs_event_id_fkey";

-- Rename ForeignKey
ALTER TABLE "CheckWithTech" RENAME CONSTRAINT "CheckWithTech_submitted_by_fkey" TO "check_with_techs_submitted_by_fkey";

-- Rename Table
ALTER TABLE "CheckWithTech" RENAME TO "check_with_techs";
