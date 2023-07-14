import { FieldValues, useController, useFormContext } from "react-hook-form";
import { FieldPath } from "react-hook-form/dist/types/path";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classNames from "classnames";
import { useMemo } from "react";

interface FieldBaseProps<
  TFields,
  TFieldName,
  TEl extends React.ElementType = "input",
> {
  name: TFieldName;
  label: string;
  className?: string;
  as?: TEl;
}

/**
 * A generic form field, tied into the validation system and with some basic styling.
 * Pass the `as` prop to render a different element type (e.g. `as="textarea"`), otherwise it will be an input.
 * `label` is rendered outside the element, all other props are passed to the element as if it were a normal <input>.
 */
export function Field<
  TFields extends FieldValues,
  TFieldName extends FieldPath<TFields> = FieldPath<TFields>,
  TEl extends React.ElementType = "input",
>(
  props: FieldBaseProps<TFields, TFieldName, TEl> &
    React.ComponentPropsWithoutRef<TEl>,
) {
  const { label, ...rest } = props;
  const ctx = useFormContext<TFields>();
  const El = props.as ?? "input";
  return (
    <label className="block">
      <span className="text-gray-700 font-bold">{label}</span>
      {ctx.formState.errors[props.name] && (
        <span className="text-red-500 font-semibold block">
          {(ctx.formState.errors[props.name]?.message as string) ?? ""}
        </span>
      )}
      <El
        {...rest}
        {...ctx.register(props.name)}
        className={classNames(
          props.className ??
            " mt-1 block w-full rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ",
          ctx.formState.errors[props.name]
            ? "border-red-500"
            : "border-gray-300",
        )}
      />
    </label>
  );
}

export function DatePickerField(
  props: {
    name: string;
    defaultValue?: Date | string;
    label: string;
  } & Omit<ReactDatePickerProps, "value" | "onChange">,
) {
  const { name, defaultValue, label, ...rest } = props;
  const controller = useController({
    name: props.name,
    defaultValue:
      props.defaultValue instanceof Date
        ? props.defaultValue.toISOString
        : props.defaultValue,
  });
  const v = useMemo(
    () => (controller.field.value ? new Date(controller.field.value) : null),
    [controller.field.value],
  );
  return (
    <label className="block">
      <span className="text-gray-700 font-bold block">{props.label}</span>
      {controller.fieldState.error && (
        <span className="text-red-500 font-semibold block">
          {(controller.fieldState.error.message as string) ?? ""}
        </span>
      )}
      <DatePicker
        selected={v}
        onChange={(v) => controller.field.onChange(v?.toISOString())}
        onBlur={controller.field.onBlur}
        ref={controller.field.ref}
        className={classNames(
          "mt-1 block w-full rounded-md shadow-sm",
          controller.fieldState.error ? "border-red-500" : "border-gray-300",
          props.className,
        )}
        wrapperClassName="block"
        {...rest}
        selectsRange={false}
      />
    </label>
  );
}
