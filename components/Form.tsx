"use client";
import { ZodEffects, ZodObject } from "zod";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import classNames from "classnames";
import { FieldPath } from "react-hook-form/dist/types/path";

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
> = (data: Fields) => Promise<FormResponse<OK, Fields>>;

export default function Form<
  Fields extends FieldValues,
  Schema extends ZodObject<Fields> | ZodEffects<ZodObject<Fields>>,
  SuccessfulResponse extends Record<string, unknown> = {},
>(props: {
  action: FormAction<SuccessfulResponse, Fields>;
  schema: Schema;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  onSuccess?: (res: SuccessfulResponse) => void;
}) {
  const form = useForm<Fields>({
    resolver: zodResolver(props.schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { action, onSuccess } = props;
  const submitHandler = useCallback(async () => {
    const valid = await form.trigger();
    if (valid) {
      setIsSubmitting(true);
      let res;
      try {
        // TODO: This submits the form values as JSON, effectively ignoring the FormData parameter. This works, but
        //  may run into issues down the line, especially when (if?) we upload files directly from the form.
        //  Instead, we should probably use the FormData object React gives us (though we'll have to figure out how
        //  to make it play nice with hook-form).
        res = await action(form.getValues());
        if ("ok" in res && res.ok) {
          form.clearErrors();
          onSuccess?.(res);
        }
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
  }, [form, action, onSuccess]);
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
          // disabled={isSubmitting || !form.formState.isValid}
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
