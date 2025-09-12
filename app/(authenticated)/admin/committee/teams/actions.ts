"use server";

import { type CommitteeTeam } from "@prisma/client";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  createCommitteeTeam,
  deleteCommitteeTeam,
  fetchCommitteeTeams,
  updateCommitteeTeam,
} from "@/features/committee";

import {
  createCommitteeTeamSchema,
  deleteCommitteeTeamSchema,
  searchParamsSchema,
  updateCommitteeTeamSchema,
} from "./schema";

export type TFetchCommitteeTeams = {
  data: (CommitteeTeam & {
    _count: { position_teams: number };
  })[];
  page: number;
  total: number;
};

export async function fetchCommitteeTeamsAction(
  data: unknown,
): Promise<FormResponse<TFetchCommitteeTeams>> {
  const safeData = searchParamsSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const positionsData = await fetchCommitteeTeams({
    count: safeData.data.count,
    page: safeData.data.page,
    query: decodeURIComponent(safeData.data.query ?? ""),
  });

  return { ok: true, ...positionsData };
}

export async function createCommitteeTeamAction(
  data: unknown,
): Promise<FormResponse<{ committeeTeam: CommitteeTeam }>> {
  const safeData = createCommitteeTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return createCommitteeTeam(safeData.data);
}

export async function deleteCommitteeTeamAction(
  data: unknown,
): Promise<FormResponse<{ committee_team_id: number }>> {
  const safeData = deleteCommitteeTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return deleteCommitteeTeam(safeData.data);
}

export async function updateCommitteeTeamAction(
  data: unknown,
): Promise<FormResponse<{ committeeTeam: CommitteeTeam }>> {
  const safeData = updateCommitteeTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return updateCommitteeTeam(safeData.data);
}
