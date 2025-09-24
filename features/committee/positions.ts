"use server";

import {
  type CommitteePositionMember,
  type CommitteePosition,
} from "@prisma/client";
import { type z } from "zod";

import {
  stepDownUserFromCommitteePositionSchema,
  type promoteUserToCommitteePositionSchema,
} from "@/app/(authenticated)/admin/committee/positions/[committeePositionID]/schema";
import {
  type deleteCommitteePositionSchema,
  type updateCommitteePositionSchema,
  type createCommitteePositionSchema,
} from "@/app/(authenticated)/admin/committee/positions/schema";
import { type FormResponse } from "@/components/Form";
import { wrapServerAction } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export const fetchCommitteePositions = wrapServerAction(
  "fetchCommitteePositions",
  async function fetchCommitteePositions(data: {
    count: number;
    page: number;
    query?: string;
  }) {
    await requirePermission("Admin.Committee");

    const totalMatching = await prisma.committeePosition.count({
      where: {
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

    const committeePositions = await prisma.committeePosition.findMany({
      where: {
        name: {
          contains: data.query,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: {
            committee_position_members: {
              where: { current: true },
            },
          },
        },
      },
      skip: skipValue,
      take: data.count,
    });

    return {
      total: totalMatching,
      page: data.page,
      data: committeePositions,
    };
  },
);

export const createCommitteePosition = wrapServerAction(
  "createCommitteePosition",
  async function createCommitteePosition(
    data: z.infer<typeof createCommitteePositionSchema>,
  ): Promise<FormResponse<{ committeePosition: CommitteePosition }>> {
    await requirePermission("Admin.Committee");

    const createdCommitteePosition = await prisma.committeePosition.create({
      data: {
        name: data.name,
        description: data.description,
        email: data.email,
        seats: data.seats ?? 1,
      },
    });

    return {
      ok: true,
      committeePosition: createdCommitteePosition,
    };
  },
);

export const deleteCommitteePosition = wrapServerAction(
  "deleteCommitteePosition",
  async function deleteCommitteePosition(
    data: z.infer<typeof deleteCommitteePositionSchema>,
  ): Promise<FormResponse<{ committee_position_id: number }>> {
    await requirePermission("Admin.Committee");

    const deletedCommitteePosition = await prisma.committeePosition.delete({
      where: {
        committee_position_id: data.committee_position_id,
      },
    });

    return {
      ok: true,
      committee_position_id: deletedCommitteePosition.committee_position_id,
    };
  },
);

export const updateCommitteePosition = wrapServerAction(
  "updateCommitteePosition",
  async function updateCommitteePosition(
    data: z.infer<typeof updateCommitteePositionSchema>,
  ): Promise<FormResponse<{ committeePosition: CommitteePosition }>> {
    await requirePermission("Admin.Committee");

    const updatedCommitteePosition = await prisma.committeePosition.update({
      where: {
        committee_position_id: data.committee_position_id,
      },
      data: {
        name: data.name,
        description: data.description,
        email: data.email,
        seats: data.seats,
      },
    });

    return {
      ok: true,
      committeePosition: updatedCommitteePosition,
    };
  },
);

export interface TCommitteePositionForAdmin extends CommitteePosition {
  committee_position_members: ({
    user: {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
      nickname: string;
      avatar: string;
    };
  } & {
    user_id: number;
    start_date: Date;
    end_date: Date | null;
    committee_position_member_id: number;
    committee_position_id: number;
    current: boolean;
  })[];
}

export const fetchCommitteePositionForAdmin = wrapServerAction(
  "fetchCommitteePositionForAdmin",
  async function fetchCommitteePositionForAdmin(data: {
    committee_position_id: number;
  }): Promise<FormResponse<{ data: TCommitteePositionForAdmin }>> {
    await requirePermission("Admin.Committee");

    const committeePosition = await prisma.committeePosition.findFirstOrThrow({
      where: {
        committee_position_id: data.committee_position_id,
      },
      include: {
        committee_position_members: {
          where: { current: true },
          include: {
            user: {
              select: {
                user_id: true,
                first_name: true,
                nickname: true,
                last_name: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      ok: true,
      data: committeePosition,
    };
  },
);

export interface TPromoteUserToCommitteePosition
  extends CommitteePositionMember {
  user: {
    user_id: number;
    first_name: string;
    nickname: string;
    last_name: string;
    email: string;
  };
}

export const promoteUserToCommitteePosition = wrapServerAction(
  "promoteUserToCommitteePosition",
  async function promoteUserToCommitteePosition(
    data: z.infer<typeof promoteUserToCommitteePositionSchema>,
  ): Promise<FormResponse<{ member: TPromoteUserToCommitteePosition }>> {
    await requirePermission("Admin.Committee");

    const member = await prisma.committeePositionMember.create({
      data: {
        committee_position_id: data.committee_position_id,
        user_id: data.user_id,
        start_date: data.start_date,
        end_date: data.end_date,
        current: data.end_date ? false : true,
      },
      include: {
        user: {
          select: {
            user_id: true,
            first_name: true,
            nickname: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return {
      ok: true,
      member,
    };
  },
);

export const stepDownUserFromCommitteePosition = wrapServerAction(
  "stepDownUserFromCommitteePosition",
  async function stepDownUserFromCommitteePosition(
    data: z.infer<typeof stepDownUserFromCommitteePositionSchema>,
  ): Promise<FormResponse<{ data: CommitteePositionMember }>> {
    await requirePermission("Admin.Committee");

    const member = await prisma.committeePositionMember.update({
      where: {
        committee_position_member_id: data.committee_position_member_id,
      },
      data: {
        end_date: data.end_date,
        current: false,
      },
    });

    return {
      ok: true,
      data: member,
    };
  },
);

export const fetchPastUsersForCommitteePosition = wrapServerAction(
  "fetchPastUsersForCommitteePosition",
  async function fetchPastUsersForCommitteePosition(data: {
    committee_position_id: number;
  }): Promise<FormResponse<{ data: TPromoteUserToCommitteePosition[] }>> {
    await requirePermission("Admin.Committee");

    const members = await prisma.committeePositionMember.findMany({
      where: {
        committee_position_id: data.committee_position_id,
        current: false,
      },
      include: {
        user: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            nickname: true,
            email: true,
          },
        },
      },
      orderBy: {
        start_date: "desc",
      },
    });

    return {
      ok: true,
      data: members,
    };
  },
);
