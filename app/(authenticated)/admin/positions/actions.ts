"use server";

import { zodErrorResponse, type FormResponse } from "@/components/forms";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
} from "@/features/positions";
import type { Position } from "@prisma/client";
import {
  createPositionSchema,
  deletePositionSchema,
  searchParamsSchema,
  updatePositionSchema,
} from "./schema";

export type TFetchPositions = {
  positions: Position[];
  page: number;
  total: number;
};

export async function fetchPositionsAction(data: unknown) {
  const safeData = searchParamsSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const positionsData = await fetchPositions({
    count: safeData.data.count,
    page: safeData.data.page,
    query: decodeURIComponent(safeData.data.query ?? ""),
  });

  return { ok: true, ...positionsData };
}

export async function createPositionAction(
  data: unknown,
): Promise<FormResponse<{ position: Position }>> {
  const safeData = createPositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return createPosition(safeData.data);
}

export async function deletePositionAction(
  data: unknown,
): Promise<FormResponse<{ position_id: number }>> {
  const safeData = deletePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return deletePosition(safeData.data);
}

export async function updatePositionAction(
  data: unknown,
): Promise<FormResponse<{ position: Position }>> {
  const safeData = updatePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return updatePosition(safeData.data);
}
