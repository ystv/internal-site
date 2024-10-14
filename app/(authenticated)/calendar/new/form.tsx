"use client";

import { useCurrentUser } from "@/components/contexts/UserContext";
import Form, {
  CheckBoxField,
  ConditionalField,
  DatePickerField,
  SearchedMemberSelect,
  SegmentedField,
  SlackChannelField,
  TextAreaField,
  TextField,
  type FormAction,
} from "@/components/forms";
import { useSlackEnabled } from "@/components/slack/SlackEnabledProvider";
import type { EventType } from "@/features/calendar/types";
import { Alert, InputLabel } from "@mantine/core";
import { identity } from "lodash";
import { useRouter } from "next/navigation";
import { TbAlertTriangle } from "react-icons/tb";
import { schema } from "./schema";

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
      <ConditionalField
        referencedFieldName="type"
        condition={(t) => t === "public"}
      >
        <Alert
          color="orange"
          icon={<TbAlertTriangle />}
          title="Public Event"
          className="mt-1"
        >
          The details of this event will be visible to anyone outside YSTV.
        </Alert>
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
