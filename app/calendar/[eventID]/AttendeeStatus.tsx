"use client";
import { EventObjectType } from "@/features/calendar";
import { useTransition } from "react";
import { getUserName } from "@/components/UserCommon";
import { updateAttendeeStatus } from "@/app/calendar/[eventID]/actions";
import { AttendStatus, AttendStatusLabels } from "@/features/calendar/statuses";
import Spinner from "@/components/Spinner";
import type { UserType } from "@/lib/auth/server";

export function CurrentUserAttendeeRow({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  const myAttendee = event.attendees.find((att) => att.user_id === me.user_id);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <td>{getUserName(me)}</td>
      <td>
        <select
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
          disabled={isPending}
          className="disabled:border-gray-400 disabled:text-gray-400"
        >
          {Object.entries(AttendStatusLabels)
            .filter(([k]) => k !== "invited")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        {isPending && <Spinner />}
      </td>
    </>
  );
}
