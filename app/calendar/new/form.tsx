"use client";
import Form, { FormAction } from "@/components/Form";
import { EventType, schema } from "./schema";
import { DatePickerField, Field } from "@/components/FormFields";
import { useRouter } from "next/navigation";

export function CreateEventForm(props: {
  action: FormAction<{ id: number }>;
  permittedEventTypes: EventType[];
}) {
  const router = useRouter();
  return (
    <Form
      action={props.action}
      schema={schema}
      onSuccess={(res) => router.push(`/calendar/${res.id}`)}
    >
      <Field name="name" label="Name" type="text" />
      <Field name="description" label="Description" as="textarea" />
      <DatePickerField
        name="startDate"
        label="Start"
        dateFormat="yyyy-MM-dd HH:mm"
        showTimeSelect
      />
      <DatePickerField
        name="endDate"
        label="End"
        dateFormat="yyyy-MM-dd HH:mm"
        showTimeSelect
      />
      <Field
        name="type"
        label="Type"
        as="select"
        defaultValue={props.permittedEventTypes[0]}
      >
        {props.permittedEventTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Field>
    </Form>
  );
}
