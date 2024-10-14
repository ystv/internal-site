import {
  CrewSchema,
  SignupSheetSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import Form, {
  ArrayField,
  CheckBoxField,
  DatePickerField,
  FormResponse,
  NullableCheckboxField,
  TextAreaField,
  TextField,
  useCrewPositions,
  useMembers,
} from "@/components/forms";
import SelectWithCustomOption from "@/components/forms/SelectWithCustomOption";
import { getUserName } from "@/components/helpers/UserHelpers";
import { Fragment, useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { z } from "zod";

function CrewPositionField(props: { parentName: string }) {
  const vals = useCrewPositions();
  const selectController = useController({
    name: `${props.parentName}.position_id`,
  });
  // Track the initial selected ID so that, if it's a custom field (but one that existed
  // before), we can still display the correct value.
  const [initialSelectedID] = useState(() => selectController.field.value);
  const customController = useController({
    name: `${props.parentName}.custom_position_name`,
  });

  const [value, isCustom] = useMemo<[string, boolean]>(() => {
    if (customController.field.value?.trim().length > 0) {
      return [customController.field.value, true];
    }
    if (typeof selectController.field.value === "string") {
      return [selectController.field.value, false];
    }
    return [selectController.field.value.toString(10), false];
  }, [selectController.field.value, customController.field.value]);

  const filteredProcessedVals = useMemo(
    () =>
      vals
        .filter((x) => !x.is_custom || x.position_id === initialSelectedID)
        .map((v) => ({
          label: v.name,
          value: v.position_id.toString(10),
        })),
    [vals, initialSelectedID],
  );

  return (
    <SelectWithCustomOption
      data={filteredProcessedVals}
      value={value}
      isCustomValue={isCustom}
      onChange={(newValue, isNew) => {
        if (isNew) {
          selectController.field.onChange("");
          customController.field.onChange(newValue);
        } else {
          selectController.field.onChange(newValue);
          customController.field.onChange("");
        }
      }}
    />
  );
}

function CrewMemberField(props: { parentName: string }) {
  const vals = useMembers();
  const selectController = useController({
    name: `${props.parentName}.user_id`,
  });
  const customController = useController({
    name: `${props.parentName}.custom_crew_member_name`,
  });

  const [value, isCustom] = useMemo<[string | null, boolean]>(() => {
    if (customController.field.value?.trim().length > 0) {
      return [customController.field.value, true];
    }
    if (typeof selectController.field.value === "string") {
      return [selectController.field.value, false];
    }
    if (selectController.field.value === null) {
      return [null, false];
    }
    return [selectController.field.value.toString(10), false];
  }, [selectController.field.value, customController.field.value]);

  return (
    <SelectWithCustomOption
      data={vals.map((v) => ({
        label: getUserName(v),
        value: v.user_id.toString(10),
      }))}
      value={value}
      isCustomValue={isCustom}
      allowNone
      onChange={(newV, isNew) => {
        if (isNew) {
          selectController.field.onChange("");
          customController.field.onChange(newV);
        } else {
          selectController.field.onChange(newV);
          customController.field.onChange("");
        }
      }}
    />
  );
}

export function AddEditSignUpSheetForm(props: {
  action: (data: z.infer<typeof SignupSheetSchema>) => Promise<FormResponse>;
  initialValues?: Partial<z.infer<typeof SignupSheetSchema>>;
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
