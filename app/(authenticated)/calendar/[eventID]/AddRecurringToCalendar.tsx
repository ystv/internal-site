"use client";

import { Button } from "@mantine/core";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { TbCalendarMinus, TbCalendarPlus } from "react-icons/tb";

import { updateRecurringAttendeeStatus } from "@/app/(authenticated)/calendar/[eventID]/actions";
import type { RecurringEventObjectType } from "@/features/calendar";
import type { UserType } from "@/lib/auth/core";

export default function AddReccuringToCalendar({
  eventPromise,
  me,
}: {
  eventPromise: Promise<RecurringEventObjectType | null>;
  me: UserType;
}) {
  const recurring_event = use(eventPromise);
  if (!recurring_event) {
    notFound();
  }
  const [subscribed, setSubscribed] = useState<boolean>(
    recurring_event.attendees.some((u) => u.user_id === me.user_id),
  );

  useEffect(() => {
    updateRecurringAttendeeStatus(
      recurring_event!.recurring_event_id,
      subscribed ? "invited" : "unknown",
    );
  }, [subscribed, recurring_event]);
  return (
    <>
      {!subscribed ? (
        <Button
          className={"float-right"}
          variant={"filled"}
          color={"blue"}
          leftSection={<TbCalendarPlus />}
          onClick={() => setSubscribed(!subscribed)}
        >
          Add all to Calendar
        </Button>
      ) : (
        <Button
          className={"float-right"}
          variant={"outline"}
          color={"red"}
          leftSection={<TbCalendarMinus />}
          onClick={() => setSubscribed(!subscribed)}
        >
          Remove all from Calendar
        </Button>
      )}
    </>
  );
}
