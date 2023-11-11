"use client";
import Form, { FormAction } from "@/components/Form";
import { schema } from "./schema";
import {
  CheckBoxField,
  ConditionalField,
  DatePickerField,
  MemberSelect,
  SegmentedField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useRouter } from "next/navigation";
import { EventType } from "@/features/calendar/types";
import { identity } from "lodash";
import { InputLabel } from "@mantine/core";
import SlackChannelField from "@/components/SlackChannelField";

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
      initialValues={{ type: "show" }}
    >
      <TextField name="name" label="Name" required placeholder={"New Event"} />
      <TextAreaField name="description" label="Description" />
      <DatePickerField name="startDate" label="Start" required />
      <DatePickerField name="endDate" label="End" required />
      <TextField name="location" label="Location" />
      <SegmentedField
        name="type"
        label="Type"
        options={props.permittedEventTypes}
        getOptionValue={identity}
        renderOption={(v: string) => v[0].toUpperCase() + v.slice(1)}
      />
      <ConditionalField
        referencedFieldName="type"
        condition={(t) => t !== "show"}
        childFieldName="host"
      >
        <MemberSelect name="host" label="Host" />
      </ConditionalField>
      {/*<br />*/}
      {/*<CheckBoxField name="private" label="Private Event" />*/}
      <input type="hidden" name={`slack_channel_id`} value={""} />
      <input type="hidden" name={`slack_new_channel_name`} value={""} />
      <InputLabel>Slack Channel</InputLabel>
      <SlackChannelField parentName="slack" />
      <br />
      <CheckBoxField name="tentative" label="Tentative Event" />
    </Form>
  );
}
