-- AlterTable
ALTER TABLE "events" ADD COLUMN     "recurring_event_id" INTEGER;

-- CreateTable
CREATE TABLE "recurring_events" (
    "recurring_event_id" SERIAL NOT NULL,

    CONSTRAINT "recurring_events_pkey" PRIMARY KEY ("recurring_event_id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events"("recurring_event_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
