import {
  ArrayPath,
  FieldArray,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  NativeSelect,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  useCrewPositions,
  useMembers,
} from "@/components/FormFieldPreloadedData";
import { getUserName } from "@/components/UserHelpers";

export function TextField(props: { name: string; label: string }) {
  const ctx = useFormContext();
  return (
    <TextInput
      {...ctx.register(props.name)}
      label={props.label}
      error={ctx.formState.errors[props.name]?.message as string}
    />
  );
}

export function TextAreaField(props: { name: string; label: string }) {
  const ctx = useFormContext();
  return (
    <Textarea
      {...ctx.register(props.name)}
      label={props.label}
      error={ctx.formState.errors[props.name]?.message as string}
    />
  );
}

export function DatePickerField(props: {
  name: string;
  defaultValue?: Date | string;
  label: string;
}) {
  const controller = useController({
    name: props.name,
    defaultValue:
      props.defaultValue instanceof Date
        ? props.defaultValue.toISOString()
        : props.defaultValue,
  });
  const dv = useMemo(() => {
    if (!controller.field.value) {
      return null;
    }
    try {
      return new Date(controller.field.value);
    } catch (e) {
      return null;
    }
  }, [controller.field.value]);
  return (
    <DateTimePicker
      label={props.label}
      value={dv}
      onChange={(v) => controller.field.onChange(v?.toISOString())}
    />
  );
}

export function CheckBoxField(props: { name: string; label?: string }) {
  const ctx = useFormContext();
  return <Checkbox {...ctx.register(props.name)} label={props.label} />;
}

export function NullableCheckboxField(props: {
  name: string;
  checkboxLabel: string;
  children: React.ReactNode;
}) {
  const controller = useController({
    name: props.name,
    defaultValue: null,
  });
  const [isChecked, setChecked] = useState(controller.field.value !== null);
  useEffect(() => {
    if (!isChecked) {
      controller.field.onChange(null);
    }
  }, [isChecked, controller.field]);
  return (
    <>
      <Checkbox
        checked={isChecked}
        onChange={(v) => setChecked(v.target.checked)}
        label={props.checkboxLabel}
      />
      {isChecked && props.children}
    </>
  );
}

export function ArrayField<
  TFieldValues extends FieldValues,
  TFieldName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
>(props: {
  name: string;
  children: (
    // The unknown here is to remind you that, because of coercion, some of the types may not be what you expect
    // (e.g. you have a field that's defined as `z.coerce.number()` - the final value will actually be a number,
    // but the value you'll get passed here may be a string
    field: Record<string, unknown> & { id: string },
    index: number,
    els: { remove: React.ReactNode },
  ) => React.ReactNode;
  newElement: (value: FieldArray<TFieldValues, TFieldName>[]) => TFieldValues;
  header?: React.ReactNode;
}) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TFieldName>({
    name: props.name as any /* TODO: the typings here are absolutely insane */,
  });
  return (
    <>
      {fields.length > 0 && props.header}
      {fields.map((field, idx) =>
        props.children(field as any, idx, {
          remove: (
            <Button
              className="h-full min-w-[2rem] align-middle font-black"
              onClick={() => remove(idx)}
              variant="danger"
              size="sm"
            >
              -
            </Button>
          ),
        }),
      )}
      <Button
        className="mt-1 font-black"
        onClick={() => append(props.newElement(fields) as any)}
        variant="outline"
        size="sm"
      >
        +
      </Button>
    </>
  );
}

export function SelectField<TObj extends {}>(props: {
  name: string;
  options: TObj[];
  label?: string;
  renderOption: (obj: TObj) => string;
  getOptionValue: (obj: TObj) => string;
  filter: (obj: TObj, filter: string) => boolean;
  nullable?: boolean;
}) {
  const ctx = useFormContext();
  const { name, label, options, getOptionValue, renderOption, nullable } =
    props;
  return (
    <NativeSelect
      {...ctx.register(name)}
      label={label}
      data={[
        ...(nullable ? [{ label: "None", value: "" }] : []),
        ...options.map((obj) => ({
          label: renderOption(obj),
          value: getOptionValue(obj),
        })),
      ]}
    />
  );
}

export function CrewPositionSelect(props: { name: string; label?: string }) {
  const vals = useCrewPositions();
  return (
    <SelectField
      name={props.name}
      options={vals}
      label={props.label}
      renderOption={(pos) => pos.name}
      getOptionValue={(pos) => pos.position_id.toString(10)}
      filter={(pos, q) => pos.name.includes(q)}
    />
  );
}

export function MemberSelect(props: {
  name: string;
  label?: string;
  nullable?: boolean;
}) {
  const vals = useMembers();
  return (
    <SelectField
      name={props.name}
      options={vals}
      label={props.label}
      renderOption={(user) => getUserName(user)}
      getOptionValue={(user) => user.user_id.toString(10)}
      nullable={props.nullable}
      filter={(user, q) =>
        user.first_name.toLocaleLowerCase().includes(q) ||
        user.last_name.toLocaleLowerCase().includes(q) ||
        (user.nickname?.toLocaleLowerCase().includes(q) ?? false) ||
        `${user.first_name} ${user.last_name}`
          .toLocaleLowerCase()
          .includes(q) ||
        getUserName(user).toLocaleLowerCase().includes(q)
      }
    />
  );
}
