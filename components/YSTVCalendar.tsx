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
