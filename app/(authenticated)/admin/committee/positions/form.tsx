import { notifications } from "@mantine/notifications";
import { type CommitteePosition } from "@prisma/client";
import { type z } from "zod";

import Form, { type FormResponse } from "@/components/Form";
import { NumberField, TextAreaField, TextField } from "@/components/FormFields";

import {
  createCommitteePositionSchema,
  updateCommitteePositionSchema,
} from "./schema";

export function CreateCommitteePositionForm(props: {
  action: (
    data: z.infer<typeof createCommitteePositionSchema>,
  ) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={createCommitteePositionSchema}
      initialValues={{ seats: 1 }}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <TextField name="email" label="Email Address" />
      <NumberField name="seats" label="Seats" min={0} max={100} step={1} />
    </Form>
  );
}

export function UpdateCommitteePositionForm(props: {
  action: (
    data: z.infer<typeof updateCommitteePositionSchema>,
  ) => Promise<FormResponse>;
  onSuccess: () => void;
  selectedCommitteePosition: CommitteePosition | undefined;
}) {
  return (
    <Form
      action={(data) => {
        if (!props.selectedCommitteePosition) {
          throw new Error("No selected position");
        }
        return props.action({
          committee_position_id:
            props.selectedCommitteePosition.committee_position_id,
          ...data,
        });
      }}
      onSuccess={() => {
        notifications.show({
          message: `Successfully updated "${props.selectedCommitteePosition?.name}"`,
          color: "green",
        });
        props.onSuccess();
      }}
      schema={updateCommitteePositionSchema.omit({
        committee_position_id: true,
      })}
      initialValues={{
        name: props.selectedCommitteePosition?.name,
        description: props.selectedCommitteePosition?.description,
        seats: props.selectedCommitteePosition?.seats,
      }}
      submitLabel="Update Position"
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="description"
        label="Description"
        autosize
        minRows={1}
      />
      <TextField name="email" label="Email Address" />
      <NumberField name="seats" label="Seats" min={0} max={100} step={1} />
    </Form>
  );
}
