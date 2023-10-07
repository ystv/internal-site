"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { EventInput, formatDate } from "@fullcalendar/core";
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
import { useRef } from "react";
import * as Sentry from "@sentry/nextjs";

dayjs.extend(weekOfYear);

let didLogAcademicYearError = false;

function getUoYWeekName(date: Date) {
  if (!Array.isArray(academicYears)) {
    // Something has gone badly wrong (https://linear.app/ystv/issue/WEB-100/typeerror-cacademicyearsfindlast-is-not-a-function-in)
    if (!didLogAcademicYearError) {
      Sentry.captureException(new Error("Failed to load academicYears"), {
        extra: {
          academicYears,
        },
      });
      didLogAcademicYearError = true;
    }
    return "Week " + dayjs(date).week();
  }
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
  selectedDate,
  view: rawView,
}: {
  events: Event[];
  selectedDate: Date;
  view?: string;
}) {
  const router = useRouter();

  const isMobileView = useMediaQuery("(max-width: 650px)", undefined, {
    getInitialValueInEffect: false,
  });

  const view = rawView ?? (isMobileView ? "dayGridWeek" : "dayGridMonth");

  const calendarRef = useRef<FullCalendar>(null);

  const viewsList = [
    { value: "dayGridMonth", label: "Month" },
    { value: "dayGridWeek", label: "Week" },
    { value: "listMonth", label: "List" },
    { value: "timeGridDay", label: "Day" },
  ];

  return (
    <>
      {isMobileView && calendarRef.current && (
        <>
          <Select
            label="Calendar View"
            className={"text-right [&_input]:select-none [&_input]:text-right"}
            styles={{
              input: {
                userSelect: "none",
              },
            }}
            data={viewsList}
            value={view}
            onChange={(e) => {
              e && calendarRef.current?.getApi().changeView(e);
            }}
            autoComplete="off"
          />
          <br />
        </>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={view}
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
        datesSet={(n) => {
          // Per https://github.com/fullcalendar/fullcalendar/issues/6582#issuecomment-942758927
          // With the current view set being different durations, this handler is called every time
          // the view changes as well this may change in-future, consider re-adding viewDidMount handler
          const newDate = n.view.calendar.getDate();
          return router.push(
            `/calendar?year=${newDate.getFullYear()}&month=${
              newDate.getMonth() + 1
            }&day=${newDate.getDate()}&view=${n.view.type}`,
          );
        }}
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
            dayHeaderFormat: (date) => {
              return date.date.marker.toLocaleDateString(undefined, {
                weekday: "long",
                day: "2-digit",
                month: "long",
              });
            },
          },
          dayGridWeek: {
            type: "dayGridWeek",
            dayHeaderFormat: (date) =>
              formatDate(date.date.marker, {
                month: "2-digit",
                day: "2-digit",
                locale: "en-GB",
              }),
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
        initialDate={selectedDate}
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
            eventObject.color = "#B00020";
            eventObject.className = "ystv-calendar-strike-through";
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
