import { z } from "zod";
import {
  CrewSchema,
  SignupSheetSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import Form, { FormResponse } from "@/components/Form";
import {
  ArrayField,
  CheckBoxField,
  CrewPositionSelect,
  DatePickerField,
  MemberSelect,
  NullableCheckboxField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useCrewPositions } from "@/components/FormFieldPreloadedData";
import { Fragment } from "react";

export function AddEditSignUpSheetForm(props: {
  action: (data: z.infer<typeof SignupSheetSchema>) => Promise<FormResponse>;
  initialValues?: z.infer<typeof SignupSheetSchema>;
  onSuccess: () => void;
  submitLabel?: string;
}) {
  const positions = useCrewPositions();
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={SignupSheetSchema}
      initialValues={props.initialValues}
      submitLabel={props.submitLabel}
    >
      <TextField name="title" label="Title" />
      <TextAreaField name="description" label="Description" />
      <DatePickerField
        name="arrival_time"
        label="Arrival Time"
      />
      <DatePickerField
        name="start_time"
        label="Broadcast Start"
      />
      <DatePickerField
        name="end_time"
        label="Broadcast End"
      />
      <NullableCheckboxField
        name="unlock_date"
        checkboxLabel="Lock signups until a certain date?"
      >
        <DatePickerField name="unlock_date" label="Unlock Date" />
      </NullableCheckboxField>
      <h2 className="mt-4 text-2xl">Positions</h2>
      <div className="grid grid-cols-[1fr_1fr_auto_auto]">
        <ArrayField
          name="crews"
          newElement={(v) =>
            ({
              position_id: positions[0].position_id,
              ordering: v.length,
              locked: false,
              user_id: null,
            }) satisfies z.infer<typeof CrewSchema>
          }
          header={
            <>
              <div className="mb-4 font-bold">Position</div>
              <div className="font-bold">Locked</div>
              <div className="font-bold">User</div>
              <div className="font-bold" />
            </>
          }
        >
          {(row, idx, els) => (
            <Fragment key={row.id}>
              {row.crew_id ? (
                <input
                  type="hidden"
                  name={`crews.${idx}.crew_id`}
                  value={row.crew_id as string}
                />
              ) : null}
              <CrewPositionSelect name={`crews.${idx}.position_id`} />
              <div className="flex items-center justify-center">
                <CheckBoxField name={`crews.${idx}.locked`} />
              </div>
              <MemberSelect name={`crews.${idx}.user_id`} nullable />
              {els.remove}
            </Fragment>
          )}
        </ArrayField>
      </div>
    </Form>
  );
}
