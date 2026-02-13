"use server";

import { type CommitteePosition } from "@prisma/client";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  createCommitteePosition,
  deleteCommitteePosition,
  fetchCommitteePositions,
  updateCommitteePosition,
} from "@/features/committee";

import {
  createCommitteePositionSchema,
  deleteCommitteePositionSchema,
  searchParamsSchema,
  updateCommitteePositionSchema,
} from "./schema";

export type TFetchCommitteePositions = {
  data: (CommitteePosition & {
    _count: { committee_position_members: number };
  })[];
  page: number;
  total: number;
};

export async function fetchCommitteePositionsAction(
  data: unknown,
): Promise<FormResponse<TFetchCommitteePositions>> {
  const safeData = searchParamsSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const positionsData = await fetchCommitteePositions({
    count: safeData.data.count,
    page: safeData.data.page,
    query: decodeURIComponent(safeData.data.query ?? ""),
  });

  return { ok: true, ...positionsData };
}

export async function createCommitteePositionAction(
  data: unknown,
): Promise<FormResponse<{ committeePosition: CommitteePosition }>> {
  const safeData = createCommitteePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return createCommitteePosition(safeData.data);
}

export async function deleteCommitteePositionAction(
  data: unknown,
): Promise<FormResponse<{ committee_position_id: number }>> {
  const safeData = deleteCommitteePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return deleteCommitteePosition(safeData.data);
}

export async function updateCommitteePositionAction(
  data: unknown,
): Promise<FormResponse<{ committeePosition: CommitteePosition }>> {
  const safeData = updateCommitteePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return updateCommitteePosition(safeData.data);
}
