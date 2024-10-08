"use client";

import {
  Alert,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Textarea,
} from "@mantine/core";
import { Suspense, cache, use, useState, useTransition } from "react";
import { TbTool } from "react-icons/tb";
import {
  actionCheckWithTech,
  doCheckWithTech,
  equipmentListTemplates,
} from "./actions";
import { notifications } from "@mantine/notifications";
import { CheckWithTechType } from "@/features/calendar";
import { getUserName } from "@/components/UserHelpers";
import { useModals } from "@mantine/modals";
import Form from "@/components/Form";
import { CheckWithTechActionSchema } from "./schema";
import { HiddenField, TextAreaField } from "@/components/FormFields";
import SlackIcon from "@/components/icons/SlackIcon";

const _getEquipmentListTemplates = cache(equipmentListTemplates);

function SelectTemplate(props: {
  done: (title: string, memo: string) => void;
}) {
  const templates = use(_getEquipmentListTemplates());

  return (
    <div className="grid grid-cols-3">
      {templates.map((template) => (
        <div key={template.equipment_list_template_id}>
          <h3>{template.name}</h3>
          <p>{template.description}</p>
          <Button
            onClick={() =>
              props.done(
                template.name,
                /* lazy */ template.items.replace(/\\n/g, "\n"),
              )
            }
            variant="light"
          >
            Use
          </Button>
        </div>
      ))}
    </div>
  );
}

function PostMessage(props: {
  eventID: number;
  isConfident: boolean;
  done: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [memo, setMemo] = useState("");
  return (
    <>
      <Button
        onClick={() => setShowTemplatePopup(true)}
        variant="light"
        className="mb-4"
      >
        Use template
      </Button>
      <Modal
        opened={showTemplatePopup}
        onClose={() => setShowTemplatePopup(false)}
      >
        <Suspense fallback={<p>Loading templates...</p>}>
          <SelectTemplate
            done={(title, items) => {
              setShowTemplatePopup(false);
              setMemo(`# ${title}\n\n${items}`);
            }}
          />
        </Suspense>
      </Modal>
      <Textarea
        label="Notes"
        value={memo}
        onChange={(e) =>
          setMemo((old) => {
            if (old.startsWith("#") && !old.includes("(modified)")) {
              return e.target.value.replace(/^(# .+)$/m, "$1 (modified)");
            }
            return e.target.value;
          })
        }
        rows={5}
      />
      <p>
        These notes will be posted in a public Slack channel.{" "}
        {props.isConfident ? (
          <p>
            Please include a list of what equipment you&apos;ll need (cameras,
            audio, lighting etc.)
          </p>
        ) : (
          <p>
            Please describe your production, especially any unusual technical
            aspects.
          </p>
        )}
      </p>
      <Button
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await doCheckWithTech(
              props.eventID,
              memo,
              props.isConfident,
            );
            if (result.ok) {
              notifications.show({
                title: "Sent!",
                message:
                  "Keep an eye out on Slack in case the tech team need any further details.",
              });
              props.done();
            } else {
              notifications.show({
                title: "Sorry, something went wrong...",
                message: result.errors?.root ?? "Please try again later.",
                color: "red",
              });
            }
          })
        }
        variant="light"
        leftSection={<SlackIcon height={14} width={14} />}
      >
        Send
      </Button>
    </>
  );
}

export function CheckWithTechPromptContents(props: { eventID: number }) {
  const [isPostOpen, setPostOpen] = useState(false);
  const [confident, setConfident] = useState<boolean | null>(null);
  return (
    <>
      <Alert
        variant="light"
        color="blue"
        title="#CheckWithTech"
        icon={<TbTool />}
      >
        <strong>Don&apos;t forget to #CheckWithTech!</strong>
        <p>
          Make sure the tech team knows about your plans, so they can have the
          equipment you need ready for you. Do this by posting in the
          #check-with-tech channel on Slack. The Calendar can also do this for
          you if you like!
        </p>
        <Button onClick={() => setPostOpen(true)}>Check With Tech</Button>
      </Alert>
      <Modal opened={isPostOpen} onClose={() => setPostOpen(false)}>
        <h1 className="mt-0">Check With Tech</h1>
        {confident === null ? (
          <>
            <p>
              <strong>
                Do you already know what equipment you&apos;ll need for your
                production?
              </strong>
            </p>
            <p>Don&apos;t worry if you don&apos;t - we&apos;ll help you out.</p>
            <ButtonGroup>
              <Button
                onClick={() => {
                  setConfident(true);
                }}
              >
                Yes, I know what I need
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setConfident(false);
                }}
              >
                No, I&apos;m not sure
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <PostMessage
            eventID={props.eventID}
            isConfident={confident}
            done={() => {
              setPostOpen(false);
              setConfident(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

export function CheckWithTechAdminBanner({ cwt }: { cwt: CheckWithTechType }) {
  const [modalOpen, setModalOpen] = useState<
    "approve" | "note" | "decline" | null
  >(null);

  return (
    <>
      <Alert
        variant="light"
        color="blue"
        title="#CheckWithTech"
        icon={<TbTool />}
      >
        <strong>
          #CheckWithTech request from {getUserName(cwt.submitted_by_user)}
        </strong>
        <p>{cwt.request}</p>
        {cwt.notes.length > 0 && <p>Notes: {cwt.notes}</p>}
        {cwt.status !== "Requested" && (
          <strong>
            {cwt.status}
            {cwt.confirmed_by_user &&
              " by " + getUserName(cwt.confirmed_by_user)}
          </strong>
        )}
        {cwt.status === "Requested" && (
          <ButtonGroup>
            <Button onClick={() => setModalOpen("approve")} color="green">
              Approve
            </Button>
            <Button onClick={() => setModalOpen("note")}>Leave Note</Button>
            <Button onClick={() => setModalOpen("decline")} color="red">
              Decline
            </Button>
          </ButtonGroup>
        )}
      </Alert>
      <Modal opened={modalOpen !== null} onClose={() => setModalOpen(null)}>
        <ModalHeader>
          <ModalTitle>
            {modalOpen === "approve"
              ? "Approve"
              : modalOpen === "note"
              ? "Leave Note"
              : "Decline"}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {modalOpen !== null && (
            <Form
              action={actionCheckWithTech}
              schema={CheckWithTechActionSchema}
              onSuccess={() => setModalOpen(null)}
              initialValues={{
                action: modalOpen,
                cwtID: cwt.cwt_id,
                eventID: cwt.event_id,
                request: cwt.request,
                note: cwt.notes,
              }}
              submitLabel={
                modalOpen === "approve"
                  ? "Approve"
                  : modalOpen === "note"
                  ? "Leave Note"
                  : "Decline"
              }
              submitColor={
                modalOpen === "approve"
                  ? "green"
                  : modalOpen === "note"
                  ? "blue"
                  : "red"
              }
            >
              <HiddenField name="cwtID" value={cwt.cwt_id.toString(10)} />
              {modalOpen === "approve" && (
                <TextAreaField name="request" label="Request" autosize />
              )}
              <TextAreaField name="note" label="Notes" autosize />
            </Form>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}
