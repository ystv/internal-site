"use client";

import Form, {
  HiddenField,
  TextAreaField,
  TextField,
} from "@/components/forms";
import { Button, Card, Group, Text } from "@mantine/core";
import { Quote } from "@prisma/client";
import { useState, useTransition } from "react";
import { z } from "zod";
import { addQuote, deletQuote, editQuote } from "./actions";
import { AddQuoteSchema, EditQuoteSchema } from "./schema";

export function AddEditQuoteForm(props: {
  initialData?: z.infer<typeof EditQuoteSchema>;
  onSuccess?: () => void;
}) {
  return (
    <Form
      schema={props.initialData ? EditQuoteSchema : AddQuoteSchema}
      // @ts-expect-error idk lol
      action={props.initialData ? editQuote : addQuote}
      initialValues={props.initialData}
      onSuccess={props.onSuccess}
      submitLabel={props.initialData ? "Save" : "Create"}
    >
      <TextAreaField name="text" label="Quote" />
      <TextField name="context" label="Context" />
      {props.initialData && (
        <HiddenField
          name="id"
          value={props.initialData.quote_id.toString(10)}
        />
      )}
    </Form>
  );
}

export function QuoteView(props: { data: Quote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  return isEditing ? (
    <AddEditQuoteForm
      initialData={props.data}
      onSuccess={() => setIsEditing(false)}
    />
  ) : (
    <>
      <Card withBorder key={Math.random()}>
        {props.data.text.split("\n").map((line) => (
          <Text key={line}>
            {line}
            <br />
          </Text>
        ))}
        {props.data.context.length > 0 && (
          <p className="text-sm">— {props.data.context}</p>
        )}
        <Group gap={"xs"}>
          <Button
            onClick={() => setIsEditing(true)}
            disabled={isPending}
            size="compact-xs"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            disabled={isPending}
            onClick={() => {
              if (confirm("You sure boss?")) {
                startTransition(async () => {
                  await deletQuote(props.data.quote_id);
                });
              }
            }}
            size="compact-xs"
          >
            Delet
          </Button>
        </Group>
      </Card>
      {/* <div className="my-1 border-solid border-gray-400 px-4 py-2">
        <p>
          {props.data.text.split("\n").map((line) => (
            <>
              {line}
              <br />
            </>
          ))}
        </p>
        {props.data.context.length > 0 && (
          <p className="text-sm">— {props.data.context}</p>
        )}
        <Button
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          size="compact-xs"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          disabled={isPending}
          onClick={() => {
            if (confirm("You sure boss?")) {
              startTransition(async () => {
                await deletQuote(props.data.quote_id);
              });
            }
          }}
          size="compact-xs"
        >
          Delet
        </Button>
      </div> */}
    </>
  );
}

export function AddQuote() {
  const [visible, setVisible] = useState(false);
  return visible ? (
    <>
      <AddEditQuoteForm onSuccess={() => setVisible(false)} />
      <Button onClick={() => setVisible(false)} color="warning">
        Cancel
      </Button>
    </>
  ) : (
    <Group>
      <Button onClick={() => setVisible(true)}>Add Quote</Button>
    </Group>
  );
}
