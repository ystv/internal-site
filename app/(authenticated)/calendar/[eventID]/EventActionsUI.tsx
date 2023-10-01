"use client";

import Form from "@/components/Form";
import { EventObjectType, EventType } from "@/features/calendar";
import {
  createAdamRMSProject,
  editEvent,
  getAdamRMSLinkCandidates,
  linkAdamRMSProject,
  unlinkAdamRMS,
} from "./actions";
import { EditEventSchema } from "./schema";
import {
  CheckBoxField,
  DatePickerField,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import AdamRMSLogo from "../../../_assets/adamrms-logo.png";
import { Button, Menu, Modal, Select } from "@mantine/core";
import { useModals } from "@mantine/modals";

function EditModal(props: { event: EventObjectType; close: () => void }) {
  return (
    <Form
      schema={EditEventSchema}
      action={(data) => editEvent(props.event.event_id, data)}
      initialValues={props.event}
      onSuccess={props.close}
      submitLabel="Save"
    >
      <h1 className={"mb-2 mt-0 text-4xl font-bold"}>Edit Event</h1>
      <TextField name="name" label="Name" required />
      <TextAreaField name="description" label="Description" />
      <DatePickerField name="start_date" label="Start" required />
      <DatePickerField name="end_date" label="End" required />
      <TextField name="location" label="Location" />
      <br />
      <CheckBoxField name="is_private" label="Private Event" />
      <br />
      <CheckBoxField name="is_tentative" label="Tentative Event" />
    </Form>
  );
}

export function EventActionsUI(props: { event: EventObjectType }) {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const modals = useModals();

  const doLink = useCallback(
    function doLink() {
      startTransition(async () => {
        const candidates = await getAdamRMSLinkCandidates();
        if (!candidates.ok) {
          throw new Error(candidates.errors?.root);
        }
        modals.openModal({
          title: "Link AdamRMS Project",
          children: (
            <form
              action={(data) => {
                startTransition(async () => {
                  await linkAdamRMSProject(
                    props.event.event_id,
                    parseInt(data.get("projectID") as string, 10),
                  );
                  modals.closeAll();
                });
              }}
            >
              <Select
                name="projectID"
                label="Project"
                data={candidates.candidates!.map((proj) => ({
                  value: proj.projects_id.toString(10),
                  label: proj.projects_name,
                }))}
              />
              <Button type="submit" disabled={isPending}>
                Link
              </Button>
            </form>
          ),
        });
      });
    },
    [modals],
  );

  return (
    <div className="mb-4 flex h-min w-auto flex-shrink flex-wrap justify-end gap-1 sm:mb-0 sm:max-md:w-1/3">
      <Button variant="danger" className="block">
        Delete Event
      </Button>
      <Button variant="warning" className="block">
        Cancel Event
      </Button>
      <Menu shadow="md">
        <Menu.Target>
          <Button
            color={props.event.adam_rms_project_id !== null ? "green" : "blue"}
            loading={isPending}
          >
            <Image src={AdamRMSLogo} className="mr-1 h-4 w-4" alt="" />
            Kit List
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {props.event.adam_rms_project_id === null ? (
            <>
              <Menu.Item
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await createAdamRMSProject(props.event.event_id);
                  })
                }
              >
                New AdamRMS Project
              </Menu.Item>
              <Menu.Item
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await doLink();
                  })
                }
              >
                Link Existing Project
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                component="a"
                href={`https://dash.adam-rms.com/project/?id=${props.event.adam_rms_project_id}`}
                target="_blank"
              >
                View AdamRMS Project
              </Menu.Item>
              <Menu.Item
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await unlinkAdamRMS(props.event.event_id);
                  })
                }
              >
                Unlink Project
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
      <Button onClick={() => setEditOpen(true)} className="block">
        Edit Event
      </Button>
      <Modal opened={isEditOpen} onClose={() => setEditOpen(false)}>
        <EditModal event={props.event} close={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
