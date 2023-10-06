import YSTVCalendar from "@/components/YSTVCalendar";
import Link from "next/link";
import { PermissionGate } from "@/components/UserContext";
import { listEventsForMonth } from "@/features/calendar/events";
import { Button } from "@mantine/core";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; day?: string; view?: string };
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
  const events = await listEventsForMonth(year, month);
  return (
    <>
      <div className={"flex items-end justify-between"}>
        <h1 className={"text-4xl font-bold"}>YSTV Calendar</h1>
        <PermissionGate
          required={[
            "Calendar.Admin",
            "Calendar.Show.Admin",
            "Calendar.Show.Creator",
            "Calendar.Meeting.Admin",
            "Calendar.Meeting.Creator",
            "Calendar.Social.Admin",
            "Calendar.Social.Creator",
            "Calendar.Show.Admin",
            "Calendar.Social.Creator",
          ]}
        >
          <Button component={Link} href="/calendar/new" fz="md">
            Add Event
          </Button>
        </PermissionGate>
      </div>
      <br />
      <YSTVCalendar events={events} selectedDate={date} view={searchParams.view} />
    </>
  );
}
