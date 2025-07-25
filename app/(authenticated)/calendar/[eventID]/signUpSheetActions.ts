"use server";

import { isBefore } from "date-fns";
import { revalidatePath } from "next/cache";
import { type z } from "zod";

import { SignupSheetSchema } from "@/app/(authenticated)/calendar/[eventID]/schema";
import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import * as Calendar from "@/features/calendar";
import {
  canManage,
  canManageSignUpSheet,
  updateSignUpSheet,
} from "@/features/calendar";
import { wrapServerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/server";
import { parseAndThrowOrIgnoreSlackError } from "@/lib/slack/errors";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";

export const createSignUpSheet = wrapServerAction(
  "createSignUpSheet",
  async function createSignUpSheet(
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
  },
);

export const fetchSignUpSheet = wrapServerAction(
  "fetchSignUpSheet",
  async function fetchSignUpSheet(
    sheetID: number,
  ): Promise<Calendar.SignUpSheetType | undefined> {
    const _me = await getCurrentUser();

    const sheet = await Calendar.getSignUpSheet(sheetID);
    if (!sheet) {
      return undefined;
    }
    return sheet;
  },
);

export const editSignUpSheet = wrapServerAction(
  "editSignUpSheet",
  async function editSignUpSheet(
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

    return { ok: true } as const;
  },
);

export const deleteSignUpSheet = wrapServerAction(
  "deleteSignUpSheet",
  async function deleteSignUpSheet(sheetID: number) {
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

    return { ok: true } as const;
  },
);

export const signUpToRole = wrapServerAction(
  "signUpToRole",
  async function signUpToRole(sheetID: number, crewID: number) {
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
        const slackApp = slackApiConnection();

        const channel_info = await slackApp.client.conversations.info({
          channel: sheet.events.slack_channel_id,
        });

        if (channel_info.ok) {
          if (!channel_info.channel?.is_member) {
            await slackApp.client.conversations.join({
              channel: sheet.events.slack_channel_id,
            });
          }
        }

        // Boltjs works weirdly.
        // This code will ignore the error thrown if the user is already in the
        // channel but throw any others.
        try {
          const invitiationResponse =
            await slackApp.client.conversations.invite({
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
          parseAndThrowOrIgnoreSlackError(e, "already_in_channel");
        }
      }
    }

    revalidatePath(`/calendar/${sheet.events.event_id}`);

    return { ok: true };
  },
);

export const removeSelfFromRole = wrapServerAction(
  "removeSelfFromRole",
  async function removeSelfFromRole(sheetID: number, crewID: number) {
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

    return { ok: true };
  },
);

export const checkRoleClashes = wrapServerAction(
  "checkRoleClashes",
  async function checkRoleClashes(
    sheetID: number,
  ): Promise<Calendar.SignUpSheetWithEvent[]> {
    const me = await getCurrentUser();
    const clashes = await Calendar.getClashingSheets(me, sheetID);

    return clashes;
  },
);
