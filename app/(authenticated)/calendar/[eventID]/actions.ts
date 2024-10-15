"use server";
import {
  CheckWithTechActionSchema,
  EditEventSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import { zodErrorResponse, type FormResponse } from "@/components/forms";
import * as Calendar from "@/features/calendar";
import { updateEventAttendeeStatus } from "@/features/calendar/events";
import { canManage } from "@/features/calendar/permissions";
import {
  AttendStatuses,
  type AttendStatus,
} from "@/features/calendar/statuses";
import { hasRSVP, type EventType } from "@/features/calendar/types";
import { wrapServerAction } from "@/lib/actions";
import {
  getCurrentUser,
  mustGetCurrentUser,
  requirePermission,
} from "@/lib/auth/server";
import invariant from "@/lib/invariant";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

export const editEvent = wrapServerAction(
  "editEvent",
  async function editEvent(
    eventID: number,
    payload: z.infer<typeof EditEventSchema>,
  ): Promise<FormResponse> {
    const me = await getCurrentUser();
    const data = await EditEventSchema.safeParseAsync(payload);
    if (!data.success) {
      return zodErrorResponse(data.error);
    }
    const result = await Calendar.updateEvent(eventID, data.data, me.user_id);
    if (!result.ok) {
      switch (result.reason) {
        case "kit_clash":
          return {
            ok: false,
            errors: {
              root: "The changed dates would result in a kit clash. Please contact the Tech Team.",
            },
          };
        default:
          return {
            ok: false,
            errors: {
              root: "An unknown error occurred (" + result.reason + ")",
            },
          };
      }
    }
    revalidatePath(`/calendar/${eventID}`);
    revalidatePath("calendar");
    return { ok: true };
  },
);

export const updateAttendeeStatus = wrapServerAction(
  "updateAttendeeStatus",
  async function updateAttendeeStatus(eventID: number, status: AttendStatus) {
    const me = await getCurrentUser();
    // NB: this is an action, so we can't trust the status
    if (!AttendStatuses.includes(status)) {
      return {
        ok: false,
        errors: {
          root: "Invalid status",
        },
      };
    }

    const evt = await Calendar.getEvent(eventID);
    if (!evt) {
      return {
        ok: false,
        errors: {
          root: "Event not found",
        },
      };
    }
    if (!hasRSVP(evt.event_type as unknown as EventType)) {
      return {
        ok: false,
        errors: {
          root: "This event cannot be RSVP'd to",
        },
      };
    }

    if (isSlackEnabled) {
      if (status === "attending" || status === "maybe_attending") {
        const slackUser = me.identities.find((x) => x.provider == "slack");
        if (slackUser && evt.slack_channel_id) {
          const slackApp = await slackApiConnection();

          try {
            await slackApp.client.conversations.invite({
              channel: evt.slack_channel_id,
              users: slackUser.provider_key,
            });
          } catch (e) {}

          await slackApp.client.chat.postEphemeral({
            channel: evt.slack_channel_id,
            user: slackUser.provider_key,
            text: `You have been added to this channel as you expressed your interest in attending '${evt.name}'.`,
          });
        }
      }
    }

    await updateEventAttendeeStatus(evt.event_id, me.user_id, status);

    revalidatePath(`/calendar/${evt.event_id}`);
    return { ok: true };
  },
);

export const createAdamRMSProject = wrapServerAction(
  "createAdamRMSProject",
  async function createAdamRMSProject(eventID: number) {
    const me = await mustGetCurrentUser();
    await requirePermission("CalendarIntegration.Admin");
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to cancel this event",
        },
      };
    }

    await Calendar.addProjectToAdamRMS(eventID, me.user_id);
    revalidatePath(`/calendar/${event.event_id}`);
    return { ok: true };
  },
);

export const getAdamRMSLinkCandidates = wrapServerAction(
  "getAdamRMSLinkCandidates",
  async function getAdamRMSLinkCandidates() {
    const me = await mustGetCurrentUser();
    await requirePermission("CalendarIntegration.Admin");
    // Rudimentary check
    if (me.permissions.length === 0) {
      return { ok: false, errors: { root: "You do not have permission" } };
    }
    return { ok: true, candidates: await Calendar.getAdamRMSLinkCandidates() };
  },
);

export const linkAdamRMSProject = wrapServerAction(
  "linkAdamRMSProject",
  async function linkAdamRMSProject(eventID: number, projectID: number) {
    const me = await mustGetCurrentUser();
    await requirePermission("CalendarIntegration.Admin");
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to manage this event",
        },
      };
    }

    const res = await Calendar.linkAdamRMS(eventID, projectID);
    if (!res.ok) {
      switch (res.error) {
        case "kit_clash":
          return {
            ok: false,
            errors: {
              root: "The project dates would result in a kit clash. Please contact the Tech Team.",
            },
          };
        default:
          return {
            ok: false,
            errors: {
              root: `An unknown error occurred (${res.error})`,
            },
          };
      }
    }
    revalidatePath(`/calendar/${event.event_id}`);
    return { ok: true };
  },
);

export const unlinkAdamRMS = wrapServerAction(
  "unlinkAdamRMS",
  async function unlinkAdamRMS(eventID: number) {
    const me = await mustGetCurrentUser();
    await requirePermission("CalendarIntegration.Admin");
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to manage this event",
        },
      };
    }

    await Calendar.unlinkAdamRMS(eventID);
    revalidatePath(`/calendar/${event.event_id}`);
    return { ok: true };
  },
);

export const cancelEvent = wrapServerAction(
  "cancelEvent",
  async function cancelEvent(eventID: number) {
    const me = await mustGetCurrentUser();
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to cancel this event",
        },
      };
    }

    await Calendar.cancelEvent(eventID);

    revalidatePath(`/calendar/${event.event_id}`);
    revalidatePath("/calendar");
    return { ok: true };
  },
);

export const reinstateEvent = wrapServerAction(
  "reinstateEvent",
  async function reinstateEvent(eventID: number) {
    const me = await mustGetCurrentUser();
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to reinstate this event",
        },
      };
    }

    await Calendar.reinstateEvent(eventID);

    revalidatePath(`/calendar/${event.event_id}`);
    revalidatePath("/calendar");
    return { ok: true };
  },
);

export const deleteEvent = wrapServerAction(
  "deleteEvent",
  async function deleteEvent(eventID: number) {
    const me = await mustGetCurrentUser();
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!canManage(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to delete this event",
        },
      };
    }

    await Calendar.deleteEvent(eventID, me.user_id);

    revalidatePath(`/calendar/${event.event_id}`);
    revalidatePath("/calendar");
    return { ok: true };
  },
);

export const doCheckWithTech = wrapServerAction(
  "doCheckWithTech",
  async function doCheckWithTech(
    eventID: number,
    memo: string,
    isConfident: boolean,
  ) {
    const me = await mustGetCurrentUser();
    const event = await Calendar.getEvent(eventID);
    invariant(event, "Event does not exist");

    if (!Calendar.canManageAnySignupSheet(event, me)) {
      return {
        ok: false,
        errors: {
          root: "You do not have permission to do this.",
        },
      };
    }

    await Calendar.postCheckWithTech(
      eventID,
      memo,
      isConfident ? "check" : "help",
    );

    revalidatePath(`/calendar/${event.event_id}`);

    return { ok: true };
  },
);

export const equipmentListTemplates = wrapServerAction(
  "equipmentListTemplates",
  async function equipmentListTemplates() {
    return await Calendar.getEquipmentListTemplates();
  },
);

export const actionCheckWithTech = wrapServerAction(
  "actionCheckWithTech",
  async function actionCheckWithTech(dataRaw: unknown): Promise<FormResponse> {
    const data = CheckWithTechActionSchema.safeParse(dataRaw);
    if (!data.success) {
      return zodErrorResponse(data.error);
    }
    const { cwtID, action, note, request, eventID } = data.data;
    switch (action) {
      case "approve":
        if (!request) {
          return { ok: false, errors: { request: "No request provided" } };
        }
        await Calendar.approveCheckWithTech(cwtID, request, note);
        break;
      case "note":
        if (!note) {
          return { ok: false, errors: { note: "No note provided" } };
        }
        await Calendar.addNoteToCheckWithTech(cwtID, note);
        break;
      case "decline":
        await Calendar.declineCheckWithTech(cwtID, note);
        break;
    }

    revalidatePath(`/calendar/${eventID}`);
    return { ok: true };
  },
);
