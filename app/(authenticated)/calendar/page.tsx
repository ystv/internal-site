import YSTVCalendar from "@/app/(authenticated)/calendar/YSTVCalendar";
import Link from "next/link";
import { PermissionGate } from "@/components/UserContext";
import { listVacantEvents } from "@/features/calendar/events";
import { Alert, Button } from "@mantine/core";
import { Permission } from "@/lib/auth/permissions";
import { mustGetCurrentUser } from "@/lib/auth/server";
import { TbArticle, TbCalendarEvent } from "react-icons/tb";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { fetchEvents } from "./actions";
import { calendarEventsQueryKey } from "./helpers";
import EventColoursKey from "@/components/EventColoursKey";

export default async function CalendarPage() {
  await mustGetCurrentUser();

  const now = new Date();

  const qc = new QueryClient();
  // Prefetch the "most likely" initial load state, that being the current month.
  // The client may immediately trigger another fetch if its view state is different.
  await qc.prefetchQuery({
    queryKey: calendarEventsQueryKey({
      year: now.getFullYear(),
      month: now.getMonth(),
      filter: "all",
    }),
    queryFn: (args) => fetchEvents(args.queryKey[1]),
  });

  const vacantEvents = await listVacantEvents({
    role: undefined,
  });
  const vacantEventsCount = vacantEvents.signUpRolesCount;

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
    <HydrationBoundary state={dehydrate(qc)}>
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
      <YSTVCalendar />
      <EventColoursKey />
    </HydrationBoundary>
  );
}
