"use client";

import Form from "@/components/Form";
import { EventObjectType, EventType } from "@/features/calendar";
import { createAdamRMSProject, editEvent } from "./actions";
import { EditEventSchema } from "./schema";
import {
  CheckBoxField,
  DatePickerField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useState, useTransition } from "react";
import Image from "next/image";
import AdamRMSLogo from "../../../_assets/adamrms-logo.png";
import { Button, Modal } from "@mantine/core";

function EditModal(props: { event: EventObjectType; close: () => void }) {
  return (
    <Form
      schema={EditEventSchema}
      action={(data) => editEvent(props.event.event_id, data)}
      initialValues={props.event}
      onSuccess={props.close}
      submitLabel="Save"
    >
      <h1 className={"mb-2 mt-0"}>Edit Event</h1>
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
  const [isPending, startTransition] = useTransition();
  return (
    <div className="mb-4 flex h-min w-auto flex-shrink flex-wrap justify-end gap-1 sm:mb-0 sm:max-md:w-1/3">
      <Button variant="danger" className="block">
        Delete Event
      </Button>
      {props.event.adam_rms_project_id ? (
        <Button
          component="a"
          href={`https://dash.adam-rms.com/project/?id=${props.event.adam_rms_project_id}`}
          target="_blank"
        >
          <Image src={AdamRMSLogo} className="mr-1 h-4 w-4" alt="" />
          View on AdamRMS
        </Button>
      ) : (
        <Button
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              createAdamRMSProject(props.event.event_id);
            })
          }
        >
          <Image src={AdamRMSLogo} className="mr-1 h-4 w-4" alt="" />
          Create AdamRMS Project
        </Button>
      )}
      <Button variant="warning" className="block">
        Cancel Event
      </Button>
      <Button onClick={() => setEditOpen(true)} className="block">
        Edit Event
      </Button>
      <Modal opened={isEditOpen} onClose={() => setEditOpen(false)}>
        <Button
          className="absolute right-4 top-4"
          onClick={() => setEditOpen(false)}
        >
          &times;
        </Button>
        <EditModal event={props.event} close={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
