import { createPositionSchema } from "@/app/(authenticated)/(superuser)/admin/positions/schema";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
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
  data: unknown,
): Promise<FormResponse<{ position: Position }>> {
  "use server";

  const safeData = createPositionSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const createdPosition = await prisma.position.create({
    data: {
      name: safeData.data.name,
      full_description: safeData.data.full_description ?? "",
      brief_description: safeData.data.brief_description,
    },
  });
  revalidatePath("/admin/positions");
  return { ok: true, position: createdPosition };
}

export async function deletePosition(
  data: unknown,
): Promise<FormResponse<{ position_id: number }>> {
  "use server";
  const dataSchema = z.object({ position_id: z.number() });

  const safeData = dataSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const deletedPosition = await prisma.position.delete({
    where: {
      position_id: safeData.data.position_id,
    },
  });

  return {
    ok: true,
    position_id: deletedPosition.position_id,
  };
}

export async function updatePosition(
  data: unknown,
): Promise<FormResponse<{ position: Position }>> {
  "use server";
  const dataSchema = z.object({
    position_id: z.number(),
    name: z.string(),
    brief_description: z.string(),
    full_description: z.string(),
  });

  const safeData = dataSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const updatedPosition = await prisma.position.update({
    where: {
      position_id: safeData.data.position_id,
    },
    data: {
      name: safeData.data.name,
      brief_description: safeData.data.brief_description,
      full_description: safeData.data.full_description,
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
