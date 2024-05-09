"use server";
import {
  getCurrentUser,
  mustGetCurrentUser,
  requirePermission,
} from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AttendStatus, AttendStatuses } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  EditEventSchema,
  SignupSheetSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import { FormResponse } from "@/components/Form";
import { updateSignUpSheet } from "@/features/calendar/signup_sheets";
import { updateEventAttendeeStatus } from "@/features/calendar/events";
import { isBefore } from "date-fns";
import invariant from "@/lib/invariant";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";

export async function editEvent(
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
}

export async function updateAttendeeStatus(
  eventID: number,
  status: AttendStatus,
) {
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
}
export async function createAdamRMSProject(eventID: number) {
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
}

export async function getAdamRMSLinkCandidates() {
  const me = await mustGetCurrentUser();
  await requirePermission("CalendarIntegration.Admin");
  // Rudimentary check
  if (me.permissions.length === 0) {
    return { ok: false, errors: { root: "You do not have permission" } };
  }
  return { ok: true, candidates: await Calendar.getAdamRMSLinkCandidates() };
}

export async function linkAdamRMSProject(eventID: number, projectID: number) {
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
}

export async function unlinkAdamRMS(eventID: number) {
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
}

export async function cancelEvent(eventID: number) {
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
}

export async function reinstateEvent(eventID: number) {
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
}

export async function deleteEvent(eventID: number) {
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
}

export async function doCheckWithTech(
  eventID: number,
  memo: string,
  isConfident: boolean,
) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to do this.",
      },
    };
  }

  if (isConfident) {
    await Calendar.postCheckWithTech(eventID, memo);
  } else {
    await Calendar.postTechHelpRequest(eventID, memo);
  }

  return { ok: true };
}
