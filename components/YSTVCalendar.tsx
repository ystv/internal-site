"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { EventInput } from "@fullcalendar/core";
import { useRouter } from "next/navigation";

export default function YSTVCalendar({
  events,
  selectedMonth,
}: {
  events: Event[];
  selectedMonth: Date;
}) {
  const router = useRouter();
  const isMobile = false;
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView={isMobile ? "listMonth" : "dayGridMonth"}
      headerToolbar={{
        right: "today prev,next dayGridMonth,listMonth,timeGridDay",
      }}
      showNonCurrentDates={false}
      datesSet={(n) =>
        router.push(
          `/calendar?year=${n.start.getFullYear()}&month=${
            n.start.getMonth() + 1
          }`,
        )
      }
      titleFormat={{ year: "numeric", month: isMobile ? "short" : "long" }}
      firstDay={1}
      initialDate={selectedMonth}
      eventClick={(info) => {
        // don't let the browser navigate
        info.jsEvent.preventDefault();
        if (info.event.url) {
          router.push(info.event.url);
        }
      }}
      events={events.map((evt) => {
        const eventObject: EventInput = {
          id: evt.event_id.toString(10),
          title: evt.name,
          start: evt.start_date,
          end: evt.end_date,
          url: `/calendar/${evt.event_id}`,
        };
        if (evt.is_tentative) {
          eventObject.color = "#8b8b8b";
        }
        if (evt.is_cancelled) {
          eventObject.title = `CANCELLED: ${eventObject.title}`;
          eventObject.url = "";
          eventObject.color = "#B00020";
        }
        return eventObject;
      })}
    />
  );
}

type EventType = "show" | "meeting" | "social" | "other";

interface Event {
  event_id: number;
  event_type: EventType | string;
  name: string;
  start_date: Date;
  end_date: Date;
  is_cancelled: boolean;
  is_tentative: boolean;
}

// Event {
//   event_id                       Int             @id @default(autoincrement())
//   event_type                     String          @default("other")
//   name                           String
//   start_date                     DateTime        @db.Timestamptz(6)
//   end_date                       DateTime        @db.Timestamptz(6)
//   description                    String          @default("")
//   location                       String          @default("")
//   is_private                     Boolean         @default(false)
//   is_cancelled                   Boolean         @default(false)
//   is_tentative                   Boolean         @default(false)
//   created_at                     DateTime        @default(now()) @db.Timestamptz(6)
//   created_by                     Int?
//       updated_at                     DateTime?       @db.Timestamptz(6)
//           updated_by                     Int?
//       deleted_at                     DateTime?       @db.Timestamptz(6)
//           deleted_by                     Int?
//       attendees                      Attendee[]
//   users_events_created_byTousers User?           @relation("events_created_byTousers", fields: [created_by], references: [user_id], onDelete: NoAction, onUpdate: NoAction)
//   users_events_deleted_byTousers User?           @relation("events_deleted_byTousers", fields: [deleted_by], references: [user_id], onDelete: NoAction, onUpdate: NoAction)
//   users_events_updated_byTousers User?           @relation("events_updated_byTousers", fields: [updated_by], references: [user_id], onDelete: NoAction, onUpdate: NoAction)
//   signup_sheets                  SignupSheet[]
//   }
