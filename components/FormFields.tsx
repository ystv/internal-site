import {
  ArrayPath,
  Controller,
  FieldArray,
  FieldValues,
  useController,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  NativeSelect,
  TextInput,
  Textarea,
  Box,
  SegmentedControl,
  Input,
  InputLabel,
  Card,
  ActionIcon,
  Chip,
  Space,
  Stack,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useMembers } from "@/components/FormFieldPreloadedData";
import { getUserName } from "@/components/UserHelpers";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { FieldPath } from "react-hook-form/dist/types/path";
import SelectOption from "./SelectOption";
import { PermissionEnum, Permission } from "@/lib/auth/permissions";
import { IoClose } from "react-icons/io5";

export function TextField(props: {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const ctx = useFormContext();
  return (
    <TextInput
      {...ctx.register(props.name)}
      label={props.label}
      error={ctx.formState.errors[props.name]?.message as string}
      placeholder={props.placeholder}
      withAsterisk={props.required}
    />
  );
}

export function TextAreaField(props: {
  name: string;
  label: string;
  autosize?: boolean;
  minRows?: number;
}) {
  const ctx = useFormContext();
  return (
    <Textarea
      {...ctx.register(props.name)}
      label={props.label}
      error={ctx.formState.errors[props.name]?.message as string}
      autosize={props.autosize ?? false}
      minRows={props.minRows ?? 2}
    />
  );
}

export function DatePickerField(props: {
  name: string;
  defaultValue?: Date | string;
  label: string;
  required?: boolean;
  modal?: boolean;
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
      error={controller.fieldState.error?.message as string}
      withAsterisk={props.required}
      dropdownType={props.modal ? "modal" : "popover"}
      renderDay={(date) => {
        const today = dayjs(date).isSame(dayjs(), "day");
        return (
          <Box
            className={twMerge(
              "flex h-full w-full items-center justify-center rounded-sm text-center",
              today && "bg-blue-100",
            )}
          >
            <div>{date.getDate()}</div>
          </Box>
        );
      }}
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
              className="h-full min-w-[2rem] align-middle text-2xl font-black [&_.mantine-Button-inner]:text-xl"
              onClick={() => remove(idx)}
              variant="danger"
              size="sm"
            >
              x
            </Button>
          ),
        }),
      )}
      <Button
        className="mt-1 font-black md:col-span-3"
        onClick={() => append(props.newElement(fields) as any)}
        variant="outline"
        size="sm"
      >
        +
      </Button>
    </>
  );
}

export function SegmentedField<TObj extends {}>(props: {
  name: string;
  options: TObj[];
  label?: string;
  renderOption: (obj: TObj) => string;
  getOptionValue: (obj: TObj) => string;
}) {
  const { name, label, options, getOptionValue, renderOption } = props;
  return (
    <Controller
      name={name}
      defaultValue={getOptionValue(options[0])}
      render={({ field }) => (
        <Input.Wrapper label={label}>
          <div>
            <SegmentedControl
              {...field}
              data={options.map((obj) => ({
                label: renderOption(obj),
                value: getOptionValue(obj),
              }))}
            />
          </div>
        </Input.Wrapper>
      )}
    />
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

export function SearchedMemberSelect(props: {
  name: string;
  label?: string;
  nullable?: boolean;
}) {
  const members = useMembers();

  const selectController = useController({
    name: props.name,
  });

  const value = useMemo<string | null>(() => {
    if (typeof selectController.field.value === "string") {
      return selectController.field.value;
    }
    if (selectController.field.value === null) {
      return null;
    }
    return selectController.field.value.toString(10);
  }, [selectController.field.value]);
  return (
    <>
      {props.label && <InputLabel>{props.label}</InputLabel>}
      <SelectOption
        data={members.map((v) => ({
          label: getUserName(v),
          value: v.user_id.toString(10),
        }))}
        value={value}
        onChange={(newV) => {
          selectController.field.onChange(newV);
        }}
      />
    </>
  );
}

/**
 * Wraps a form field to conditionally render it based on the value of another.
 * This is useful for e.g. showing a field only if a checkbox is checked.
 *
 * To use it, wrap the field you want to conditionally render in a ConditionalField component.
 * Then pass the name of the field that controls whether the field should be shown in the
 * referencedFieldName prop, and a function that takes the value of that field and returns
 * whether the field should be shown in the condition prop.
 * Also pass the name of the field you want to conditionally render in the childFieldName prop,
 * and its value will be set to undefined if the field is hidden.
 */
export function ConditionalField<
  TSchema extends FieldValues = Record<string, unknown>,
  TField extends FieldPath<TSchema> = FieldPath<TSchema>,
>(props: {
  referencedFieldName: TField;
  condition: (data: TSchema[TField]) => boolean;
  childFieldName?: string;
  children: ReactNode;
}) {
  const ctx = useFormContext<TSchema>();
  const referencedField = ctx.watch(props.referencedFieldName);
  const shouldShow = props.condition(referencedField);
  useEffect(() => {
    if (!shouldShow && props.childFieldName) {
      // @ts-expect-error - otherwise you get errors if referencedFieldName and childFieldName don't match
      ctx.setValue(props.childFieldName, undefined as any);
    }
  }, [shouldShow, props.childFieldName, ctx]);
  return shouldShow && props.children;
}

export function HiddenField<
  TFields extends FieldValues,
  TFieldName extends FieldPath<TFields> = FieldPath<TFields>,
>(props: { name: TFieldName; value: string }) {
  const ctx = useFormContext<TFields>();
  return (
    <input type="hidden" {...ctx.register(props.name)} value={props.value} />
  );
}

export function PermissionSelectField(props: {
  name: string;
  defaultValue?: string[];
  label: string;
  required?: boolean;
}) {
  const controller = useController({
    name: props.name,
    defaultValue: props.defaultValue,
  });

  const [filter, setFilter] = useState<string>("");

  return (
    <>
      <InputLabel>{props.label}</InputLabel>
      <Card withBorder>
        <TextInput
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          rightSection={
            <ActionIcon
              variant="transparent"
              color="red"
              onClick={() => setFilter("")}
              disabled={filter === ""}
            >
              <IoClose />
            </ActionIcon>
          }
        />
        <Space h={"md"} />
        <Chip.Group
          multiple
          value={controller.field.value}
          onChange={(value) => {
            controller.field.onChange(value);
          }}
        >
          <Stack gap={4}>
            {(Object.keys(PermissionEnum.Values) as Permission[])
              .filter(
                (v) =>
                  v.toLowerCase().includes(filter.toLowerCase()) ||
                  (controller.field.value as Permission[]).includes(v),
              )
              .map((key) => (
                <Chip key={key} value={key} variant="outline">
                  {key}
                </Chip>
              ))}
          </Stack>
        </Chip.Group>
      </Card>
    </>
  );
}
