import {
  createPositionSchema,
  deletePositionSchema,
  updatePositionSchema,
} from "@/app/(authenticated)/(superuser)/admin/positions/schema";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { Position } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function fetchPositions(data: {
  count: number;
  page: number;
  query?: string;
}) {
  "use server";

  await requirePermission("Admin.Positions");

  const totalMatching = await prisma.position.count({
    where: {
      is_custom: false,
      name: {
        contains: data.query,
        mode: "insensitive",
      },
    },
  });

  const availablePages = Math.ceil(totalMatching / data.count);

  if (data.page > availablePages) {
    data.page = availablePages;
  }

  if (data.page == 0) {
    data.page = 1;
  }

  const skipValue = data.count * (data.page - 1);

  return {
    positions: await prisma.position.findMany({
      where: {
        is_custom: false,
        name: {
          contains: data.query,
          mode: "insensitive",
        },
      },
      take: data.count,
      skip: skipValue >= 0 ? skipValue : 0,
      orderBy: {
        position_id: "desc",
      },
    }),
    page: data.page,
    total: totalMatching,
  };
}

export async function createPosition(
  data: z.infer<typeof createPositionSchema>,
): Promise<FormResponse<{ position: Position }>> {
  "use server";

  await requirePermission("Admin.Positions");
  const createdPosition = await prisma.position.create({
    data: {
      name: data.name,
      full_description: data.full_description ?? "",
      brief_description: data.brief_description,
    },
  });
  revalidatePath("/admin/positions");
  return { ok: true, position: createdPosition };
}

export async function deletePosition(
  data: z.infer<typeof deletePositionSchema>,
): Promise<FormResponse<{ position_id: number }>> {
  "use server";

  await requirePermission("Admin.Positions");

  const deletedPosition = await prisma.position.delete({
    where: {
      position_id: data.position_id,
    },
  });

  return {
    ok: true,
    position_id: deletedPosition.position_id,
  };
}

export async function updatePosition(
  data: z.infer<typeof updatePositionSchema>,
): Promise<FormResponse<{ position: Position }>> {
  "use server";

  await requirePermission("Admin.Positions");

  const updatedPosition = await prisma.position.update({
    where: {
      position_id: data.position_id,
    },
    data: {
      name: data.name,
      brief_description: data.brief_description,
      full_description: data.full_description,
    },
  });

  return {
    ok: true,
    position: updatedPosition,
  };
}

export async function searchPositions(
  data: unknown,
): Promise<FormResponse<{ positions: Position[] }>> {
  "use server";

  await requirePermission("Admin.Positions");

  const dataSchema = z.object({
    query: z.string().optional(),
    // count: z.number(),
    // page: z.number(),
  });

  const safeData = dataSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const searchResults = await prisma.position.findMany({
    where: {
      name: {
        contains: safeData.data.query,
      },
    },
    take: 10,
  });

  return { ok: true, positions: searchResults };
}

export const numPositions = prisma.position.count({
  where: { is_custom: false },
});
