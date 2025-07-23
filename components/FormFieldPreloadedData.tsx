"use client";

import { createContext, useContext } from "react";

import type { CrewPositionType } from "@/features/calendar";
import { type ExposedUser } from "@/features/people";
import invariant from "@/lib/invariant";

const CrewPositionsContext = createContext<CrewPositionType[] | null>(null);

export function CrewPositionsProvider(props: {
  children: React.ReactNode;
  positions: CrewPositionType[];
}) {
  return (
    <CrewPositionsContext.Provider value={props.positions}>
      {props.children}
    </CrewPositionsContext.Provider>
  );
}

export function useCrewPositions(): CrewPositionType[] {
  const v = useContext(CrewPositionsContext);
  invariant(
    v !== null,
    "Crew positions context not set. (Have you forgotten to add a CrewPositionsProvider?)",
  );
  return v;
}

const MembersContext = createContext<ExposedUser[] | null>(null);

export function MembersProvider(props: {
  children: React.ReactNode;
  members: ExposedUser[];
}) {
  return (
    <MembersContext.Provider value={props.members}>
      {props.children}
    </MembersContext.Provider>
  );
}

export function useMembers(): ExposedUser[] {
  const v = useContext(MembersContext);
  invariant(
    v !== null,
    "Members context not set. (Have you forgotten to add a MembersProvider?)",
  );
  return v;
}
