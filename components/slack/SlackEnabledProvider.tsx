"use client";

import invariant from "@/lib/invariant";
import { createContext, useContext } from "react";

const SlackEnabledContext = createContext<boolean | null>(null);

export function SlackEnabledProvider(props: {
  children: React.ReactNode;
  isSlackEnabled: boolean;
}) {
  return (
    <SlackEnabledContext.Provider value={props.isSlackEnabled}>
      {props.children}
    </SlackEnabledContext.Provider>
  );
}

export function useSlackEnabled(): boolean {
  const v = useContext(SlackEnabledContext);
  invariant(
    v !== null,
    "Slack Enabled context not set. (Have you forgotten to add a SlackEnabledProvider?)",
  );
  return v;
}
