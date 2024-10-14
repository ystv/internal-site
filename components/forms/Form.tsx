"use client";

import { DebugOnly } from "@/app/_components/DebugMode";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, type DefaultMantineColor } from "@mantine/core";
import { useCallback, useState, useTransition } from "react";
import {
  FormProvider,
  useForm,
  type DeepPartial,
  type FieldValues,
} from "react-hook-form";
import type { FieldPath } from "react-hook-form/dist/types/path";
import type { ZodEffects, ZodTypeAny, z } from "zod";

export interface FormErrorResponse<Fields extends FieldValues = any> {
  ok: false;
  errors: { [_K in keyof Fields | "root"]?: string };
}

export type FormResponse<
  OK extends Record<string, unknown> = {},
  _Fields extends FieldValues = any,
> = ({ ok: true } & OK) | FormErrorResponse;
export type FormAction<
  OK extends Record<string, unknown> = {},
  Fields extends FieldValues = any,
> = (data: Fields) => Promise<FormResponse<OK, Fields>>;

const useForceUpdate = () => {
  const [, setState] = useState(true);
  return useCallback(() => {
    setState((s) => !s);
  }, []);
};

export default function Form<
  Schema extends ZodTypeAny | ZodEffects<ZodTypeAny>,
  SuccessfulResponse extends Record<string, unknown> = {},
>(props: {
  action: FormAction<SuccessfulResponse, z.infer<Schema>>;
  schema: Schema;
  initialValues?: DeepPartial<z.infer<Schema>>;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  submitColor?: DefaultMantineColor;
  onSuccess?: (res: SuccessfulResponse) => void;
}) {
  const form = useForm<z.infer<Schema>>({
    resolver: zodResolver(props.schema),
    defaultValues: props.initialValues,
  });
  const [isSubmitting, startTransition] = useTransition();
  const { action, onSuccess } = props;
  const forceUpdate = useForceUpdate();
  const submitHandler = useCallback(async () => {
    const valid = await form.trigger();
    if (valid) {
      startTransition(async () => {
        let res;
        try {
          // TODO: This submits the form values as JSON, effectively ignoring the FormData parameter. This works, but
          //  may run into issues down the line, especially when (if?) we upload files directly from the form.
          //  Instead, we should probably use the FormData object React gives us (though we'll have to figure out how
          //  to make it play nice with hook-form).
          res = await action(form.getValues());
        } catch (e) {
          console.error(e);
          form.setError("root", { type: "custom", message: String(e) });
          return;
        }
        if (!("ok" in res)) {
          throw new Error(
            "<Form> action did not conform to FormResponse interface.",
          );
        }
        if (res.ok) {
          form.clearErrors();
          onSuccess?.(res);
          return;
        }
        form.clearErrors();
        for (const [k, err] of Object.entries(
          (res as FormErrorResponse).errors,
        )) {
          form.setError(k as FieldPath<z.infer<Schema>>, {
            type: "custom",
            message: err,
          });
        }
      });
    }
  }, [form, action, onSuccess]);
  return (
    <FormProvider {...form}>
      <form action={submitHandler} className={props.className}>
        {form.formState.errors.root && (
          <span className="block font-semibold text-red-500">
            {(form.formState.errors.root?.message as string) ?? ""}
          </span>
        )}
        {props.children}
        <br />
        <div className={"text-right"}>
          <Button
            type="submit"
            disabled={!form.formState.isValid}
            loading={isSubmitting}
            color={props.submitColor}
          >
            {props.submitLabel ?? "Create"}
          </Button>
        </div>
      </form>
      <DebugOnly>
        <pre className="mt-4 text-xs text-gray-500">
          Debug: form state: {JSON.stringify(form.formState, null, 2)}
          <br />
          isValid: {JSON.stringify(form.formState.isValid)}
          <br />
          isDirty: {JSON.stringify(form.formState.isDirty)}
          <br />
          values: {JSON.stringify(form.getValues(), null, 2)}
          <br />
          validated:{" "}
          {JSON.stringify(
            props.schema.safeParse(form.getValues()),
            null,
            2,
          )}{" "}
          <br />
          <Button size="small" color="light" onClick={forceUpdate}>
            Force update
          </Button>
        </pre>
      </DebugOnly>
    </FormProvider>
  );
}
