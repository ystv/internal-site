"use client";
import { EventObjectType } from "@/features/calendar";
import { useRef } from "react";
import { getUserName } from "@/components/UserCommon";
import { updateAttendeeStatus } from "@/app/calendar/[eventID]/actions";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import type { UserType } from "@/lib/auth/server";

export function CurrentUserAttendeeRow({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  const myAttendee = event.attendees.find((att) => att.user_id === me.id);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <td>{getUserName(me)}</td>
      <td>
        <form action={updateAttendeeStatus} ref={formRef}>
          <input
            type="hidden"
            name="event_id"
            value={event.event_id.toString(10)}
          />
          <select
            name="status"
            defaultValue={myAttendee?.attend_status ?? "unknown"}
            onChange={() => formRef.current?.submit()}
          >
            {Object.entries(AttendStatusLabels)
              .filter(([k]) => k !== "invited")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </form>
      </td>
    </>
  );
}
