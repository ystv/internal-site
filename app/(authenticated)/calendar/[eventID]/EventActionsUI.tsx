"use client";

import Button from "@/components/Button";
import Form from "@/components/Form";
import { EventObjectType, EventType } from "@/features/calendar";
import { createAdamRMSProject, editEvent } from "./actions";
import { EditEventSchema } from "./schema";
import { CheckBoxField, DatePickerField, Field } from "@/components/FormFields";
import { useState, useTransition } from "react";
import ReactModal from "react-modal";
import Image from "next/image";
import AdamRMSLogo from "../../_assets/adamrms-logo.png";

function EditModal(props: { event: EventObjectType, close: () => void }) {
  return (
    <Form schema={EditEventSchema} action={data => editEvent(props.event.event_id, data)} initialValues={props.event} onSuccess={props.close} submitLabel="Save">
      <Field name="name" label="Name" type="text" />
      <Field name="description" label="Description" as="textarea" />
      <DatePickerField
        name="start_date"
        label="Start"
        dateFormat="yyyy-MM-dd HH:mm"
        showTimeSelect
      />
      <DatePickerField
        name="end_date"
        label="End"
        dateFormat="yyyy-MM-dd HH:mm"
        showTimeSelect
      />
      <Field name="location" label="Location" type="text" />
      <CheckBoxField name="is_private" label="Private" />
      <CheckBoxField name="is_tentative" label="Tentative" />
    </Form>
  )
}

export function EventActionsUI(props: { event: EventObjectType }) {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <>
    <Button onClick={() => setEditOpen(true)} className="block">Edit Event</Button>
    {props.event.adam_rms_project_id ? (
      <Button
        as="a"
        href={`https://dash.adam-rms.com/project/?id=${props.event.adam_rms_project_id}`}
      >
        <Image src={AdamRMSLogo} className="h-4 w-4 mr-1" alt="" />
        View on AdamRMS
      </Button>
    ) : (
      <Button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            createAdamRMSProject(props.event.event_id)},
          )
        }
      >
        <Image src={AdamRMSLogo} className="h-4 w-4 mr-1" alt="" />
        Create AdamRMS Project
      </Button>
    )}
    <Button color="warning" className="block">
      Cancel Event&nbsp;<small>(doesn&apos;t work yet, soz)</small>
    </Button>
    <Button color="danger" className="block">
      Delete Event&nbsp;<small>(doesn&apos;t work yet, soz)</small>
    </Button>
    <ReactModal isOpen={isEditOpen} onRequestClose={() => setEditOpen(false)}>
      <Button
        className="absolute right-4 top-4"
        color="light"
        onClick={() => setEditOpen(false)}
      >
        &times;
      </Button>
      <EditModal event={props.event} close={() => setEditOpen(false)} />
    </ReactModal>
    </>
  );
}
