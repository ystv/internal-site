import { Space } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { type CommitteeTeam } from "@prisma/client";
import { type z } from "zod";

import Form, { type FormResponse } from "@/components/Form";
import {
  CheckBoxField,
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";

import { createCommitteeTeamSchema, updateCommitteeTeamSchema } from "./schema";

export function CreateCommitteeTeamForm(props: {
  action: (
    data: z.infer<typeof createCommitteeTeamSchema>,
  ) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={createCommitteeTeamSchema}
      initialValues={{ sort_order: 0 }}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <NumberField name="sort_order" label="Sort Order" min={0} step={1} />
      <CheckBoxField name="public" label="Publicly Visible" />
    </Form>
  );
}

export function UpdateCommitteeTeamForm(props: {
  action: (
    data: z.infer<typeof updateCommitteeTeamSchema>,
  ) => Promise<FormResponse>;
  onSuccess: () => void;
  selectedCommitteeTeam: CommitteeTeam | undefined;
}) {
  return (
    <Form
      action={(data) => {
        if (!props.selectedCommitteeTeam) {
          throw new Error("No selected team");
        }
        return props.action({
          committee_team_id: props.selectedCommitteeTeam.committee_team_id,
          ...data,
        });
      }}
      onSuccess={() => {
        notifications.show({
          message: `Successfully updated "${props.selectedCommitteeTeam?.name}"`,
          color: "green",
        });
        props.onSuccess();
      }}
      schema={updateCommitteeTeamSchema.omit({
        committee_team_id: true,
      })}
      initialValues={{
        name: props.selectedCommitteeTeam?.name,
        description: props.selectedCommitteeTeam?.description,
        sort_order: props.selectedCommitteeTeam?.sort_order,
        public: props.selectedCommitteeTeam?.public,
      }}
      submitLabel="Update Team"
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <NumberField name="sort_order" label="Sort Order" min={0} step={1} />
      <Space h={"md"} />
      <CheckBoxField name="public" label="Publicly Visible" />
    </Form>
  );
}
