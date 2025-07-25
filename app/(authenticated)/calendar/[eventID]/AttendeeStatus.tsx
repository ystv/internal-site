"use client";
import { NativeSelect } from "@mantine/core";
import { useTransition } from "react";

import { updateAttendeeStatus } from "@/app/(authenticated)/calendar/[eventID]/actions";
import Spinner from "@/components/Spinner";
import { getUserName } from "@/components/UserHelpers";
import { type EventObjectType } from "@/features/calendar/events";
import {
  type AttendStatus,
  AttendStatusLabels,
} from "@/features/calendar/statuses";
import type { UserType } from "@/lib/auth/server";

export function CurrentUserAttendeeRow({
  event,
  me,
  readOnly,
}: {
  event: EventObjectType;
  me: UserType;
  readOnly?: boolean;
}) {
  const myAttendee = event.attendees.find((att) => att.user_id === me.user_id);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <td>{getUserName(me)}</td>
      <td>
        <NativeSelect
          name="status"
          defaultValue={myAttendee?.attend_status ?? "unknown"}
          onChange={(e) => {
            startTransition(async () => {
              await updateAttendeeStatus(
                event.event_id,
                e.target.value as AttendStatus,
              );
            });
          }}
          disabled={isPending || readOnly}
          className="inline-block"
        >
          {Object.entries(AttendStatusLabels)
            .filter(([k]) => k !== "invited")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </NativeSelect>
        {isPending && <Spinner />}
      </td>
    </>
  );
}
