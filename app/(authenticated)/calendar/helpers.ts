import { QueryKey } from "@tanstack/react-query";

export function calendarEventsQueryKey({
  year,
  month,
  filter,
}: {
  year: number;
  month: number;
  filter?: "all" | "mine" | "vacant";
}) {
  return ["fetchEvents", { year, month, filter }] as const satisfies QueryKey;
}
