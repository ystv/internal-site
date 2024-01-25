import { getCurrentUser } from "@/lib/auth/server";
import { schema } from "./schema";
import { CreateEventForm } from "@/app/(authenticated)/calendar/new/form";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  canCreate,
  creatableEventTypes,
} from "@/features/calendar/permissions";
import * as Calendar from "@/features/calendar/events";
import { Permission } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { Forbidden } from "@/lib/auth/errors";
import { getAllUsers } from "@/features/people";
import { MembersProvider } from "@/components/FormFieldPreloadedData";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { SlackChannelsProvider } from "@/components/slack/SlackChannelsProvider";
import { SlackEnabledProvider } from "@/components/slack/SlackEnabledProvider";
import { App } from "@slack/bolt";
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import { ConversationsInfoResponse } from "@slack/web-api/dist/response/ConversationsInfoResponse";

async function createEvent(
  data: unknown,
): Promise<FormResponse<{ id: number }>> {
  "use server";
  const user = await getCurrentUser();
  let slackApp: App | null = null;
  if (isSlackEnabled) {
    slackApp = await slackApiConnection();
  }
  const payload = schema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }
  if (!canCreate(payload.data.type, user)) {
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
    } else if (payload.data.slack_new_channel_name) {
      try {
        // Create a new channel from the given user input
        const new_channel = await slackApp.client.conversations.create({
          name: payload.data.slack_new_channel_name,
          team_id: process.env.SLACK_TEAM_ID,
        });

        if (!new_channel.ok) {
          return {
            ok: false,
            errors: { root: "Channel creation error: " + new_channel.error },
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

    if (slack_channel_id && user.slack_user_id) {
      // Check if channel exists from previous API calls
      if (channel_info?.ok) {
        // If the bot isn't a member (channel exists already), join the channel
        if (!channel_info.channel?.is_member) {
          await slackApp.client.conversations.join({
            channel: slack_channel_id,
          });
        }

        // Check if the user creating the event is in the channel or not, add them if not
        const channel_members = await slackApp.client.conversations.members({
          channel: slack_channel_id,
          limit: channel_info.channel?.num_members,
        });

        if (channel_members.ok) {
          if (!channel_members.members?.includes(user.slack_user_id)) {
            await slackApp.client.conversations.invite({
              channel: slack_channel_id,
              users: user.slack_user_id,
            });
          }
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
    user.user_id,
  );
  revalidatePath("calendar");
  return {
    ok: true,
    id: evt.event_id,
  };
}

async function getSlackChannels(): Promise<Channel[]> {
  var fetchedSlackChannels: Channel[] = [];

  let slackApp: App | null = null;

  if (isSlackEnabled) {
    slackApp = await slackApiConnection();
    const slackChannels = await slackApp.client.conversations.list({
      team_id: process.env.SLACK_TEAM_ID,
      types: "public_channel",
      exclude_archived: true,
      limit: 1000,
    });

    slackChannels.channels?.map((channel) => {
      if (!(channel.is_private || channel.is_archived)) {
        fetchedSlackChannels.push(channel);
      }
    });

    fetchedSlackChannels.sort((a, b) => {
      if (a.name! > b.name!) {
        return 1;
      }
      return -1;
    });
  }

  return fetchedSlackChannels;
}

export default async function NewEventPage() {
  const permittedEventTypes = creatableEventTypes(
    (await getCurrentUser()).permissions,
  );
  if (permittedEventTypes.length === 0) {
    throw new Forbidden([
      "Calendar.Admin or Calendar.{Show,Meeting,Social}.{Creator,Admin}" as any,
    ]);
  }
  const allMembers = await getAllUsers();

  var publicSlackChannels: Promise<Channel[]> = getSlackChannels();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 mt-0 text-4xl font-bold">New Event</h1>
      <MembersProvider members={allMembers}>
        <SlackChannelsProvider slackChannels={publicSlackChannels}>
          <SlackEnabledProvider isSlackEnabled={isSlackEnabled}>
            <CreateEventForm
              action={createEvent}
              permittedEventTypes={permittedEventTypes}
            />
          </SlackEnabledProvider>
        </SlackChannelsProvider>
      </MembersProvider>
    </div>
  );
}
