"use client";

import { Button } from "@mantine/core";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { TbCalendarMinus, TbCalendarPlus, TbCalendarX } from "react-icons/tb";

import { updateRecurringAttendeeStatus } from "@/app/(authenticated)/calendar/[eventID]/actions";
import type { RecurringEventObjectType } from "@/features/calendar";
import type { UserType } from "@/lib/auth/core";

export function AddRecurringToCalendar({
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
  const [[subscribed, brownout], setSubscribed] = useState<[boolean, boolean]>([
    recurring_event.attendees.some((u) => u.user_id === me.user_id),
    false,
  ]);

  if (brownout) {
    setTimeout(() => setSubscribed([subscribed, false]), 3 * 1000);
  }

  function handleClick(new_state: boolean) {
    updateRecurringAttendeeStatus(
      recurring_event!.recurring_event_id,
      new_state ? "invited" : "unknown",
    ).then((result) => {
      if (!result.ok) {
        setSubscribed([!new_state, true]);
      } else {
        setSubscribed([new_state, false]);
      }
    });
  }

  return (
    <>
      {brownout ? (
        <Button
          className={"float-right"}
          variant={"light"}
          color={"orange"}
          leftSection={<TbCalendarX />}
          onClick={() => handleClick(!subscribed)}
        >
          Failed to add to calendar
        </Button>
      ) : !subscribed ? (
        <Button
          className={"float-right"}
          variant={"filled"}
          color={"blue"}
          leftSection={<TbCalendarPlus />}
          onClick={() => handleClick(!subscribed)}
        >
          Add all to Personal Calendar
        </Button>
      ) : (
        <Button
          className={"float-right"}
          variant={"outline"}
          color={"red"}
          leftSection={<TbCalendarMinus />}
          onClick={() => handleClick(!subscribed)}
        >
          Remove all from Personal Calendar
        </Button>
      )}
    </>
  );
}
