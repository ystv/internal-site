"use client";
import { ZodEffects, ZodError, ZodObject } from "zod";
import {
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTMLInputTypeAttribute, useCallback, useState } from "react";
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
  submitLabel?: string;
}) {
  const form = useForm<Fields>({
    resolver: zodResolver(props.schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { action } = props;
  const submitHandler = useCallback(
    async (data: FormData) => {
      const valid = await form.trigger();
      if (valid) {
        setIsSubmitting(true);
        let res;
        try {
          res = await action(data);
          console.log("about to throw!");
        } catch (e) {
          console.error(e);
          form.setError("root", { type: "custom", message: String(e) });
          return;
        } finally {
          setIsSubmitting(false);
        }
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
    },
    [form, action],
  );
  return (
    <FormProvider {...form}>
      <form action={submitHandler} className={props.className}>
        {form.formState.errors.root && (
          <span className="text-red-500 font-semibold block">
            {(form.formState.errors.root?.message as string) ?? ""}
          </span>
        )}
        {props.children}
        <button
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className={classNames(
            "mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700",
            (isSubmitting || !form.formState.isValid) &&
              "opacity-50 cursor-not-allowed",
          )}
        >
          {props.submitLabel ?? "Create"}
        </button>
      </form>
    </FormProvider>
  );
}
