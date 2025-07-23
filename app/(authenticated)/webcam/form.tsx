"use client";

import { ActionIcon, Button, Modal, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { type WebcamFeed } from "@prisma/client";
import { FaEdit, FaTrash } from "react-icons/fa";
import { type z } from "zod";

import Form, { type FormResponse } from "@/components/Form";
import { TextField } from "@/components/FormFields";

import {
  addWebcamSchema,
  editWebcamSchema,
  type removeWebcamSchema,
} from "./schema";

export function WebcamCreateForm(props: {
  create: (data: z.infer<typeof addWebcamSchema>) => Promise<FormResponse>;
}) {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={closeModal}>
        <Form
          schema={addWebcamSchema}
          action={props.create}
          submitLabel="Add Webcam"
          onSuccess={() => {
            closeModal();
            notifications.show({
              message: "Successfully added webcam",
              color: "green",
            });
          }}
        >
          <TextField
            name="full_name"
            label="Webcam Name"
            placeholder="Studio Cam 1"
          />
          <TextField
            name="identifier"
            label="Identifier"
            placeholder="studiocam1"
          />
          <TextField
            name="stream_url"
            label="HLS URL"
            placeholder="https://example.com/studiocam1.m3u8"
          />
        </Form>
      </Modal>
      <Button onClick={openModal}>Add Webcam</Button>
    </>
  );
}

export function WebcamEditForm(props: {
  edit: (data: z.infer<typeof editWebcamSchema>) => Promise<FormResponse>;
  webcam: WebcamFeed;
}) {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={closeModal}>
        <Form
          schema={editWebcamSchema}
          action={props.edit}
          submitLabel="Update Webcam"
          onSuccess={() => {
            closeModal();
            notifications.show({
              message: "Successfully edited webcam",
              color: "green",
            });
          }}
          initialValues={props.webcam}
        >
          <TextField
            name="full_name"
            label="Webcam Name"
            placeholder="Studio Cam 1"
          />
          <TextField
            name="identifier"
            label="Identifier"
            placeholder="studiocam1"
          />
          <TextField
            name="stream_url"
            label="Stream URL"
            placeholder="http://go2rtc/api/stream.mp4?src=studiocam1"
          />
        </Form>
      </Modal>
      <Tooltip label={"Edit"}>
        <ActionIcon onClick={openModal}>
          <FaEdit />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

export function WebcamRemoveForm(props: {
  remove: (data: z.infer<typeof removeWebcamSchema>) => Promise<FormResponse>;
  webcam: WebcamFeed;
}) {
  return (
    <>
      <Tooltip label={"Remove"}>
        <ActionIcon
          onClick={() =>
            openConfirmModal({
              title: `Remove ${props.webcam.full_name}?`,
              centered: true,
              labels: { confirm: "Remove Webcam", cancel: "Cancel" },
              confirmProps: { color: "red" },
              onConfirm: async () => {
                const removeResponse = await props.remove({
                  webcam_id: props.webcam.webcam_id,
                });
                if (removeResponse.ok) {
                  notifications.show({
                    message: `Successfully removed ${props.webcam.full_name}`,
                    color: "green",
                  });
                } else {
                  notifications.show({
                    message: `Failed to remove ${props.webcam.full_name}`,
                    color: "red",
                  });
                }
              },
            })
          }
          color="red"
        >
          <FaTrash />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
