import { type CommitteePosition } from "@prisma/client";
import { type z } from "zod";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  addPositionToTeam,
  fetchCommitteeTeamForAdmin,
  fetchPositionsNotInTeam,
  removePositionFromTeam,
  reorderPositionInTeam,
  type TCommitteeTeamForAdmin,
} from "@/features/committee";

import {
  addPositionToTeamSchema,
  fetchCommitteeTeamForAdminSchema,
  fetchPositionsNotInTeamSchema,
  reorderPositionInTeamSchema,
} from "./schema";

export async function fetchCommitteeTeamForAdminAction(
  data: z.infer<typeof fetchCommitteeTeamForAdminSchema>,
): Promise<FormResponse<{ data: TCommitteeTeamForAdmin }>> {
  const safeData = fetchCommitteeTeamForAdminSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return fetchCommitteeTeamForAdmin(safeData.data);
}

export async function fetchPositionsNotInTeamAction(
  data: z.infer<typeof fetchPositionsNotInTeamSchema>,
): Promise<FormResponse<{ data: CommitteePosition[] }>> {
  const safeData = fetchPositionsNotInTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return fetchPositionsNotInTeam(safeData.data);
}

export async function addPositionToTeamAction(
  data: z.infer<typeof addPositionToTeamSchema>,
): Promise<FormResponse> {
  const safeData = addPositionToTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return addPositionToTeam(safeData.data);
}

export async function removePositionFromTeamAction(
  data: z.infer<typeof addPositionToTeamSchema>,
): Promise<FormResponse> {
  const safeData = addPositionToTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return removePositionFromTeam(safeData.data);
}

export async function reorderPositionInTeamAction(
  data: z.infer<typeof reorderPositionInTeamSchema>,
): Promise<FormResponse> {
  const safeData = reorderPositionInTeamSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return reorderPositionInTeam(safeData.data);
}
