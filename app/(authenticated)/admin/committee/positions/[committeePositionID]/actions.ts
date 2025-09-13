import { type z } from "zod";

import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  fetchCommitteePositionForAdmin,
  fetchPastUsersForCommitteePosition,
  promoteUserToCommitteePosition,
  stepDownUserFromCommitteePosition,
} from "@/features/committee";

import {
  fetchCommitteePositionForAdminSchema,
  promoteUserToCommitteePositionSchema,
  stepDownUserFromCommitteePositionSchema,
} from "./schema";

export async function fetchCommitteePositionForAdminAction(
  data: z.infer<typeof fetchCommitteePositionForAdminSchema>,
) {
  const safeData = fetchCommitteePositionForAdminSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return fetchCommitteePositionForAdmin(safeData.data);
}

export async function promoteUserToCommitteePositionAction(
  data: z.infer<typeof promoteUserToCommitteePositionSchema>,
) {
  const safeData = promoteUserToCommitteePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return promoteUserToCommitteePosition(safeData.data);
}

export async function stepDownUserFromCommitteePositionAction(
  data: z.infer<typeof stepDownUserFromCommitteePositionSchema>,
) {
  const safeData = stepDownUserFromCommitteePositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return stepDownUserFromCommitteePosition(safeData.data);
}

export async function fetchPastUsersForCommitteePositionAction(
  data: z.infer<typeof fetchCommitteePositionForAdminSchema>,
) {
  const safeData = fetchCommitteePositionForAdminSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return fetchPastUsersForCommitteePosition(safeData.data);
}
