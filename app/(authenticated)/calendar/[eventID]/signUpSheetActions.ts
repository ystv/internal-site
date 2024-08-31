"use server";

import { getCurrentUser } from "@/lib/auth/server";
import * as Calendar from "@/features/calendar";
import {
  canManage,
  canManageSignUpSheet,
  updateSignUpSheet,
} from "@/features/calendar";
import { isBefore } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SignupSheetSchema } from "@/app/(authenticated)/calendar/[eventID]/schema";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { socket } from "@/lib/socket/server";

export async function createSignUpSheet(
  eventID: number,
  sheet: z.infer<typeof SignupSheetSchema>,
): Promise<FormResponse> {
  const me = await getCurrentUser();

  const event = await Calendar.getEvent(eventID);
  if (!event) {
    return {
      ok: false,
      errors: {
        root: "Event not found",
      },
    };
  }
  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this event",
      },
    };
  }

  const payload = SignupSheetSchema.safeParse(sheet);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Calendar.createSignupSheet(eventID, payload.data);
  revalidatePath(`/calendar/${eventID}`);
  return { ok: true } as const;
}

export async function fetchSignUpSheet(
  sheetID: number,
): Promise<Calendar.SignUpSheetType | undefined> {
  const me = await getCurrentUser();

  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return undefined;
  }
  return sheet;
}

export async function editSignUpSheet(
  sheetID: number,
  data: z.infer<typeof SignupSheetSchema>,
): Promise<FormResponse> {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (!canManageSignUpSheet(sheet.events, sheet, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this signup sheet",
      },
    };
  }

  const payload = SignupSheetSchema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await updateSignUpSheet(sheetID, payload.data);
  revalidatePath(`/calendar/${sheet.events.event_id}`);
  socket.emit(`signupSheetUpdate:${sheet.signup_id}`);
  return { ok: true } as const;
}

export async function deleteSignUpSheet(sheetID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (!canManageSignUpSheet(sheet.events, sheet, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this signup sheet",
      },
    };
  }

  await Calendar.deleteSignUpSheet(sheetID);
  revalidatePath(`/calendar/${sheet.events.event_id}`);
  socket.emit(`signupSheetUpdate:${sheet.signup_id}`);
  return { ok: true } as const;
}

export async function signUpToRole(sheetID: number, crewID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (sheet.unlock_date && isBefore(new Date(), sheet.unlock_date)) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet is locked",
      },
    };
  }
  const crew = sheet.crews.find((crew) => crew.crew_id === crewID);
  if (!crew) {
    return {
      ok: false,
      errors: {
        root: "Role not found",
      },
    };
  }
  if (crew.user_id !== null) {
    return {
      ok: false,
      errors: {
        root: "Role is already filled",
      },
    };
  }
  const res = await Calendar.signUpToRole(sheetID, crewID, me.user_id);
  if (!res.ok) {
    return {
      ok: false,
      errors: {
        root: res.reason,
      },
    };
  }

  if (isSlackEnabled) {
    const slackUser = me.identities.find((i) => i.provider === "slack");
    if (slackUser && sheet.events.slack_channel_id) {
      console.log("Trying things");

      const slackApp = await slackApiConnection();

      // I don't like the way this works but boltjs works weirdly.
      // This works by attempting to invite the user to the channel.
      // If the user is already in the channel, the method throws an
      // error instead of returning it to be handled. This code will
      // catch that error and if it is an error saying the user is
      // already in the channel, it gets ignored, else the error is
      // thrown
      try {
        const invitiationResponse = await slackApp.client.conversations.invite({
          channel: sheet.events.slack_channel_id,
          users: slackUser.provider_key,
        });

        if (invitiationResponse.ok) {
          await slackApp.client.chat.postEphemeral({
            channel: sheet.events.slack_channel_id,
            user: slackUser.provider_key,
            text: `You have been added to this channel as you signed up for the role of '${sheet.crews.find(
              (crew_pos) => {
                if (crew_pos.crew_id == crewID) {
                  return true;
                }
              },
            )?.positions.name}' on '${sheet.events.name}'.`,
          });
        }
      } catch (e) {
        const parseAsSlackError = z
          .object({
            code: z.string(),
            data: z.object({
              ok: z.boolean(),
              error: z.string(),
            }),
          })
          .safeParse(e);
        if (parseAsSlackError.success) {
          if (parseAsSlackError.data.code === "already_in_channel") {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }
  }

  revalidatePath(`/calendar/${sheet.events.event_id}`);
  socket.emit(`signupSheetUpdate:${sheet.signup_id}`);
  return { ok: true };
}

export async function removeSelfFromRole(sheetID: number, crewID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  // TODO: All these checks need to go into a transaction (so inside features/calendar)
  // otherwise we risk a race condition
  if (sheet.unlock_date && isBefore(new Date(), sheet.unlock_date)) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet is locked",
      },
    };
  }
  const crew = sheet.crews.find((crew) => crew.crew_id === crewID);
  if (!crew) {
    return {
      ok: false,
      errors: {
        root: "Role not found",
      },
    };
  }
  if (crew.user_id !== me.user_id) {
    return {
      ok: false,
      errors: {
        root: "You are not signed up for this role",
      },
    };
  }
  const res = await Calendar.removeUserFromRole(sheetID, crewID, me.user_id);
  if (!res.ok) {
    return {
      ok: false,
      errors: {
        root: res.reason,
      },
    };
  }
  revalidatePath(`/calendar/${sheet.events.event_id}`);
  socket.emit(`signupSheetUpdate:${sheet.signup_id}`);
  return { ok: true };
}
