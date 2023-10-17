import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CrewPositionType {
  position_id: number;
  permission_id: number | null;
  name: string;
  admin: boolean;
  brief_description: string;
  full_description: string;
  is_custom: boolean;
}

export function getAllCrewPositions(
  includeCustom = true,
): Promise<CrewPositionType[]> {
  const filters: Prisma.PositionFindManyArgs = {
    orderBy: {
      position_id: "asc",
    },
  };
  if (!includeCustom) {
    filters.where = { is_custom: false };
  }
  return prisma.position.findMany(filters);
}
