"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { EventInput } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import "./YSTVCalendar.css";

export default function YSTVCalendar({
  events,
  selectedMonth,
}: {
  events: Event[];
  selectedMonth: Date;
}) {
  const router = useRouter();
  const isMobileView = useMediaQuery("(max-width: 650px)");
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView={"dayGridMonth"}
      headerToolbar={{
        right: "today prev,next dayGridMonth,listMonth,timeGridDay",
      }}
      buttonText={{
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
        list: "List",
      }}
      showNonCurrentDates={false}
      datesSet={(n) =>
        router.push(
          `/calendar?year=${n.start.getFullYear()}&month=${
            n.start.getMonth() + 1
          }`,
        )
      }
      titleFormat={{ year: "numeric", month: isMobileView ? "short" : "long" }}
      firstDay={1}
      eventTimeFormat={{
        hour: "numeric",
        meridiem: "short",
      }}
      //////
      dayHeaders={!isMobileView}
      dayHeaderDidMount={({ dow, el }) => {
        if (dow === 1) {
          const header = document.createElement("th");
          header.style.width = "1.6em";
          el.parentElement?.prepend(header);
        }
      }}
      dayCellContent={
        isMobileView
          ? (day) =>
              day.date.toLocaleDateString(undefined, {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })
          : undefined
      }
      viewClassNames={
        isMobileView ? "fc-daygrid-day-events-mobile-shrink" : undefined
      }
      fixedWeekCount={!isMobileView}
      eventDisplay={"block"}
      weekNumbers={true}
      weekNumberContent={(week) => {
        return `Revision ${week.num}`;
      }}
      weekNumberFormat={{ week: "long" }} //Do not delete this line, it is used to format the week number or it kicks up a fuss
      height={"auto"}
      //////
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
