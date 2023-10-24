/*
 * Three-step process: create the column, populate it with data, then add the foreign key and non-null constraint.
*/

ALTER TABLE "events" ADD COLUMN "host" INTEGER;

UPDATE "events" SET "host" = "created_by";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "host" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_host_fkey" FOREIGN KEY ("host") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
