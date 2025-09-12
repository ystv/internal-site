import { notifications } from "@mantine/notifications";
import { type CommitteeTeam } from "@prisma/client";
import { type z } from "zod";

import Form, { type FormResponse } from "@/components/Form";
import { NumberField, TextAreaField, TextField } from "@/components/FormFields";

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
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
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
          throw new Error("No selected position");
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
      }}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <NumberField name="seats" label="Seats" min={0} max={100} step={1} />
    </Form>
  );
}
