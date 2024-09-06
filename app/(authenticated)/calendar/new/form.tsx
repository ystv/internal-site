"use client";
import Form, { FormAction } from "@/components/Form";
import { schema } from "./schema";
import {
  CheckBoxField,
  ConditionalField,
  DatePickerField,
  MemberSelect,
  SearchedMemberSelect,
  SegmentedField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useRouter } from "next/navigation";
import { EventType } from "@/features/calendar/types";
import { identity } from "lodash";
import { InputLabel } from "@mantine/core";
import SlackChannelField from "@/components/SlackChannelField";
import { useSlackEnabled } from "@/components/slack/SlackEnabledProvider";
import { useCurrentUser } from "@/components/UserContext";

export function CreateEventForm(props: {
  action: FormAction<{ id: number }>;
  permittedEventTypes: EventType[];
}) {
  const router = useRouter();
  const isSlackEnabled = useSlackEnabled();
  const user = useCurrentUser();
  return (
    <Form
      action={props.action}
      schema={schema}
      onSuccess={(res) => router.push(`/calendar/${res.id}`)}
      initialValues={{ type: "show", host: user.user_id }}
    >
      <TextField name="name" label="Name" required placeholder={"New Event"} />
      <TextAreaField name="description" label="Description" autosize />
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
        condition={(t) => !["show", "public"].includes(t as string)}
        childFieldName="host"
      >
        <SearchedMemberSelect name="host" label="Host" />
      </ConditionalField>
      {/*<br />*/}
      {/*<CheckBoxField name="private" label="Private Event" />*/}
      {isSlackEnabled && (
        <>
          <InputLabel>Slack Channel</InputLabel>
          <SlackChannelField parentName="slack_channel" />
        </>
      )}

      <br />
      <CheckBoxField name="tentative" label="Tentative Event" />
    </Form>
  );
}
