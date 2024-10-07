import { mustGetCurrentUser } from "@/lib/auth/server";
import { CreateEventForm } from "@/app/(authenticated)/calendar/new/form";
import { creatableEventTypes } from "@/features/calendar/permissions";
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
import { env } from "@/lib/env";
import { createEvent } from "./actions";
import { SetClientData } from "@/components/SetClientData";

async function getSlackChannels(): Promise<Channel[]> {
  var fetchedSlackChannels: Channel[] = [];

  let slackApp: App | null = null;

  if (isSlackEnabled) {
    slackApp = await slackApiConnection();
    const slackChannels = await slackApp.client.conversations.list({
      team_id: env.SLACK_TEAM_ID,
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
    (await mustGetCurrentUser()).permissions,
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
      <SetClientData title="New Event" />
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
