"use client";

import {
  ActionIcon,
  Button,
  Divider,
  Modal,
  Paper,
  Select,
  Tooltip,
} from "@mantine/core";
import { isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbArticle, TbFilter, TbInfoCircle } from "react-icons/tb";

import { MyRoleSignUpModal } from "@/app/(authenticated)/calendar/[eventID]/SignupSheet";
import { type CrewPositionsTypeWithAvailability } from "@/app/(authenticated)/calendar/discover/page";
import { DateTime } from "@/components/DateTimeHelpers";
import { type CrewType, type EventObjectType } from "@/features/calendar";

export function DiscoverView({
  vacantRoles,
  crewPositions,
  position,
}: {
  vacantRoles: EventObjectType[];
  crewPositions: CrewPositionsTypeWithAvailability[];
  position?: number;
}) {
  const router = useRouter();

  const [roleInfoModal, setRoleInfoModal] = useState(false);

  const crewPosition = crewPositions.find(
    (val) => val.position_id === position,
  );

  return (
    <>
      <h1 className={"text-4xl font-bold"}>
        Vacant Roles{" - "}
        {crewPosition ? (
          <span className={"inline-flex align-top"}>
            {crewPosition.name}
            <Tooltip label="Role Info" position={"right"}>
              <ActionIcon
                variant="light"
                radius="xl"
                aria-label="Settings"
                className={"ml-2"}
                onClick={() => setRoleInfoModal(true)}
              >
                <TbInfoCircle />
              </ActionIcon>
            </Tooltip>
          </span>
        ) : (
          <span>All</span>
        )}
      </h1>
      <Select
        clearable
        searchable
        nothingFoundMessage="No positions found."
        placeholder={"Filter vacancies by type..."}
        defaultValue={position?.toString(10) ?? null}
        leftSection={<TbFilter />}
        data={crewPositions.map((val) => ({
          label: val.name,
          value: val.position_id.toString(10),
          disabled: !val.available,
        }))}
        onChange={(val) => {
          router.push(`/calendar/discover${val ? `?position=${val}` : ""}`);
        }}
        selectFirstOptionOnChange
        className={"mb-4 max-w-[15rem]"}
      />
      {vacantRoles.length === 0 && (
        <p className={"text-xl"}>
          <strong>
            Sorry, no vacant roles found - please check back later!
          </strong>
        </p>
      )}
      <div className={"flex flex-row flex-wrap gap-4"}>
        {vacantRoles
          // only show events with any of the selected position vacant
          .filter(
            (event) =>
              !position ||
              event.signup_sheets.some((signupSheet) =>
                signupSheet.crews.some(
                  (crew) => crew.positions.position_id === position,
                ),
              ),
          )
          .map((event) => (
            <Paper
              key={event.event_id}
              shadow="sm"
              radius="md"
              withBorder
              className="flex-grow-1 !flex w-full flex-col p-[var(--mantine-spacing-md)] md:w-[calc(50%-theme(gap.4)/2)] lg:flex-grow-0 lg:p-[var(--mantine-spacing-xl)]"
            >
              <h2 className={"m-0"}>{event.name}</h2>
              <p className={"m-0 mb-2 text-sm"}>
                <strong>
                  <DateTime
                    val={event.start_date.toISOString()}
                    format="datetime"
                  />
                  {" - "}
                  {isSameDay(event.start_date, event.end_date) ? (
                    <DateTime
                      val={event.end_date.toISOString()}
                      format="time"
                    />
                  ) : (
                    <DateTime
                      val={event.end_date.toISOString()}
                      format="datetime"
                    />
                  )}
                </strong>
              </p>
              {event.description && (
                <p className={"m-0 text-sm"}>{event.description}</p>
              )}
              <Divider my="xs" label="Available Roles" labelPosition="center" />
              {event.signup_sheets
                .filter((sheet) => sheet.crews.length > 0)
                // only show signup sheets with any of the selected position vacant
                .filter(
                  (sheet) =>
                    !position ||
                    sheet.crews.some(
                      (crew) => crew.positions.position_id === position,
                    ),
                )
                .map((sheet) => (
                  <div key={sheet.signup_id}>
                    <h3 className={"m-0 text-lg"}>{sheet.title}</h3>
                    <p className={"m-0 text-xs"}>
                      <DateTime
                        val={sheet.arrival_time.toISOString()}
                        format="datetime"
                      />{" "}
                      -{" "}
                      {isSameDay(sheet.arrival_time, sheet.end_time) ? (
                        <DateTime
                          val={sheet.end_time.toISOString()}
                          format="time"
                        />
                      ) : (
                        <DateTime
                          val={sheet.end_time.toISOString()}
                          format="datetime"
                        />
                      )}
                    </p>
                    {sheet.crews
                      // only show crews with the selected position vacant
                      .filter(
                        (crew) =>
                          !position || crew.positions.position_id === position,
                      )
                      .map((crew) => (
                        <div key={crew.crew_id}>
                          <li className={"ml-6 text-base"}>
                            {crew.positions.name}
                          </li>
                        </div>
                      ))}
                  </div>
                ))}
              <div className={"flex grow items-end justify-end"}>
                <Button
                  onClick={() => router.push(`/calendar/${event.event_id}`)}
                  leftSection={<TbArticle />}
                >
                  Event Details
                </Button>
              </div>
            </Paper>
          ))}
      </div>
      <Modal opened={roleInfoModal} onClose={() => setRoleInfoModal(false)}>
        {crewPosition && (
          <MyRoleSignUpModal
            crew={{ positions: crewPosition } as CrewType}
            buttonless
          />
        )}
      </Modal>
    </>
  );
}
