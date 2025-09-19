"use server";

import {
  type CommitteePosition,
  type CommitteePositionTeam,
  type CommitteeTeam,
} from "@prisma/client";
import { type z } from "zod";

import { type reorderPositionInTeamSchema } from "@/app/(authenticated)/admin/committee/teams/[committeeTeamID]/schema";
import {
  type deleteCommitteeTeamSchema,
  type updateCommitteeTeamSchema,
  type createCommitteeTeamSchema,
} from "@/app/(authenticated)/admin/committee/teams/schema";
import { type FormResponse } from "@/components/Form";
import { wrapServerAction } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export const fetchCommitteeTeams = wrapServerAction(
  "fetchCommitteeTeams",
  async function fetchCommitteeTeams(data: {
    count: number;
    page: number;
    query?: string;
  }) {
    await requirePermission("Admin.Committee");

    const totalMatching = await prisma.committeeTeam.count({
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

    const committeeTeams = await prisma.committeeTeam.findMany({
      where: {
        name: {
          contains: data.query,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: {
            position_teams: true,
          },
        },
      },
      orderBy: [{ public: "desc" }, { sort_order: "asc" }],
      skip: skipValue,
      take: data.count,
    });

    return {
      total: totalMatching,
      page: data.page,
      data: committeeTeams,
    };
  },
);

export const fetchPublicCommittee = wrapServerAction(
  "fetchPublicCommittee",
  async function fetchPublicCommittee() {
    const fetchedCommitteeTeams = await prisma.committeeTeam.findMany({
      where: {
        public: true,
      },
      select: {
        name: true,
        description: true,
        sort_order: true,
        position_teams: {
          select: {
            ordering: true,
            committee_position: {
              select: {
                name: true,
                description: true,
                committee_position_members: {
                  where: {
                    current: true,
                  },
                  select: {
                    user: {
                      select: {
                        first_name: true,
                        last_name: true,
                        public_avatar: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            ordering: "asc",
          },
        },
      },
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    });

    return { ok: true, data: fetchedCommitteeTeams };
  },
);

export const createCommitteeTeam = wrapServerAction(
  "createCommitteeTeam",
  async function createCommitteeTeam(
    data: z.infer<typeof createCommitteeTeamSchema>,
  ): Promise<FormResponse<{ committeeTeam: CommitteeTeam }>> {
    await requirePermission("Admin.Committee");

    const createdCommitteeTeam = await prisma.committeeTeam.create({
      data: {
        name: data.name,
        description: data.description,
        public: data.public,
        sort_order: data.sort_order,
      },
    });

    return {
      ok: true,
      committeeTeam: createdCommitteeTeam,
    };
  },
);

export const deleteCommitteeTeam = wrapServerAction(
  "deleteCommitteeTeam",
  async function deleteCommitteeTeam(
    data: z.infer<typeof deleteCommitteeTeamSchema>,
  ): Promise<FormResponse<{ committee_team_id: number }>> {
    await requirePermission("Admin.Committee");

    const deletedCommitteeTeam = await prisma.committeeTeam.delete({
      where: {
        committee_team_id: data.committee_team_id,
      },
    });

    return {
      ok: true,
      committee_team_id: deletedCommitteeTeam.committee_team_id,
    };
  },
);

export const updateCommitteeTeam = wrapServerAction(
  "updateCommitteeTeam",
  async function updateCommitteeTeam(
    data: z.infer<typeof updateCommitteeTeamSchema>,
  ): Promise<FormResponse<{ committeeTeam: CommitteeTeam }>> {
    await requirePermission("Admin.Committee");

    const updatedCommitteeTeam = await prisma.committeeTeam.update({
      where: {
        committee_team_id: data.committee_team_id,
      },
      data: {
        name: data.name,
        description: data.description,
        public: data.public,
        sort_order: data.sort_order,
      },
    });

    return {
      ok: true,
      committeeTeam: updatedCommitteeTeam,
    };
  },
);

export interface TCommitteeTeamForAdmin extends CommitteeTeam {
  position_teams: ({
    committee_position: {
      _count: {
        committee_position_members: number;
      };
    } & CommitteePosition;
  } & CommitteePositionTeam)[];
}

export const fetchCommitteeTeamForAdmin = wrapServerAction(
  "fetchCommitteeTeamForAdmin",
  async function fetchCommitteeTeamForAdmin(data: {
    committee_team_id: number;
  }): Promise<FormResponse<{ data: TCommitteeTeamForAdmin }>> {
    await requirePermission("Admin.Committee");

    const committeeTeam = await prisma.committeeTeam.findFirstOrThrow({
      where: {
        committee_team_id: data.committee_team_id,
      },
      include: {
        position_teams: {
          include: {
            committee_position: {
              include: {
                _count: {
                  select: {
                    committee_position_members: {
                      where: {
                        current: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            ordering: "asc",
          },
        },
      },
    });

    return { ok: true, data: committeeTeam };
  },
);

export const fetchPositionsNotInTeam = wrapServerAction(
  "fetchPositionsNotInTeam",
  async function fetchPositionsNotInTeam(data: {
    committee_team_id: number;
  }): Promise<FormResponse<{ data: CommitteePosition[] }>> {
    await requirePermission("Admin.Committee");

    const positions = await prisma.committeePosition.findMany({
      where: {
        position_teams: {
          none: {
            committee_team_id: data.committee_team_id,
          },
        },
      },
    });

    return { ok: true, data: positions };
  },
);

export const addPositionToTeam = wrapServerAction(
  "addPositionToTeam",
  async function addPositionToTeam(data: {
    committee_team_id: number;
    committee_position_id: number;
  }): Promise<FormResponse> {
    await requirePermission("Admin.Committee");

    const currentOrder = await prisma.committeePositionTeam.count({
      where: {
        committee_team_id: data.committee_team_id,
      },
    });

    await prisma.committeePositionTeam.create({
      data: {
        committee_team_id: data.committee_team_id,
        committee_position_id: data.committee_position_id,
        ordering: currentOrder,
      },
    });

    return { ok: true };
  },
);

export const removePositionFromTeam = wrapServerAction(
  "removePositionFromTeam",
  async function removePositionFromTeam(data: {
    committee_team_id: number;
    committee_position_id: number;
  }): Promise<FormResponse> {
    await requirePermission("Admin.Committee");

    const deleted = await prisma.committeePositionTeam.delete({
      where: {
        committee_position_id_committee_team_id: {
          committee_position_id: data.committee_position_id,
          committee_team_id: data.committee_team_id,
        },
      },
    });

    await prisma.committeePositionTeam.updateMany({
      where: {
        committee_team_id: data.committee_team_id,
        ordering: {
          gt: deleted.ordering,
        },
      },
      data: {
        ordering: {
          decrement: 1,
        },
      },
    });

    return { ok: true };
  },
);

export const reorderPositionInTeam = wrapServerAction(
  "reorderPositionInTeam",
  async function reorderPositionInTeam(
    data: z.infer<typeof reorderPositionInTeamSchema>,
  ): Promise<FormResponse> {
    await requirePermission("Admin.Committee");

    const positionTeam = await prisma.committeePositionTeam.findFirstOrThrow({
      where: {
        committee_team_id: data.committee_team_id,
        committee_position_id: data.committee_position_id,
      },
    });

    await prisma.committeePositionTeam.updateMany({
      where: {
        committee_team_id: data.committee_team_id,
        ordering:
          data.direction === "up"
            ? positionTeam.ordering - 1
            : positionTeam.ordering + 1,
      },
      data: {
        ordering:
          data.direction === "up"
            ? {
                increment: 1,
              }
            : {
                decrement: 1,
              },
      },
    });

    await prisma.committeePositionTeam.update({
      where: {
        committee_position_id_committee_team_id: {
          committee_position_id: data.committee_position_id,
          committee_team_id: data.committee_team_id,
        },
      },
      data: {
        ordering:
          data.direction === "up"
            ? positionTeam.ordering - 1
            : positionTeam.ordering + 1,
      },
    });

    return { ok: true };
  },
);
