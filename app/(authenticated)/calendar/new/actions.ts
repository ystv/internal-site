"use server";

import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { canCreate } from "@/features/calendar";
import { wrapServerAction } from "@/lib/actions";
import { Forbidden } from "@/lib/auth/errors";
import { Permission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/server";
import { parseAsSlackError } from "@/lib/slack";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { ConversationsInfoResponse } from "@slack/web-api/dist/response/ConversationsInfoResponse";
import * as Calendar from "@/features/calendar";
import { revalidatePath } from "next/cache";
import { env } from "process";
import { schema } from "./schema";
import { App } from "@slack/bolt";

export const createEvent = wrapServerAction(
  "createEvent",
  async function createEvent(
    data: unknown,
  ): Promise<FormResponse<{ id: number }>> {
    const me = await getCurrentUser();
    let slackApp: App | null = null;
    if (isSlackEnabled) {
      slackApp = await slackApiConnection();
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
            const error = parseAsSlackError(e);

            //Throw the error if it isn't just telling us the user is already in the channel
            if (!error) throw e;
            if (error.code !== "already_in_channel") throw e;
          }
        }
      }
    }

    const evt = await Calendar.createEvent(
      {
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
      },
      me.user_id,
    );
    revalidatePath("calendar");
    return {
      ok: true,
      id: evt.event_id,
    };
  },
);
