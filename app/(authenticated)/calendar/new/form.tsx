"use client";
import Form, { FormAction } from "@/components/Form";
import { schema } from "./schema";
import {
  CheckBoxField,
  ConditionalField,
  DatePickerField,
  MemberSelect,
  SegmentedField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useRouter } from "next/navigation";
import { EventType } from "@/features/calendar/types";
import { identity } from "lodash";
import { useCurrentUser } from "@/components/UserContext";

export function CreateEventForm(props: {
  action: FormAction<{ id: number }>;
  permittedEventTypes: EventType[];
}) {
  const router = useRouter();
  const user = useCurrentUser()
  return (
    <Form
      action={props.action}
      schema={schema}
      onSuccess={(res) => router.push(`/calendar/${res.id}`)}
      initialValues={{ type: "show", host: user.user_id }}
    >
      <TextField name="name" label="Name" required placeholder={"New Event"} />
      <TextAreaField name="description" label="Description" />
      <DatePickerField name="startDate" label="Start" required />
      <DatePickerField name="endDate" label="End" required />
      <TextField name="location" label="Location" />
      <MemberSelect name="host" label="Host" />
      <SegmentedField
        name="type"
        label="Type"
        options={props.permittedEventTypes}
        getOptionValue={identity}
        renderOption={(v: string) => v[0].toUpperCase() + v.slice(1)}
      />
      {/*<br />*/}
      {/*<CheckBoxField name="private" label="Private Event" />*/}
      <br />
      <CheckBoxField name="tentative" label="Tentative Event" />
    </Form>
  );
}
