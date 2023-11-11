"use client";

import invariant from "@/lib/invariant";
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import { createContext, useContext } from "react";

const SlackChannelContext = createContext<Channel[] | null>(null);

export function SlackChannelsProvider(props: {
  children: React.ReactNode;
  slackChannels: Channel[];
}) {
  return (
    <SlackChannelContext.Provider value={props.slackChannels}>
      {props.children}
    </SlackChannelContext.Provider>
  );
}

export function useSlackChannels(): Channel[] {
  const v = useContext(SlackChannelContext);
  invariant(
    v !== null,
    "Slack Channel context not set. (Have you forgotten to add a SlackChannelProvider?)",
  );
  return v;
}
