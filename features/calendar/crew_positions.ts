import { prisma } from "@/lib/db";

export interface CrewPositionType {
  position_id: number;
  permission_id: number | null;
  name: string;
  admin: boolean;
  brief_description: string;
  full_description: string;
}

export function getAllCrewPositions(): Promise<CrewPositionType[]> {
  return prisma.position.findMany({
    orderBy: {
      position_id: "asc",
    },
  });
}