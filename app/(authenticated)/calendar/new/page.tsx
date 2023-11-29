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
import { App } from "@slack/bolt";
import { SlackEnabledProvider } from "@/components/slack/SlackEnabledProvider";

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
    if (payload.data.slack_channel_id && isSlackEnabled) {
      const channel_info = await slackApp.client.conversations.info({
        channel: payload.data.slack_channel_id,
      });

      if (channel_info.ok) {
        slack_channel_id = payload.data.slack_channel_id;
      }
    } else if (payload.data.slack_new_channel_name) {
      const new_channel = await slackApp.client.conversations.create({
        name: payload.data.slack_new_channel_name,
        team_id: process.env.SLACK_TEAM_ID,
      });

      if (new_channel.channel?.id) {
        slack_channel_id = new_channel.channel?.id;
      }
    }

    if (slack_channel_id && user.slack_user_id) {
      await slackApp.client.conversations.invite({
        channel: slack_channel_id,
        users: user.slack_user_id,
      });
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
  const slackApp = await slackApiConnection();

  const slackChannels = await slackApp.client.conversations.list({
    team_id: process.env.SLACK_TEAM_ID,
  });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 mt-0 text-4xl font-bold">New Event</h1>
      <MembersProvider members={allMembers}>
        <SlackChannelsProvider slackChannels={slackChannels.channels!}>
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
