"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

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

export function DateTime({
  val,
  format: formatIn,
}: {
  val: string;
  format?: "date" | "time" | "datetime";
}) {
  const format = formatIn ?? "datetime";
  const [visible, setVisible] = useState(false);
  const [formatted, setFormatted] = useState(() =>
    // We initially render the UTC value to avoid a hydration mismatch
    // (using toLocaleString would render in the server's timezone).
    new Date(val).toUTCString(),
  );
  useEffect(() => {
    // Once we know the client's timezone and locale,
    // we can render the date in the user's timezone.
    setFormatted(
      new Date(val).toLocaleString("en-GB", {
        dateStyle:
          format === "date" || format === "datetime" ? "short" : undefined,
        timeStyle:
          format === "time" || format === "datetime" ? "short" : undefined,
      }),
    );
    setVisible(true);
    console.log(val, format);
  }, [val, format]);
  return (
    // We initially render it with `visibility: hidden` to avoid showing the wrong value
    // while still avoiding a layout shift (unlike `display: none`)
    <time dateTime={val} className={visible ? "" : "invisible"}>
      {formatted}
    </time>
  );
}
