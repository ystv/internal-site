"use client";

import { isBefore, isSameDay } from "date-fns";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { getUserName } from "@/components/UserHelpers";
import type { UserType } from "@/lib/auth/server";
import invariant from "@/lib/invariant";
import {
  Alert,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  List,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { DateTime } from "@/components/DateTimeHelpers";
import { AddEditSignUpSheetForm } from "@/app/(authenticated)/calendar/[eventID]/AddEditSignUpSheetForm";
import {
  CrewType,
  SignUpSheetType,
  SignUpSheetWithEvent,
} from "@/features/calendar/signup_sheets";
import { EventObjectType } from "@/features/calendar/events";
import { ExposedUser } from "@/features/people";
import {
  checkRoleClashes,
  createSignUpSheet,
  deleteSignUpSheet,
  editSignUpSheet,
  fetchSignUpSheet,
  removeSelfFromRole,
  signUpToRole,
} from "@/app/(authenticated)/calendar/[eventID]/signUpSheetActions";
import { TbCalendarCheck } from "react-icons/tb";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebsocket } from "@/components/WebsocketProvider";

function SignupSheet({
  event,
  me,
  sheet,
}: {
  event: EventObjectType;
  sheet: SignUpSheetType;
  me: UserType;
}) {
  const [sheetState, setSheetState] = useState(sheet);

  const { socket, isConnected, transport } = useWebsocket();

  useEffect(() => {
    async function onSheetUpdate(value: any) {
      const res = await fetchSignUpSheet(sheet.signup_id);

      if (res) {
        setSheetState(res);
      }
    }

    socket.on(`signupSheetUpdate:${sheet.signup_id}`, onSheetUpdate);

    return () => {
      socket.off(`signupSheetUpdate:${sheet.signup_id}`, onSheetUpdate);
    };
  });

  const locked = useMemo(
    () =>
      sheetState.unlock_date && isBefore(new Date(), sheetState.unlock_date),
    [sheetState.unlock_date],
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
        <h2 className={"m-0"}>{sheetState.title}</h2>
        <strong className={"text-sm font-extrabold"}>
          Arrive at{" "}
          <DateTime val={sheetState.arrival_time.toISOString()} format="time" />
        </strong>
        <br />
        <strong className={"text-sm font-extrabold"}>
          Broadcast at{" "}
          <DateTime
            val={sheetState.start_time.toISOString()}
            format="datetime"
          />{" "}
          -{" "}
          {isSameDay(sheetState.start_time, sheetState.end_time) ? (
            <DateTime val={sheetState.end_time.toISOString()} format="time" />
          ) : (
            <DateTime
              val={sheetState.end_time.toISOString()}
              format="datetime"
            />
          )}
        </strong>
        <div className={"max-w-prose text-sm"}>
          {sheetState.description.split(/(\r\n|\r|\n)/g).map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        {locked && (
          <p>
            <strong>
              Crew lists unlock on{" "}
              <DateTime
                val={sheetState.unlock_date!.toISOString()}
                format="datetime"
              />
            </strong>
          </p>
        )}
        <table className="mt-4 border-collapse">
          <tbody
            className={
              "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
            }
          >
            {sheetState.crews
              .sort((a, b) => a.ordering - b.ordering)
              .map((crew, index) => {
                const isProducer = crew.positions.admin;

                return (
                  <tr
                    key={crew.crew_id}
                    className={`${
                      isProducer ? "!font-extrabold " : ""
                    }divide-x-2 divide-y-0 divide-dashed divide-gray-200 text-sm font-semibold dark:divide-[--mantine-color-placeholder]`}
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
                            "!h-auto min-h-[var(--button-height)] !select-text dark:data-[disabled='true']:!bg-[--mantine-color-gray-filled] dark:data-[disabled='true']:text-[#888]"
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
                            "!flex min-h-[var(--button-height)] !cursor-default !select-text items-center !text-left !text-[--mantine-color-default-color] active:!transform-none"
                          }
                          justify={"left"}
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
                );
              })}
          </tbody>
        </table>

        {canManageSignUpSheet(event, sheetState, me) && (
          <>
            <br />
            <div className={"flex justify-end gap-1"}>
              <Button
                variant="danger"
                size="small"
                onClick={async () => {
                  if (
                    confirm(
                      `Are you sure you want to delete the list "${sheetState.title}"? This action cannot be undone.`,
                    )
                  ) {
                    await deleteSignUpSheet(sheetState.signup_id);
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
          action={async (data) => editSignUpSheet(sheetState.signup_id, data)}
          onSuccess={() => setEditOpen(false)}
          initialValues={sheetState}
          submitLabel="Save"
        />
        <br />
      </Modal>
      <Modal opened={signUpCrew !== null} onClose={() => setSignUpCrew(null)}>
        {signUpCrew !== null && (
          <Suspense
            fallback={
              <Center>
                <Loader />
              </Center>
            }
          >
            <MyRoleSignUpModal
              sheet={sheetState}
              crew={signUpCrew}
              me={me}
              onSuccess={() => setSignUpCrew(null)}
            />
          </Suspense>
        )}
      </Modal>
    </>
  );
}

export function MyRoleSignUpModal({
  sheet,
  crew,
  onSuccess,
  me,
  buttonless,
}: {
  sheet?: SignUpSheetType;
  crew: CrewType;
  onSuccess?: () => void;
  me?: ExposedUser;
  buttonless?: boolean;
}) {
  const clashes = useQuery({
    queryKey: ["clashes", crew.signup_id],
    queryFn: () => checkRoleClashes(crew.signup_id),
  });
  const queryClient = useQueryClient();

  const [acceptClashes, setAcceptClashes] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <h1 className="mt-0">{crew.positions.name}</h1>
      <p>{crew.positions.full_description}</p>
      {error && <strong className="text-danger">{error}</strong>}
      {!buttonless && me && sheet && onSuccess && (
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
                  queryClient.invalidateQueries({
                    queryKey: ["clashes", crew.signup_id],
                  });
                  onSuccess();
                });
              }}
            >
              Drop Out
            </Button>
          ) : (
            <Stack>
              {clashes.isFetching && (
                <Center>
                  <Stack>
                    <Text>Checking for clashes...</Text>
                    <Center>
                      <Loader />
                    </Center>
                  </Stack>
                </Center>
              )}
              <ClashesView clashes={clashes.data} />
              {clashes.data && clashes.data.length !== 0 && (
                <Checkbox
                  label={"Accept clashes"}
                  onChange={(event) =>
                    setAcceptClashes(event.currentTarget.checked)
                  }
                />
              )}
              <Button
                size="large"
                loading={isPending || !clashes}
                onClick={() => {
                  startTransition(async () => {
                    const res = await signUpToRole(
                      sheet.signup_id,
                      crew.crew_id,
                    );
                    if (!res.ok) {
                      setError(res.errors!.root as string);
                      return;
                    }
                    queryClient.invalidateQueries({
                      queryKey: ["clashes", crew.signup_id],
                    });
                    onSuccess();
                  });
                }}
                disabled={clashes.data?.length !== 0 && !acceptClashes}
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </div>
      )}
    </div>
  );
}

function ClashesView({
  clashes,
}: {
  clashes: SignUpSheetWithEvent[] | undefined;
}) {
  return (
    <>
      {clashes && clashes.length > 0 && (
        <>
          <Text fw={700}>This role clashes with some of your other roles:</Text>
          <Stack>
            {clashes.map((clash) => {
              return (
                <Card key={clash.signup_id}>
                  <Stack gap={"xs"}>
                    <Group>
                      <Stack gap={0}>
                        <Text fw={700}>{clash.events.name}</Text>
                        <Text size="xs">{clash.title}</Text>
                      </Stack>
                      <Text size="xs" ml={"auto"}>
                        <DateTime
                          val={clash.arrival_time.toISOString()}
                          format="datetime"
                        />{" "}
                        -{" "}
                        <DateTime
                          val={clash.end_time.toISOString()}
                          format="datetime"
                        />
                      </Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      Role{clash.crews.length > 1 && "s"}:
                    </Text>
                    <List size="sm">
                      {clash.crews.map((crew) => {
                        return (
                          <List.Item key={crew.crew_id}>
                            {crew.positions.name}
                          </List.Item>
                        );
                      })}
                    </List>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </>
      )}
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
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setCreateOpen] = useState(false);
  return (
    <>
      {event.signup_sheets.length === 0 &&
        !event.is_cancelled &&
        dayjs(event.start_date).isAfter(new Date()) &&
        (event.created_by === me.user_id ? (
          // No need for this to be a canManageAnySignUpSheet, because there isn't one yet
          <Alert
            variant="light"
            color="blue"
            title="Event Created"
            icon={<TbCalendarCheck />}
          >
            <strong>Your event has been created! What&apos;s next?</strong>
            <p>
              Next, add a crew sheet so people can sign up. If you&apos;re not
              yet ready to have crew, you can lock it, but add at least the
              producer (you!) so people know who to contact.
            </p>
            <Button onClick={() => setCreateOpen(true)}>Add Crew List</Button>
          </Alert>
        ) : (
          <h2 className={"py-8 text-center"}>
            No crew lists have been added yet.
          </h2>
        ))}
      {canManage(event, me) &&
        !event.is_cancelled &&
        /* Expanded empty state above - avoid duplicate button */
        (event.signup_sheets.length !== 0 ||
          event.created_by !== me.user_id) && (
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
          initialValues={{
            arrival_time: event.start_date,
            start_time: event.start_date,
            end_time: event.end_date,
          }}
        />
        <br />
      </Modal>
    </>
  );
}
