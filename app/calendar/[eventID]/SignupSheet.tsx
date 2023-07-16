"use client";

import { EventObjectType } from "@/features/calendar";
import { SignupSheetObjectType } from "@/features/calendar/signup_sheets";
import { isBefore } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { getUserName } from "@/components/UserCommon";
import type { UserType } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/server";
import invariant from "tiny-invariant";
import Form from "@/components/Form";
import { createSignUpSheet } from "@/app/calendar/[eventID]/actions";
import {
  DatePickerField,
  Field,
  NullableCheckboxField,
} from "@/components/FormFields";
import ReactModal from "react-modal";
import { SignupSheetSchema } from "@/app/calendar/[eventID]/schema";
import Button from "@/components/Button";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";

export default function SignupSheet({
  event,
  me,
  sheet,
}: {
  event: EventObjectType;
  sheet: SignupSheetObjectType;
  me: UserType;
}) {
  const locked = useMemo(
    () => sheet.unlock_date && isBefore(sheet.unlock_date, new Date()),
    [sheet.unlock_date],
  );
  return (
    <div className="m-4 flex-grow-0 border-2 border-gray-900 p-4">
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
          <Button color="light" size="small">
            Edit
          </Button>
          <Button color="danger" size="small">
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

function CreateSignUpSheetForm(props: {
  event: EventObjectType;
  onClose: () => void;
}) {
  return (
    <Form
      action={async (data) => {
        return await createSignUpSheet(
          props.event.event_id,
          // @ts-expect-error TODO: not sure why this is erroring
          data,
        );
      }}
      onSuccess={props.onClose}
      schema={SignupSheetSchema}
    >
      <Field name="title" label="Title" />
      <Field name="description" label="Description" as="textarea" />
      <DatePickerField
        name="arrival_time"
        label="Arrival Time"
        showTimeSelect
      />
      <DatePickerField
        name="start_time"
        label="Broadcast Start"
        showTimeSelect
      />
      <DatePickerField name="end_time" label="Broadcast End" showTimeSelect />
      <NullableCheckboxField
        name="unlock_date"
        checkboxLabel="Lock signups until a certain date?"
      >
        <DatePickerField name="unlock_date" label="Unlock Date" />
      </NullableCheckboxField>
    </Form>
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
    ReactModal.setAppElement(document.querySelector("main")!);
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
      <ReactModal
        isOpen={isCreateOpen}
        onRequestClose={() => setCreateOpen(false)}
      >
        <CreateSignUpSheetForm
          event={event}
          onClose={() => setCreateOpen(false)}
        />
      </ReactModal>
    </>
  );
}
