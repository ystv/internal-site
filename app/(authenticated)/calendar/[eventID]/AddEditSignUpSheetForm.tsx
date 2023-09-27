import { z } from "zod";
import {
  CrewSchema,
  SignupSheetSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import Form, { FormResponse } from "@/components/Form";
import {
  ArrayField,
  CheckBoxField,
  DatePickerField,
  MemberSelect,
  NullableCheckboxField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useCrewPositions } from "@/components/FormFieldPreloadedData";
import { Fragment, useState } from "react";
import { useController } from "react-hook-form";
import { Select } from "@mantine/core";

function CrewPositionField(props: { parentName: string }) {
  const [isCustom, setIsCustom] = useState(false);
  const vals = useCrewPositions();
  const selectController = useController({
    name: `${props.parentName}.position_id`,
  });
  return isCustom ? (
    <TextField
      name={`${props.parentName}.custom_position_name`}
      placeholder="Enter crew position name"
    />
  ) : (
    <Select
      data={[
        ...vals.map((val) => ({
          label: val.name,
          value: val.position_id.toString(10),
        })),
        { label: "Custom", value: "$custom" },
      ]}
      value={selectController.field.value}
      onChange={(newValue) => {
        if (newValue === "$custom") {
          selectController.field.onChange("");
          setIsCustom(true);
          return;
        }
        selectController.field.onChange(newValue);
      }}
    />
  );
}

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
      initialValues={props.initialValues ?? { title: "Crew List" }}
      submitLabel={props.submitLabel}
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>
        {props.initialValues ? "Edit" : "New"} List
      </h1>
      <TextField
        name="title"
        label="Title"
        required
        placeholder={"Crew List"}
      />
      <TextAreaField name="description" label="Description" />
      <DatePickerField
        name="arrival_time"
        label="Arrival Time"
        required
        modal
      />
      <DatePickerField
        name="start_time"
        label="Broadcast Start"
        required
        modal
      />
      <DatePickerField name="end_time" label="Broadcast End" required modal />
      <br />
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
              <CrewPositionField parentName={`crews.${idx}`} />
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
