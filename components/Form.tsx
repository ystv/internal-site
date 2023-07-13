"use client";
import { ZodEffects, ZodError, ZodObject } from "zod";
import {
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTMLInputTypeAttribute } from "react";
import classNames from "classnames";
import { FieldPath } from "react-hook-form/dist/types/path";

export function Field<
  TFields extends FieldValues,
  TFieldName extends FieldPath<TFields> = FieldPath<TFields>,
>(props: {
  name: TFieldName;
  label: string;
  type: HTMLInputTypeAttribute;
  className?: string;
}) {
  const ctx = useFormContext<TFields>();
  return (
    <label className="block">
      <span className="text-gray-700 font-bold">{props.label}</span>
      {ctx.formState.errors[props.name] && (
        <span className="text-red-500 font-semibold block">
          {(ctx.formState.errors[props.name]?.message as string) ?? ""}
        </span>
      )}
      <input
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

export interface FormErrorResponse<Fields extends FieldValues = any> {
  ok: false;
  errors: { [K in keyof Fields | "root"]?: string };
}

export type FormResponse<
  OK extends Record<string, unknown> = {},
  Fields extends FieldValues = any,
> = ({ ok: true } & OK) | FormErrorResponse;
export type FormAction<
  OK extends Record<string, unknown> = {},
  Fields extends FieldValues = any,
> = (data: FormData) => Promise<FormResponse<OK, Fields>>;

export function zodErrorResponse(err: ZodError): FormErrorResponse {
  return {
    ok: false,
    errors: err.issues.reduce(
      (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
      {},
    ),
  };
}

export default function Form<
  Fields extends FieldValues,
  Schema extends ZodObject<Fields> | ZodEffects<ZodObject<Fields>>,
>(props: {
  action: FormAction<any, Fields>;
  schema: Schema;
  children: React.ReactNode;
  className?: string;
}) {
  const form = useForm<Fields>({
    resolver: zodResolver(props.schema),
  });
  return (
    <FormProvider {...form}>
      <form
        action={async (data) => {
          const valid = await form.trigger();
          if (valid) {
            const res = await props.action(data);
            // Handle server-side error responses
            if ("ok" in res && !res.ok) {
              form.clearErrors();
              for (const [k, err] of Object.entries(
                (res as FormErrorResponse).errors,
              )) {
                form.setError(k as FieldPath<Fields>, {
                  type: "custom",
                  message: err,
                });
              }
            }
          }
        }}
        className={props.className}
      >
        {form.formState.errors.root && (
          <span className="text-red-500 font-semibold block">
            {(form.formState.errors.root?.message as string) ?? ""}
          </span>
        )}
        {props.children}
      </form>
    </FormProvider>
  );
}
