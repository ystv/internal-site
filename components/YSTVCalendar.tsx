"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { CalendarApi, EventInput } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import {
  CalendarType,
  academicYears,
  getNextPeriod,
  Holiday,
} from "uoy-week-calendar/dist/calendar";
import "./YSTVCalendar.css";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Select } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

dayjs.extend(weekOfYear);

function getUoYWeekName(date: Date) {
  const academicYear = academicYears.findLast(
    (x) => x.periods[0].startDate.getTime() <= date.getTime(),
  );
  if (!academicYear) {
    return "Week " + dayjs(date).week();
  }
  let period = academicYear.periods[0];
  let nextPeriod = getNextPeriod(period, academicYear);
  while (nextPeriod.startDate.getTime() <= date.getTime()) {
    period = nextPeriod;
    nextPeriod = getNextPeriod(period, academicYear);
  }

  if (period instanceof Holiday) {
    return period.name + " Vacation";
  }

  const name = period
    .getWeekName(date, CalendarType.UNDERGRADUATE)
    .replace("Teaching", "");
  // HACK pending upstream changes
  if (name.includes("(")) {
    return name.replace(/^.*\((.+)\)$/, "$1");
  }
  return name;
}

export default function YSTVCalendar({
  events,
  selectedMonth,
}: {
  events: Event[];
  selectedMonth: Date;
}) {
  const router = useRouter();
  const isMobileView = useMediaQuery("(max-width: 650px)", undefined, {
    getInitialValueInEffect: false,
  });

  const calendarRef = useRef<FullCalendar>(null);
  const [calendarAPI, setCalendarAPI] = useState<CalendarApi | null>(null);
  useEffect(() => {
    if (calendarRef.current == null) return;
    setCalendarAPI(calendarRef.current.getApi());
  }, [calendarRef]);

  const viewsList = [
    { value: "dayGridMonth", label: "Month" },
    { value: "dayGridWeek", label: "Week" },
    { value: "listMonth", label: "List" },
    { value: "timeGridDay", label: "Day" },
  ];

  return (
    <>
      {isMobileView && calendarRef.current && calendarAPI && (
        <>
          <Select
            label="Calendar View"
            styles={{
              root: { textAlign: "right" },
              input: { textAlign: "right" },
            }}
            data={viewsList}
            value={calendarAPI.view.type}
            onChange={(e) => calendarAPI.changeView(e ?? "dayGridMonth")}
            autoComplete="off"
          />
          <br />
        </>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={isMobileView ? "dayGridWeek" : "dayGridMonth"}
        headerToolbar={{
          right:
            "today prev,next" +
            (isMobileView ? "" : " " + viewsList.map((x) => x.value).join(",")),
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
        titleFormat={{
          year: "numeric",
          month: isMobileView ? "short" : "long",
        }}
        firstDay={1}
        eventTimeFormat={{
          hour: "numeric",
          meridiem: "short",
        }}
        //////
        dayHeaders={!isMobileView}
        dayHeaderDidMount={({ dow, el }) => {
          if (dow === 1 && el.parentElement?.children.length === 7) {
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
        views={{
          timeGridDay: {
            type: "timeGridDay",
            weekNumbers: false,
          },
        }}
        fixedWeekCount={false}
        eventDisplay={"block"}
        weekNumbers={true}
        weekNumberContent={(week) => {
          return getUoYWeekName(week.date);
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
    </>
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
