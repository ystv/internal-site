import { getCurrentUser } from "@/lib/auth/legacy";
import YSTVCalendar from "@/components/YSTVCalendar";
import Link from "next/link";
import { listEventsForMonth } from "@/features/calendar";

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
      <YSTVCalendar events={events} selectedMonth={date} />
    </div>
  );
}
