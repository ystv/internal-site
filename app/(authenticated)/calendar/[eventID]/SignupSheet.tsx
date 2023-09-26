"use client";

import { isBefore, isSameDay } from "date-fns";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getUserName } from "@/components/UserHelpers";
import type { UserType } from "@/lib/auth/server";
import invariant from "tiny-invariant";
import {
  createAdamRMSProject,
  createSignUpSheet,
  deleteSignUpSheet,
  editSignUpSheet,
  removeSelfFromRole,
  signUpToRole,
} from "@/app/(authenticated)/calendar/[eventID]/actions";
import { Button, Modal } from "@mantine/core";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { formatDateTime, formatTime } from "@/components/DateTimeHelpers";
import { AddEditSignUpSheetForm } from "@/app/(authenticated)/calendar/[eventID]/AddEditSignUpSheetForm";
import { CrewType, SignUpSheetType } from "@/features/calendar/signup_sheets";
import { EventObjectType } from "@/features/calendar/events";
import { ExposedUser } from "@/features/people";
import Image from "next/image";
import AdamRMSLogo from "@/app/_assets/adamrms-logo.png";

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
  const [signUpCrew, setSignUpCrew] = useState<CrewType | null>(null);
  return (
    <>
      <div className="flex-grow-1 m-4 w-full rounded-xl border-2 border-solid border-gray-900 p-4 lg:w-auto lg:flex-grow-0">
        <h2>{sheet.title}</h2>
        <strong>Arrive at {formatTime(sheet.arrival_time)}</strong>
        <br />
        <strong>
          Broadcast at {formatTime(sheet.start_time)} -{" "}
          {isSameDay(sheet.start_time, sheet.end_time)
            ? formatTime(sheet.end_time)
            : formatDateTime(sheet.end_time)}
        </strong>
        <p>{sheet.description}</p>
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
                    {crew.user_id === me.user_id ? (
                      <strong>
                        {crew.positions?.name ?? <em>Unknown Role</em>}
                      </strong>
                    ) : (
                      crew.positions?.name ?? <em>Unknown Role</em>
                    )}
                  </td>
                  {crew.users ? (
                    <td>
                      {crew.user_id === me.user_id ? (
                        <button
                          className="rounded-md border-none bg-gray-100 px-2 py-0.5 italic hover:bg-blue-400"
                          onClick={() => setSignUpCrew(crew)}
                        >
                          <strong>{getUserName(crew.users)}</strong>
                        </button>
                      ) : (
                        getUserName(crew.users)
                      )}
                    </td>
                  ) : locked || crew.locked ? (
                    <td>
                      <em>Locked</em>
                    </td>
                  ) : (
                    <td>
                      <button
                        className="rounded-md border-none bg-gray-100 px-2 py-0.5 italic hover:bg-blue-400"
                        onClick={() => setSignUpCrew(crew)}
                      >
                        Vacant
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>

        {canManageSignUpSheet(event, sheet, me) && (
          <>
            <br />
            <div className={"flex gap-1"}>
              <Button size="small" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button
                variant="danger"
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
          </>
        )}
      </div>
      <Modal opened={isEditOpen} onClose={() => setEditOpen(false)}>
        <AddEditSignUpSheetForm
          action={async (data) => editSignUpSheet(sheet.signup_id, data)}
          onSuccess={() => setEditOpen(false)}
          initialValues={sheet}
          submitLabel="Save"
        />
      </Modal>
      <Modal opened={signUpCrew !== null} onClose={() => setSignUpCrew(null)}>
        {signUpCrew !== null && (
          <MyRoleSignUpModal
            sheet={sheet}
            crew={signUpCrew}
            me={me}
            onSuccess={() => setSignUpCrew(null)}
          />
        )}
      </Modal>
    </>
  );
}

function MyRoleSignUpModal({
  sheet,
  crew,
  onSuccess,
  me,
}: {
  sheet: SignUpSheetType;
  crew: CrewType;
  onSuccess: () => void;
  me: ExposedUser;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <h1 className="text-4xl">{crew.positions.name}</h1>
      <p>
        {crew.positions.full_description ||
          "If this role had a description, it'd go here."}
      </p>
      {error && <strong className="text-danger">{error}</strong>}
      <div>
        {crew.user_id === me.user_id ? (
          <Button
            size="large"
            variant="danger"
            onClick={async () => {
              const res = await removeSelfFromRole(
                sheet.signup_id,
                crew.crew_id,
              );
              if (!res.ok) {
                setError(res.errors!.root as string);
                return;
              }
              onSuccess();
            }}
          >
            Drop Out
          </Button>
        ) : (
          <Button
            size="large"
            onClick={async () => {
              const res = await signUpToRole(sheet.signup_id, crew.crew_id);
              if (!res.ok) {
                setError(res.errors!.root as string);
                return;
              }
              onSuccess();
            }}
          >
            Sign Up
          </Button>
        )}
      </div>
    </div>
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
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setCreateOpen] = useState(false);
  return (
    <>
      <div className="flex flex-row flex-wrap space-x-4">
        {event.signup_sheets.length === 0 && (
          <div className="my-8">
            <p>No sign-up sheets yet.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="my-1 rounded-md px-4 py-2 font-bold shadow-md"
            >
              Create one
            </button>
          </div>
        )}
        {event.signup_sheets.map((ss) => (
          <SignupSheet key={ss.signup_id} event={event} sheet={ss} me={me} />
        ))}
      </div>
      {canManage(event, me) && (
        <Button onClick={() => setCreateOpen(true)}>Add Sign-Up Sheet</Button>
      )}
      <Modal opened={isCreateOpen} onClose={() => setCreateOpen(false)}>
        <AddEditSignUpSheetForm
          action={async (sheet) => createSignUpSheet(event.event_id, sheet)}
          onSuccess={() => setCreateOpen(false)}
        />
      </Modal>
    </>
  );
}
