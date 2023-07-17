"use client";

import { isBefore, isSameDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { getUserName } from "@/components/UserHelpers";
import type { UserType } from "@/lib/auth/server";
import invariant from "tiny-invariant";
import {
  createSignUpSheet,
  deleteSignUpSheet,
  editSignUpSheet,
} from "@/app/calendar/[eventID]/actions";
import Modal from "react-modal";
import Button from "@/components/Button";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { formatDateTime, formatTime } from "@/components/DateTimeHelpers";
import { AddEditSignUpSheetForm } from "@/app/calendar/[eventID]/AddEditSignUpSheetForm";
import { SignUpSheetType } from "@/features/calendar/signup_sheets";
import { EventObjectType } from "@/features/calendar/events";

function SignupSheet({
  event,
  me,
  sheet,
}: {
  event: EventObjectType;
  sheet: SignUpSheetType;
  me: UserType;
}) {
  const locked = useMemo(
    () => sheet.unlock_date && isBefore(new Date(), sheet.unlock_date),
    [sheet.unlock_date],
  );
  const [isEditOpen, setEditOpen] = useState(false);
  return (
    <>
      <div className="m-4 flex-grow-0 border-2 border-gray-900 p-4">
        <h2 className="text-lg font-bold">{sheet.title}</h2>
        <p>{sheet.description}</p>
        <p>Arrive at {formatTime(sheet.arrival_time)}</p>
        <p>
          Broadcast at {formatTime(sheet.start_time)} -{" "}
          {isSameDay(sheet.start_time, sheet.end_time)
            ? formatTime(sheet.end_time)
            : formatDateTime(sheet.end_time)}
        </p>
        {locked && (
          <p>
            <strong>
              Sign-ups unlock on {formatDateTime(sheet.unlock_date!)}
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
                      <button className="rounded-md bg-gray-100 px-2 py-0.5 italic hover:bg-blue-400">
                        Vacant
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>

        {canManageSignUpSheet(event, sheet, me) && (
          <div>
            <Button
              color="light"
              size="small"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              color="danger"
              size="small"
              onClick={async () => {
                if (confirm("You sure?")) {
                  await deleteSignUpSheet(sheet.signup_id);
                }
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      <Modal isOpen={isEditOpen} onRequestClose={() => setEditOpen(false)}>
        <AddEditSignUpSheetForm
          action={async (data) => editSignUpSheet(sheet.signup_id, data)}
          onSuccess={() => setEditOpen(false)}
          initialValues={sheet}
          submitLabel="Save"
        />
      </Modal>
    </>
  );
}

export function SignupSheetsView({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  invariant(event.signup_sheets, "no signup_sheets for SignupSheetsView");
  const [isCreateOpen, setCreateOpen] = useState(false);
  useEffect(() => {
    Modal.setAppElement(document.querySelector("main")!);
  }, []);
  return (
    <>
      <div className="flex flex-row flex-wrap space-x-4">
        {event.signup_sheets.length === 0 && (
          <div>
            <p>No sign-up sheets yet.</p>
            <button onClick={() => setCreateOpen(true)}>Create one</button>
          </div>
        )}
        {event.signup_sheets.map((ss) => (
          <SignupSheet key={ss.signup_id} event={event} sheet={ss} me={me} />
        ))}
      </div>
      {canManage(event, me) && (
        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-lg font-bold">Actions</h3>
          <Button>Edit Event</Button>
          <Button onClick={() => setCreateOpen(true)}>Add Sign-Up Sheet</Button>
          <Button color="warning">Cancel Event</Button>
          <Button color="danger">Delete Event</Button>
        </div>
      )}
      <Modal isOpen={isCreateOpen} onRequestClose={() => setCreateOpen(false)}>
        <AddEditSignUpSheetForm
          action={async (sheet) => createSignUpSheet(event.event_id, sheet)}
          onSuccess={() => setCreateOpen(false)}
        />
      </Modal>
    </>
  );
}
