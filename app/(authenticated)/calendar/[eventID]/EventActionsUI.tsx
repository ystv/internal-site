"use client";

import Form from "@/components/Form";
import { EventObjectType, EventType } from "@/features/calendar";
import { editEvent } from "./actions";
import { EditEventSchema } from "./schema";
import {
  CheckBoxField,
  DatePickerField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useState } from "react";
import ReactModal from "react-modal";
import { Button } from "@mantine/core";

function EditModal(props: { event: EventObjectType; close: () => void }) {
  return (
    <Form
      schema={EditEventSchema}
      action={(data) => editEvent(props.event.event_id, data)}
      initialValues={props.event}
      onSuccess={props.close}
      submitLabel="Save"
    >
      <TextField name="name" label="Name" />
      <TextAreaField name="description" label="Description" />
      <DatePickerField name="start_date" label="Start" />
      <DatePickerField name="end_date" label="End" />
      <TextField name="location" label="Location" />
      <CheckBoxField name="is_private" label="Private" />
      <CheckBoxField name="is_tentative" label="Tentative" />
    </Form>
  );
}

export function EventActionsUI(props: { event: EventObjectType }) {
  const [isEditOpen, setEditOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setEditOpen(true)} className="block">
        Edit Event
      </Button>
      <Button variant="warning" className="block">
        Cancel Event&nbsp;<small>(doesn&apos;t work yet, soz)</small>
      </Button>
      <Button variant="danger" className="block">
        Delete Event&nbsp;<small>(doesn&apos;t work yet, soz)</small>
      </Button>
      <ReactModal isOpen={isEditOpen} onRequestClose={() => setEditOpen(false)}>
        <Button
          className="absolute right-4 top-4"
          onClick={() => setEditOpen(false)}
        >
          &times;
        </Button>
        <EditModal event={props.event} close={() => setEditOpen(false)} />
      </ReactModal>
    </>
  );
}
