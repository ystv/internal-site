"use client";

import { EventObjectType } from "@/features/calendar";
import { User } from "@/lib/auth/legacy";
import { SignupSheetObjectType } from "@/features/calendar/signup_sheets";
import { isBefore } from "date-fns";
import { useMemo } from "react";
import { getUserName } from "@/components/UserCommon";

export default function SignupSheet({
  event,
  me,
  sheet,
}: {
  event: EventObjectType;
  sheet: SignupSheetObjectType;
  me: User;
}) {
  const locked = useMemo(
    () => sheet.unlock_date && isBefore(sheet.unlock_date, new Date()),
    [sheet.unlock_date],
  );
  return (
    <div className="m-4 p-4 border-2 border-gray-900 flex-grow-0">
      <h2 className="text-lg font-bold">{sheet.title}</h2>
      <p>{sheet.description}</p>
      {sheet.arrival_time && (
        <p>Arrive at {sheet.arrival_time.toLocaleTimeString()}</p>
      )}
      {sheet.start_time && (
        <p>
          Broadcast at {sheet.start_time.toLocaleTimeString()}
          {sheet.end_time && ` - ${sheet.end_time.toLocaleTimeString()}`}
        </p>
      )}
      {locked && (
        <p>
          <strong>
            Sign-ups unlock on {sheet.unlock_date!.toLocaleString()}
          </strong>
        </p>
      )}
      <table className="mt-2">
        <tbody>
          {sheet.crews
            .sort((a, b) => a.ordering - b.ordering)
            .map((crew) => (
              <tr key={crew.crew_id}>
                <td className="pr-2">
                  {crew.positions?.name ?? <em>Unknown Role</em>}
                </td>
                {crew.users ? (
                  <td>{getUserName(crew.users)}</td>
                ) : locked || crew.locked ? (
                  <td>
                    <em>Locked</em>
                  </td>
                ) : (
                  <td>
                    <button className="italic bg-gray-100 hover:bg-blue-400 py-0.5 px-2 rounded-md">
                      Vacant
                    </button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
