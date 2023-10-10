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
import { ActionIcon, Menu, Select } from "@mantine/core";
import { useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { TbCheck, TbFilter } from "react-icons/tb";

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
  selectedFilter,
}: {
  events: Event[];
  selectedDate: Date;
  selectedFilter?: string;
}) {
  const router = useRouter();
  const isMobileView = useMediaQuery("(max-width: 650px)", undefined, {
    getInitialValueInEffect: false,
  });

  const calendarRef = useRef<FullCalendar>(null);
  const [calendarView, setCalendarView] = useState<string | null>(null);

  const viewsList = [
    { value: "dayGridMonth", label: "Month" },
    { value: "dayGridWeek", label: "Week" },
    { value: "listMonth", label: "List" },
    { value: "timeGridDay", label: "Day" },
  ];

  const updateCalendarURL = (newDate?: Date, newFilter?: String) => {
    const date = newDate ?? selectedDate;
    const filter = newFilter ?? selectedFilter;
    router.push(
      `/calendar?year=${date.getFullYear()}&month=${
        date.getMonth() + 1
      }&day=${date.getDate()}${
        !filter || filter === "all" ? "" : `&filter=${filter}`
      }`,
    );
  };

  return (
    <>
      <div className={"flex items-end justify-between gap-1"}>
        <Menu>
          <Menu.Target>
            <ActionIcon
              size={36}
              variant={selectedFilter ? "filled" : "outline"}
              color={"blue"}
            >
              <TbFilter />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Filter Events</Menu.Label>
            <Menu.Item
              {...(selectedFilter === undefined && {
                leftSection: <TbCheck />,
                disabled: true,
              })}
              onClick={() => updateCalendarURL(undefined, "all")}
            >
              All
            </Menu.Item>
            <Menu.Item
              {...(selectedFilter == "vacant" && {
                leftSection: <TbCheck />,
                disabled: true,
              })}
              onClick={() => updateCalendarURL(undefined, "vacant")}
            >
              Vacant
            </Menu.Item>
            <Menu.Item
              {...(selectedFilter == "my" && {
                leftSection: <TbCheck />,
                disabled: true,
              })}
              onClick={() => updateCalendarURL(undefined, "my")}
            >
              My
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {isMobileView && calendarRef.current && calendarView && (
          <Select
            label="Calendar View"
            className={"text-right [&_input]:select-none [&_input]:text-right"}
            styles={{
              input: {
                userSelect: "none",
              },
            }}
            data={viewsList}
            value={calendarView}
            onChange={(e) =>
              calendarRef.current?.getApi().changeView(e ?? "dayGridWeek")
            }
            autoComplete="off"
          />
        )}
      </div>
      <br />
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
        viewDidMount={(n) => {
          setCalendarView(n.view.type);
        }}
        showNonCurrentDates={false}
        datesSet={(n) => {
          setCalendarView(n.view.type);
          const newDate = n.view.calendar.getDate();
          updateCalendarURL(newDate);
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
