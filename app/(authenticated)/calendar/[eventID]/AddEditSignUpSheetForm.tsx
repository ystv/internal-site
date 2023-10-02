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
import {
  useCrewPositions,
  useMembers,
} from "@/components/FormFieldPreloadedData";
import { Fragment, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Select } from "@mantine/core";
import { getUserName } from "@/components/UserHelpers";

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

function CrewMemberField(props: { parentName: string }) {
  const ctx = useFormContext();
  const [isCustom, setIsCustom] = useState(
    () => ctx.getValues(props.parentName)?.custom_crew_member_name?.length > 0,
  );
  const vals = useMembers();
  const controller = useController({
    name: `${props.parentName}.user_id`,
  });

  return isCustom ? (
    <TextField
      name={`${props.parentName}.custom_crew_member_name`}
      placeholder="Enter crew member name"
    />
  ) : (
    <Select
      data={[
        ...vals.map((val) => ({
          label: getUserName(val),
          value: val.user_id.toString(10),
        })),
        { label: "Custom", value: "$custom" },
      ]}
      value={controller.field.value}
      onChange={(newValue) => {
        if (newValue === "$custom") {
          controller.field.onChange("");
          setIsCustom(true);
          return;
        }
        controller.field.onChange(newValue);
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
      <div className="grid grid-cols-2 gap-y-1 md:grid-cols-[2fr_6rem_3fr_auto]">
        <ArrayField
          name="crews"
          newElement={(v) =>
            ({
              position_id: positions[0].position_id,
              ordering: v.length,
              locked: false,
              user_id: null,
              custom_crew_member_name: null,
            }) satisfies z.infer<typeof CrewSchema>
          }
          header={
            <>
              <div className="col-span-1 mb-4 hidden font-bold md:block">
                Position
              </div>
              <div className="col-span-1 hidden font-bold md:block">Locked</div>
              <div className="col-span-1 hidden font-bold md:block">User</div>
              <div className="col-span-1 hidden font-bold md:block" />
            </>
          }
        >
          {(row, idx, els) => {
            return (
              <Fragment key={row.id}>
                {row.crew_id ? (
                  <input
                    type="hidden"
                    name={`crews.${idx}.crew_id`}
                    value={row.crew_id as string}
                  />
                ) : null}
                <div
                  className={"col-span-2 md:col-span-1 md:!row-auto"}
                  style={{ gridRow: `${idx * 4 + 1} / ${idx * 4 + 2}` }}
                >
                  <CrewPositionField parentName={`crews.${idx}`} />
                </div>
                <div
                  className={
                    "col-span-1 flex items-center justify-center md:!row-auto"
                  }
                  style={{ gridRow: `${idx * 4 + 3} / ${idx * 4 + 4}` }}
                >
                  <p className={"my-0 mr-2 text-sm font-medium md:hidden"}>
                    Locked:
                  </p>
                  <CheckBoxField name={`crews.${idx}.locked`} />
                </div>
                <div
                  className={"col-span-2 md:col-span-1 md:!row-auto"}
                  style={{ gridRow: `${idx * 4 + 2} / ${idx * 4 + 3}` }}
                >
                  <CrewMemberField parentName={`crews.${idx}`} />
                </div>
                {els.remove}
                <div
                  className="col-span-2 h-6 md:hidden"
                  style={{ gridRow: `${idx * 4 + 4} / ${idx * 4 + 5}` }}
                />
              </Fragment>
            );
          }}
        </ArrayField>
      </div>
    </Form>
  );
}
