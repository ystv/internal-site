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
import { ActionIcon, Menu, Select, Loader } from "@mantine/core";
import { useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import { TbCheck, TbFilter } from "react-icons/tb";
import findLast from "core-js-pure/stable/array/find-last";
import { useUserPreferences } from "./UserContext";

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
  const academicYear = findLast(
    academicYears,
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
  selectedView: selectedView,
}: {
  events: Event[];
  selectedDate: Date;
  selectedFilter?: string;
  selectedView?: string;
}) {
  const currentDate = new Date();

  const router = useRouter();
  const prefs = useUserPreferences();

  const isMobileView = useMediaQuery("(max-width: 650px)", undefined, {
    getInitialValueInEffect: true,
  });

  const initialView =
    selectedView ?? (isMobileView ? "dayGridWeek" : "dayGridMonth");

  const calendarRef = useRef<FullCalendar>(null);

  const viewsList = [
    { value: "dayGridMonth", label: "Month" },
    { value: "dayGridWeek", label: "Week" },
    { value: "listMonth", label: "List" },
    { value: "timeGridDay", label: "Day" },
  ];

  const updateCalendarURL = ({
    newDate,
    newFilter,
    newView,
  }: {
    newDate?: Date;
    newFilter?: String;
    newView?: String;
  }) => {
    const date = newDate ?? selectedDate;
    const view = newView ?? initialView;
    const filter = newFilter ?? selectedFilter;
    router.push(
      `/calendar?year=${date.getFullYear()}&month=${
        date.getMonth() + 1
      }&day=${date.getDate()}${!view || view === "all" ? "" : `&view=${view}`}${
        !filter || filter === "all" ? "" : `&filter=${filter}`
      }`,
    );
  };

  if (isMobileView === undefined)
    return (
      <div className={"flex w-full justify-center"}>
        <Loader />
      </div>
    );

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
              onClick={() => updateCalendarURL({ newFilter: "all" })}
            >
              All
            </Menu.Item>
            <Menu.Item
              {...(selectedFilter == "vacant" && {
                leftSection: <TbCheck />,
                disabled: true,
              })}
              onClick={() => updateCalendarURL({ newFilter: "vacant" })}
            >
              Vacant
            </Menu.Item>
            <Menu.Item
              {...(selectedFilter == "my" && {
                leftSection: <TbCheck />,
                disabled: true,
              })}
              onClick={() => updateCalendarURL({ newFilter: "my" })}
            >
              My
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {isMobileView && calendarRef.current && (
          <Select
            label="Calendar View"
            className={"text-right [&_input]:select-none [&_input]:text-right"}
            styles={{
              input: {
                userSelect: "none",
              },
            }}
            data={viewsList}
            value={initialView}
            onChange={(e) => {
              e && calendarRef.current?.getApi().changeView(e);
            }}
            autoComplete="off"
          />
        )}
      </div>
      <br />
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={initialView}
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
          // As each calendar view we use at the moment represents a different duration of time
          // (day week month), this means the date range for each is different. So, this handler
          // is called when the date range changes anyway, but also when the view changes.
          //
          // However, this could change in-future (depending on FullCalendar or the durations of
          // any future views we add), consider restoring viewDidMount handler if problems arise.
          const newDate = n.view.calendar.getDate();
          updateCalendarURL({ newDate: newDate, newView: n.view.type });
        }}
        titleFormat={{
          year: "numeric",
          month: isMobileView ? "short" : "long",
        }}
        firstDay={1}
        eventTimeFormat={(v) => {
          if (prefs.timeFormat === "12hr") {
            let hour = v.date.hour % 12;
            if (hour === 0) hour = 12;
            if (v.date.minute === 0) {
              return hour.toString() + (v.date.hour < 12 ? "am" : "pm");
            }
            return (
              hour.toString() +
              ":" +
              v.date.minute.toString().padStart(2, "0") +
              (v.date.hour < 12 ? "am" : "pm")
            );
          }
          return (
            v.date.hour.toString().padStart(2, "0") +
            ":" +
            v.date.minute.toString().padStart(2, "0")
          );
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
            ? (day) => {
                if (day.view.type == "timeGridDay") return;
                return day.date.toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                });
              }
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
                weekday: "narrow",
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
          if (!info.jsEvent.ctrlKey && !info.jsEvent.metaKey) {
            info.jsEvent.preventDefault();
            if (info.event.url) {
              router.push(info.event.url);
            }
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
          if (evt.end_date < currentDate) {
            eventObject.className += " opacity-50";
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
