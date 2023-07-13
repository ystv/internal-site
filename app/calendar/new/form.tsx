"use client";
import Form, { Field, FormAction } from "@/components/Form";
import { schema } from "./schema";

export function CreateEventForm(props: { action: FormAction }) {
  return (
    <Form action={props.action} schema={schema}>
      <Field name="name" label="Name" type="text" />
    </Form>
  );
}
