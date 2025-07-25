"use server";

import { type App } from "@slack/bolt";
import { type ConversationsInfoResponse } from "@slack/web-api/dist/types/response/ConversationsInfoResponse";
import { revalidatePath } from "next/cache";
import { env } from "process";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import * as Calendar from "@/features/calendar";
import { canCreate } from "@/features/calendar";
import { wrapServerAction } from "@/lib/actions";
import { Forbidden } from "@/lib/auth/errors";
import { type Permission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/server";
import { parseAndThrowOrIgnoreSlackError } from "@/lib/slack/errors";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";

import { schema } from "./schema";

export const createEvent = wrapServerAction(
  "createEvent",
  async function createEvent(
    data: unknown,
  ): Promise<FormResponse<{ id: number }>> {
    const me = await getCurrentUser();
    let slackApp: App | null = null;
    if (isSlackEnabled) {
      slackApp = slackApiConnection();
    }
    const payload = schema.safeParse(data);
    if (!payload.success) {
      return zodErrorResponse(payload.error);
    }
    if (!canCreate(payload.data.type, me)) {
      throw new Forbidden([
        "Calendar.Admin",
        `Calendar.${payload.data.type}.Creator` as Permission,
        `Calendar.${payload.data.type}.Admin` as Permission,
      ]);
    }

    let slack_channel_id: string | undefined;

    if (slackApp) {
      let channel_info: ConversationsInfoResponse | undefined;

      if (payload.data.slack_channel_id && isSlackEnabled) {
        // Unless something goes horribly wrong slack_channel_id will always be valid
        channel_info = await slackApp.client.conversations.info({
          channel: payload.data.slack_channel_id,
        });

        if (channel_info.ok) {
          slack_channel_id = payload.data.slack_channel_id;
        }
      } else if (payload.data.slack_channel_new_name) {
        try {
          // Create a new channel from the given user input
          const new_channel = await slackApp.client.conversations.create({
            name: payload.data.slack_channel_new_name,
            team_id: env.SLACK_TEAM_ID,
          });

          if (!new_channel.ok) {
            return {
              ok: false,
              errors: {
                slack_channel: "Channel creation error: " + new_channel.error,
              },
            };
          }

          if (new_channel.channel?.id) {
            slack_channel_id = new_channel.channel?.id;
          }

          // slack_channel_id is set here because if there was an error creating the channel it will exit before this point
          channel_info = await slackApp.client.conversations.info({
            channel: slack_channel_id!,
          });
        } catch (error) {
          return {
            ok: false,
            errors: {
              slack_channel:
                "The slack channel name may already be in use, please try a different name or contact comp team if you are 100% sure this isn't the case.",
            },
          };
        }
      }

      const slackUser = me.identities.find((i) => i.provider === "slack");
      if (slack_channel_id && slackUser) {
        // Check if channel exists from previous API calls
        if (channel_info?.ok) {
          // If the bot isn't a member (channel exists already), join the channel
          if (!channel_info.channel?.is_member) {
            await slackApp.client.conversations.join({
              channel: slack_channel_id,
            });
          }

          try {
            await slackApp.client.conversations.invite({
              channel: slack_channel_id,
              users: slackUser.provider_key,
            });
          } catch (e) {
            parseAndThrowOrIgnoreSlackError(e, "already_in_channel");
          }
        }
      }
    }

    var evt: Calendar.EventObjectType | undefined;

    const eventCreatePayload = {
      name: payload.data.name,
      description: payload.data.description,
      event_type: payload.data.type,
      start_date: payload.data.startDate,
      end_date: payload.data.endDate,
      location: payload.data.location,
      is_private: payload.data.private,
      is_tentative: payload.data.tentative,
      host: payload.data.host,
      slack_channel_id: slack_channel_id,
    };

    if (payload.data.is_recurring && payload.data.recurring_dates.length > 0) {
      evt = await Calendar.createRecurringEvent(
        eventCreatePayload,
        me.user_id,
        payload.data.recurring_dates,
      );
    } else {
      evt = await Calendar.createEvent(eventCreatePayload, me.user_id);
    }

    revalidatePath("calendar");
    return {
      ok: true,
      id: evt.event_id,
    };
  },
);
