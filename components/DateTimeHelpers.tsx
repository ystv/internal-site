import { format } from "date-fns";

/*
 * These helper functions are used to format dates and times in the UI.
 * Use these instead of toLocaleString() or toLocaleTimeString() to avoid
 * inconsistent hydration errors.
 */

export function formatDate(date: Date): string {
  return format(date, "dd/MM/yyyy");
}

export function formatTime(time: Date): string {
  return format(time, "h:mm aa");
}

export function formatDateTime(dt: Date): string {
  return format(dt, "dd/MM/yyyy h:mm aa");
}
