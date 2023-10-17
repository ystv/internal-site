import YSTVCalendar from "@/components/YSTVCalendar";
import Link from "next/link";
import { PermissionGate } from "@/components/UserContext";
import {
  listEventsForMonth,
  listVacantEvents,
} from "@/features/calendar/events";
import { Alert, Button } from "@mantine/core";
import { Permission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/server";
import { TbArticle, TbCalendarEvent, TbClipboardList } from "react-icons/tb";

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
  const date = new Date(year, month, day);
  const me = await getCurrentUser();

  const filter = searchParams.filter;

  const vacantEvents = await listVacantEvents({
    role: undefined,
  });
  const vacantEventsCount = vacantEvents.signUpRolesCount;

  let events;
  switch (filter) {
    case "my":
      events = await listEventsForMonth(year, month, me.user_id);
      break;
    case "vacant":
      events = vacantEvents.events;
      break;
    default:
      events = await listEventsForMonth(year, month);
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
    "Calendar.Show.Admin",
    "Calendar.Social.Creator",
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
        selectedDate={date}
        selectedFilter={filter}
        selectedView={searchParams.view}
      />
    </>
  );
}
