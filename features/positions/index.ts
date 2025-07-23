"use server";

import {
  createPositionSchema,
  deletePositionSchema,
  updatePositionSchema,
} from "@/app/(authenticated)/admin/positions/schema";
import { FormResponse } from "@/components/Form";
import { wrapServerAction } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { Position } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const fetchPositions = wrapServerAction(
  "fetchPositions",
  async function fetchPositions(data: {
    count: number;
    page: number;
    query?: string;
  }) {
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
  },
);

export const createPosition = wrapServerAction(
  "createPosition",
  async function createPosition(
    data: z.infer<typeof createPositionSchema>,
  ): Promise<FormResponse<{ position: Position }>> {
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
  },
);

export const deletePosition = wrapServerAction(
  "deletePosition",
  async function deletePosition(
    data: z.infer<typeof deletePositionSchema>,
  ): Promise<FormResponse<{ position_id: number }>> {
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
  },
);

export const updatePosition = wrapServerAction(
  "updatePosition",
  async function updatePosition(
    data: z.infer<typeof updatePositionSchema>,
  ): Promise<FormResponse<{ position: Position }>> {
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
  },
);
