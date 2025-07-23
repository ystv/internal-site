import { notifications } from "@mantine/notifications";
import { type Position } from "@prisma/client";
import { type z } from "zod";

import Form, { type FormResponse } from "@/components/Form";
import { TextAreaField, TextField } from "@/components/FormFields";

import { createPositionSchema, updatePositionSchema } from "./schema";

export function CreatePositionForm(props: {
  action: (data: z.infer<typeof createPositionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
}) {
  return (
    <Form
      action={props.action}
      onSuccess={props.onSuccess}
      schema={createPositionSchema}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="brief_description"
        label="Brief Description"
        autosize
        minRows={1}
      />
      <TextAreaField
        name="full_description"
        label="Full Description"
        autosize
      />
    </Form>
  );
}

export function UpdatePositionForm(props: {
  action: (data: z.infer<typeof updatePositionSchema>) => Promise<FormResponse>;
  onSuccess: () => void;
  selectedPosition: Position | undefined;
}) {
  return (
    <Form
      action={(data) => {
        if (!props.selectedPosition) {
          throw new Error("No selected position");
        }
        return props.action({
          position_id: props.selectedPosition.position_id,
          ...data,
        });
      }}
      onSuccess={() => {
        notifications.show({
          message: `Successfully updated "${props.selectedPosition?.name}"`,
          color: "green",
        });
        props.onSuccess();
      }}
      schema={updatePositionSchema.omit({ position_id: true })}
      initialValues={{
        name: props.selectedPosition?.name,
        brief_description: props.selectedPosition?.brief_description,
        full_description: props.selectedPosition?.full_description,
      }}
    >
      <TextField name="name" label="Name" required />
      <TextAreaField
        name="brief_description"
        label="Brief Description"
        autosize
        minRows={1}
      />
      <TextAreaField
        name="full_description"
        label="Full Description"
        autosize
      />
    </Form>
  );
}
