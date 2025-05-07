-- migrate data
INSERT INTO "CheckWithTech" ("event_id", "submitted_by", "status", "request")
SELECT "event_id", "host", 'Confirmed', '[Automatically migrated. Please check Slack.]'
FROM "events"
WHERE "check_with_tech_status" IS NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "check_with_tech_status";
