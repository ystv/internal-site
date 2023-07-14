import { getCurrentUser } from "@/lib/auth/server";
import YSTVCalendar from "@/components/YSTVCalendar";
import Link from "next/link";
import { listEventsForMonth } from "@/features/calendar";
import { PermissionGate } from "@/components/PermissionsContext";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const now = new Date();
  const year = searchParams.year
    ? parseInt(searchParams.year, 10)
    : now.getFullYear();
  const month = searchParams.month
    ? parseInt(searchParams.month, 10) - 1
    : now.getMonth();
  const date = new Date(year, month, 1);
  const events = await listEventsForMonth(year, month);
  return (
    <div>
      <h1 className={"text-4xl"}>Calendar</h1>
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
        <Link
          href="/calendar/new"
          className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Event
        </Link>
      </PermissionGate>
      <YSTVCalendar events={events} selectedMonth={date} />
    </div>
  );
}
