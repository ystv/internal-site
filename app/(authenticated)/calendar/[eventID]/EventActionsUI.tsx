"use client";

import Form from "@/components/Form";
import { EventObjectType, EventType } from "@/features/calendar";
import {
  cancelEvent,
  createAdamRMSProject,
  deleteEvent,
  editEvent,
  reinstateEvent,
  getAdamRMSLinkCandidates,
  linkAdamRMSProject,
  unlinkAdamRMS,
} from "./actions";
import { EditEventSchema } from "./schema";
import {
  CheckBoxField,
  ConditionalField,
  DatePickerField,
  SearchedMemberSelect,
  TextAreaField,
  TextField,
} from "@/components/FormFields";
import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import AdamRMSLogo from "../../../_assets/adamrms-logo.png";
import { Button, Menu, Modal, Select, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/UserContext";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { Project } from "@/lib/adamrms";

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
      <ConditionalField
        referencedFieldName="type"
        condition={(t) => t !== "show"}
        childFieldName="host"
      >
        <SearchedMemberSelect name="host" label="Host" />
      </ConditionalField>
      {/*<br />*/}
      {/*<CheckBoxField name="is_private" label="Private Event" />*/}
      <br />
      <CheckBoxField name="is_tentative" label="Tentative Event" />
    </Form>
  );
}

function AdamRMSLinkModal(props: { eventID: number; candidates: Project[] }) {
  const [isPending, startTransition] = useTransition();
  const modals = useModals();
  return (
    <form
      action={(data) => {
        startTransition(async () => {
          const res = await linkAdamRMSProject(
            props.eventID,
            parseInt(data.get("projectID") as string, 10),
          );
          if (res.ok) {
            modals.closeAll();
          } else {
            modals.openModal({
              id: "link-adamrms-error",
              title: "Error",
              children: (
                <>
                  <Text>{res.errors?.root}</Text>
                  <Button
                    onClick={() => modals.closeModal("link-adamrms-error")}
                  >
                    Close
                  </Button>
                </>
              ),
            });
          }
        });
      }}
    >
      <Select
        name="projectID"
        label="Project"
        data={props.candidates.map((proj) => ({
          value: proj.projects_id.toString(10),
          label: proj.projects_name,
        }))}
      />
      <Button type="submit" disabled={isPending}>
        Link
      </Button>
    </form>
  );
}

export function EventActionsUI(props: { event: EventObjectType }) {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const modals = useModals();
  const router = useRouter();

  const doCancel = useCallback(
    function doCancel() {
      modals.openConfirmModal({
        title: "Cancel " + props.event.name,
        children: (
          <Text size="sm">
            Are you sure you want to cancel {props.event.name}? You can undo
            this later.
          </Text>
        ),
        labels: { confirm: "Cancel Event", cancel: "Go Back" },
        confirmProps: {
          variant: "warning",
        },
        onConfirm() {
          startTransition(async () => {
            await cancelEvent(props.event.event_id);
          });
        },
      });
    },
    [modals, props.event],
  );

  const doReinstate = useCallback(
    function doReinstate() {
      modals.openConfirmModal({
        title: "Reinstate " + props.event.name,
        children: (
          <Text size="sm">
            Are you sure you want to reinstate {props.event.name}?
          </Text>
        ),
        labels: { confirm: "Reinstate Event", cancel: "Go Back" },
        confirmProps: {
          variant: "warning",
        },
        onConfirm() {
          startTransition(async () => {
            await reinstateEvent(props.event.event_id);
          });
        },
      });
    },
    [modals, props.event],
  );

  const doDelete = useCallback(
    function doDelete() {
      modals.openConfirmModal({
        title: "Delete " + props.event.name,
        children: (
          <Text size="sm">
            Are you sure you want to delete {props.event.name}?{" "}
            <strong>You can&apos;t undo this action.</strong>
          </Text>
        ),
        labels: { confirm: "Delete", cancel: "Cancel" },
        confirmProps: {
          variant: "danger",
        },
        onConfirm() {
          startTransition(async () => {
            await deleteEvent(props.event.event_id);
            router.push("/calendar");
          });
        },
      });
    },
    [modals, props.event, router],
  );

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
            <AdamRMSLinkModal
              eventID={props.event.event_id}
              candidates={candidates.candidates!}
            />
          ),
        });
      });
    },
    [modals, props.event.event_id],
  );

  return (
    <div className="mb-4 flex h-min w-auto flex-shrink flex-wrap justify-center gap-1 sm:mb-0 sm:justify-end sm:max-md:w-1/3">
      <Button variant="danger" className="block" onClick={doDelete}>
        Delete Event
      </Button>
      {props.event.is_cancelled ? (
        <Button variant="warning" className="block" onClick={doReinstate}>
          Reinstate Event
        </Button>
      ) : (
        <Button variant="warning" className="block" onClick={doCancel}>
          Cancel Event
        </Button>
      )}
      <PermissionGate required={["CalendarIntegration.Admin"]}>
        <Menu shadow="md">
          <Menu.Target>
            <Button color="green" loading={isPending}>
              <Image src={AdamRMSLogo} className="mr-1 h-4 w-4" alt="" />
              {props.event.adam_rms_project_id !== null
                ? "Kit List"
                : "Create Kit List"}
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
      </PermissionGate>
      <Button onClick={() => setEditOpen(true)} className="block">
        Edit Event
      </Button>
      <Modal opened={isEditOpen} onClose={() => setEditOpen(false)}>
        <EditModal event={props.event} close={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
