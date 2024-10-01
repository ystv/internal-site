import YSTVCalendar from "@/components/YSTVCalendar";
import Link from "next/link";
import { PermissionGate } from "@/components/UserContext";
import { listEvents, listVacantEvents } from "@/features/calendar/events";
import { Alert, Button } from "@mantine/core";
import { Permission } from "@/lib/auth/permissions";
import { mustGetCurrentUser } from "@/lib/auth/server";
import { TbArticle, TbCalendarEvent } from "react-icons/tb";
import invariant from "@/lib/invariant";
import { add, setDay } from "date-fns";
import { Suspense } from "react";

function dateRangeForView(
  year: number,
  month: number,
  day: number,
  view?: string,
): [Date, Date] {
  // These are just starting points, they'll shift depending on the view
  let start = new Date(year, month, day);
  let end = new Date(year, month, day);

  switch (view) {
    case "dayGridWeek":
      start = setDay(start, 1, { weekStartsOn: 1 });
      // set end to the next Monday because the query does a <, not a <=
      end = setDay(end, 1, { weekStartsOn: 1 });
      end = add(end, { days: 7 });
      break;
    case "timeGridDay":
      // add a day because the query does a <, not a <=
      end = add(end, { days: 1 });
      break;
    case "dayGridMonth":
    case "listMonth":
    case undefined:
      // JavaScript dates are 0-indexed, but humans think in 1-indexed
      // months, so we have to add 1 here
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 1);
      break;
    default:
      invariant(false, `Unknown calendar view ${view}`);
  }

  return [start, end];
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: {
    year?: string;
    month?: string;
    day?: string;
    view?: string;
    filter?: string;
  };
}) {
  const now = new Date();
  const year = searchParams.year
    ? parseInt(searchParams.year, 10)
    : now.getFullYear();
  const month = searchParams.month
    ? parseInt(searchParams.month, 10) - 1
    : now.getMonth();
  const day = searchParams.day ? parseInt(searchParams.day, 10) : now.getDate();
  const selectedDay = new Date(year, month, day);

  const me = await mustGetCurrentUser();

  const filter = searchParams.filter;

  const vacantEvents = await listVacantEvents({
    role: undefined,
  });
  const vacantEventsCount = vacantEvents.signUpRolesCount;

  const [start, end] = dateRangeForView(year, month, day, searchParams.view);
  let events;
  switch (filter) {
    case "my":
      events = await listEvents(start, end, me.user_id);
      break;
    case "vacant":
      events = vacantEvents.events;
      break;
    default:
      events = await listEvents(start, end);
      break;
  }

  const calendarEditPermissions: Permission[] = [
    "Calendar.Admin",
    "Calendar.Show.Admin",
    "Calendar.Show.Creator",
    "Calendar.Meeting.Admin",
    "Calendar.Meeting.Creator",
    "Calendar.Social.Admin",
    "Calendar.Social.Creator",
    "Calendar.Public.Admin",
    "Calendar.Public.Creator",
  ];

  return (
    <>
      {vacantEventsCount > 0 && (
        <Alert
          variant={"outline"}
          title="Vacant Roles"
          icon={<TbCalendarEvent />}
        >
          <p>
            There {vacantEventsCount == 1 ? "is" : "are"} still{" "}
            {vacantEventsCount} role{vacantEventsCount == 1 ? "" : "s"} vacant
            for upcoming events.
          </p>
          <Button
            component={Link}
            href="/calendar/discover"
            className={"float-right"}
            leftSection={<TbArticle />}
          >
            Discover Free Roles
          </Button>
        </Alert>
      )}
      <div className={"flex items-end justify-between"}>
        <h1 className={"text-4xl font-bold"}>YSTV Calendar</h1>
        <PermissionGate required={calendarEditPermissions}>
          <Button component={Link} href="/calendar/new" fz="md">
            Add Event
          </Button>
        </PermissionGate>
      </div>
      <PermissionGate required={calendarEditPermissions}>
        <br />
      </PermissionGate>
      <YSTVCalendar
        events={events}
        selectedDate={selectedDay}
        selectedFilter={filter}
        selectedView={searchParams.view}
      />
    </>
  );
}
