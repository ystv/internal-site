-- CreateTable
CREATE TABLE "public"."recurring_attendees" (
    "recurring_event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "attend_status" TEXT NOT NULL,

    CONSTRAINT "recurring_attendees_pkey" PRIMARY KEY ("recurring_event_id","user_id")
);

-- AddForeignKey
ALTER TABLE "public"."recurring_attendees" ADD CONSTRAINT "recurring_attendees_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "public"."recurring_events"("recurring_event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recurring_attendees" ADD CONSTRAINT "recurring_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."recurring_events" ADD COLUMN     "event_type" TEXT NOT NULL DEFAULT 'other';