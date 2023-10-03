"use client";

import { isBefore, isSameDay } from "date-fns";
import { useMemo, useState, useTransition } from "react";
import { getUserName } from "@/components/UserHelpers";
import type { UserType } from "@/lib/auth/server";
import invariant from "@/lib/invariant";
import { Button, Modal, Paper } from "@mantine/core";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { DateTime } from "@/components/DateTimeHelpers";
import { AddEditSignUpSheetForm } from "@/app/(authenticated)/calendar/[eventID]/AddEditSignUpSheetForm";
import { CrewType, SignUpSheetType } from "@/features/calendar/signup_sheets";
import { EventObjectType } from "@/features/calendar/events";
import { ExposedUser } from "@/features/people";
import {
  createSignUpSheet,
  deleteSignUpSheet,
  editSignUpSheet,
  removeSelfFromRole,
  signUpToRole,
} from "@/app/(authenticated)/calendar/[eventID]/signUpSheetActions";

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
  const readOnly = event.is_cancelled;
  const [isEditOpen, setEditOpen] = useState(false);
  const [signUpCrew, setSignUpCrew] = useState<CrewType | null>(null);
  return (
    <>
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        className="flex-grow-1 w-full p-[var(--mantine-spacing-md)] md:w-[calc(50%-theme(gap.4)/2)] lg:flex-grow-0 lg:p-[var(--mantine-spacing-xl)]"
      >
        <h2 className={"m-0"}>{sheet.title}</h2>
        <strong className={"text-sm font-extrabold"}>
          Arrive at{" "}
          <DateTime val={sheet.arrival_time.toISOString()} format="time" />
        </strong>
        <br />
        <strong className={"text-sm font-extrabold"}>
          Broadcast at{" "}
          <DateTime val={sheet.start_time.toISOString()} format="datetime" /> -{" "}
          {isSameDay(sheet.start_time, sheet.end_time) ? (
            <DateTime val={sheet.end_time.toISOString()} format="time" />
          ) : (
            <DateTime val={sheet.end_time.toISOString()} format="datetime" />
          )}
        </strong>
        <div className={"max-w-prose text-sm"}>
          {sheet.description.split(/(\r\n|\r|\n)/g).map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        {locked && (
          <p>
            <strong>
              Crew lists unlock on{" "}
              <DateTime
                val={sheet.unlock_date!.toISOString()}
                format="datetime"
              />
            </strong>
          </p>
        )}
        <table className="mt-4 border-collapse">
          <tbody
            className={"divide-x-0 divide-y-2 divide-dashed divide-gray-200"}
          >
            {sheet.crews
              .sort((a, b) => a.ordering - b.ordering)
              .map((crew, index) => (
                <tr
                  key={crew.crew_id}
                  className={
                    "divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold"
                  }
                >
                  <td className="px-3">
                    {crew.user_id === me.user_id ? (
                      <strong>
                        {crew.positions?.name ?? <em>Unknown Role</em>}
                      </strong>
                    ) : (
                      crew.positions?.name ?? <em>Unknown Role</em>
                    )}
                  </td>
                  <td
                    className={
                      "px-3 py-1 [&_.mantine-Button-label]:whitespace-normal [&_button]:text-left"
                    }
                  >
                    {crew.user_id === me.user_id ? (
                      <Button
                        onClick={() => setSignUpCrew(crew)}
                        variant={"light"}
                        fullWidth
                        className={
                          "!h-auto min-h-[var(--button-height)] !select-text"
                        }
                        justify={"left"}
                        disabled={readOnly}
                      >
                        <strong>
                          {getUserName(crew.users!) ?? "Unknown Member"}
                        </strong>
                      </Button>
                    ) : crew.users || crew.custom_crew_member_name ? (
                      <Button
                        variant={"transparent"}
                        fullWidth
                        component={"div"}
                        className={
                          "!flex !h-auto min-h-[var(--button-height)] !cursor-default !select-text items-center !text-left active:!transform-none"
                        }
                        justify={"left"}
                        color={"black"}
                        disabled={readOnly}
                      >
                        {crew.users
                          ? getUserName(crew.users)
                          : crew.custom_crew_member_name}
                      </Button>
                    ) : locked || crew.locked ? (
                      <Button
                        variant={"transparent"}
                        fullWidth
                        className={
                          "!h-auto min-h-[var(--button-height)] !cursor-default !select-text active:!transform-none"
                        }
                        justify={"left"}
                        disabled
                        role={"presentation"}
                      >
                        Locked
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setSignUpCrew(crew)}
                        variant={"outline"}
                        fullWidth
                        className={
                          "!h-auto min-h-[var(--button-height)] !select-text"
                        }
                        justify={"left"}
                        disabled={readOnly}
                      >
                        Vacant
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {canManageSignUpSheet(event, sheet, me) && (
          <>
            <br />
            <div className={"flex justify-end gap-1"}>
              <Button
                variant="danger"
                size="small"
                onClick={async () => {
                  if (
                    confirm(
                      `Are you sure you want to delete the list "${sheet.title}"? This action cannot be undone.`,
                    )
                  ) {
                    await deleteSignUpSheet(sheet.signup_id);
                  }
                }}
              >
                Delete List
              </Button>
              <Button size="small" onClick={() => setEditOpen(true)}>
                Edit List
              </Button>
            </div>
          </>
        )}
      </Paper>
      <Modal
        opened={isEditOpen}
        onClose={() => setEditOpen(false)}
        size={"95%"}
      >
        <AddEditSignUpSheetForm
          action={async (data) => editSignUpSheet(sheet.signup_id, data)}
          onSuccess={() => setEditOpen(false)}
          initialValues={sheet}
          submitLabel="Save"
        />
        <br />
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <h1 className="mt-0">{crew.positions.name}</h1>
      <p>{crew.positions.full_description}</p>
      {error && <strong className="text-danger">{error}</strong>}
      <div>
        {crew.user_id === me.user_id ? (
          <Button
            size="large"
            variant="danger"
            loading={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await removeSelfFromRole(
                  sheet.signup_id,
                  crew.crew_id,
                );
                if (!res.ok) {
                  setError(res.errors!.root as string);
                  return;
                }
                onSuccess();
              });
            }}
          >
            Drop Out
          </Button>
        ) : (
          <Button
            size="large"
            loading={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await signUpToRole(sheet.signup_id, crew.crew_id);
                if (!res.ok) {
                  setError(res.errors!.root as string);
                  return;
                }
                onSuccess();
              });
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
      {event.signup_sheets.length === 0 && (
        <h2 className={"py-8 text-center"}>
          No crew lists have been added yet.
        </h2>
      )}
      {canManage(event, me) && !event.is_cancelled && (
        <div className={"mx-auto text-right"}>
          <Button onClick={() => setCreateOpen(true)}>Add Crew List</Button>
          <br />
        </div>
      )}
      {event.signup_sheets.length != 0 && <br />}
      <div className="flex flex-row flex-wrap gap-4">
        {event.signup_sheets.map((ss) => (
          <SignupSheet key={ss.signup_id} event={event} sheet={ss} me={me} />
        ))}
      </div>
      <Modal
        opened={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        size={"95%"}
      >
        <AddEditSignUpSheetForm
          action={async (sheet) => createSignUpSheet(event.event_id, sheet)}
          onSuccess={() => setCreateOpen(false)}
        />
        <br />
      </Modal>
    </>
  );
}
