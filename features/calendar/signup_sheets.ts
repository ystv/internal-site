import SignupSheetUpdateInput = Prisma.SignupSheetUpdateInput;
import { prisma } from "@/lib/db";
import { Event, Prisma, SignupSheet } from "@prisma/client";
import { CrewPositionType } from "@/features/calendar/crew_positions";
import { omit } from "lodash";
import { ExposedUser } from "@/features/people";
import invariant from "@/lib/invariant";
import { UserType } from "@/lib/auth/server";

export interface CrewType {
  crew_id: number;
  position_id: number;
  signup_id: number;
  positions: CrewPositionType;
  ordering: number;
  locked: boolean;
  user_id: number | null;
  custom_crew_member_name: string | null;
  users: ExposedUser | null;
}

export interface SignUpSheetType {
  signup_id: number;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  arrival_time: Date;
  unlock_date: Date | null;
  crews: CrewType[];
}

export interface SignUpSheetWithEvent extends SignUpSheetType {
  events: Event;
}

export async function createSignupSheet(
  eventID: number,
  sheet: Omit<Prisma.SignupSheetCreateInput, "crews" | "events"> & {
    crews: CrewCreateUpdateInput[];
  },
) {
  await ensurePositionsForCrews(sheet.crews);
  const newSheet = await prisma.signupSheet.create({
    data: {
      event_id: eventID,
      title: sheet.title,
      description: sheet.description,
      start_time: sheet.start_time,
      end_time: sheet.end_time,
      arrival_time: sheet.arrival_time,
      unlock_date: sheet.unlock_date,
      crews: {
        createMany: {
          data: sheet.crews.map((c) => ({
            position_id: c.position_id!,
            ordering: c.ordering,
            locked: c.locked,
            user_id: c.user_id,
            custom_crew_member_name: c.custom_crew_member_name,
          })),
        },
      },
    },
  });
  return newSheet.signup_id;
}

export async function getSignUpSheet(
  sheetID: number,
): Promise<SignUpSheetWithEvent | null> {
  return prisma.signupSheet.findFirst({
    where: {
      signup_id: sheetID,
    },
    include: {
      crews: {
        include: {
          users: true,
          positions: true,
        },
      },
      events: true,
    },
  });
}

interface CrewCreateUpdateInput {
  crew_id?: number;
  locked: boolean;
  ordering: number;
  position_id?: number;
  custom_position_name?: string;
  user_id: number | null;
  custom_crew_member_name: string | null;
}

/**
 * If any of the given crews has a custom position, create a position in the database and replace
 * it with the position ID.
 */
async function ensurePositionsForCrews(crews: CrewCreateUpdateInput[]) {
  // Ensure we only create one new position even if it's given multiple times
  const newPosNames = new Set(
    crews
      .filter((x) => x.custom_position_name)
      .map((x) => x.custom_position_name!),
  );
  const newPositions = await prisma.$transaction(
    Array.from(newPosNames).map((name) =>
      prisma.position.upsert({
        where: {
          name,
        },
        create: {
          name,
          full_description: "",
          is_custom: true,
        },
        update: {},
        select: {
          name: true,
          position_id: true,
        },
      }),
    ),
  );

  for (let i = 0; i < crews.length; i++) {
    if (crews[i].custom_position_name) {
      const newPos = newPositions.find(
        (x) => x.name === crews[i].custom_position_name,
      );
      invariant(
        newPos,
        "couldn't find newly created position " + crews[i].custom_position_name,
      );
      crews[i].position_id = newPos.position_id;
      delete crews[i].custom_position_name;
    }
  }
}

async function deleteOrphanedCustomPositions() {
  await prisma.position.deleteMany({
    where: {
      is_custom: true,
      crews: {
        none: {},
      },
    },
  });
}

export async function updateSignUpSheet(
  sheetID: number,
  data: Omit<SignupSheetUpdateInput, "crews" | "events"> & {
    crews: CrewCreateUpdateInput[];
  },
) {
  await ensurePositionsForCrews(data.crews);
  await prisma.$transaction([
    prisma.signupSheet.update({
      where: {
        signup_id: sheetID,
      },
      data: omit(data, ["crews"]),
    }),
    prisma.crew.deleteMany({
      where: {
        signup_id: sheetID,
        crew_id: {
          notIn: data.crews.map((c) => c.crew_id).filter(Boolean) as number[],
        },
      },
    }),
    ...data.crews
      .filter((c) => c.crew_id)
      .map((c) =>
        prisma.crew.update({
          where: {
            signup_id: sheetID,
            crew_id: c.crew_id,
          },
          data: {
            position_id: c.position_id,
            user_id: c.user_id,
            custom_crew_member_name: c.custom_crew_member_name,
            locked: c.locked,
            ordering: c.ordering,
          },
        }),
      ),
    ...data.crews
      .filter((c) => !c.crew_id)
      .map((c) =>
        prisma.crew.create({
          data: {
            signup_id: sheetID,
            position_id: c.position_id!,
            user_id: c.user_id,
            custom_crew_member_name: c.custom_crew_member_name,
            locked: c.locked,
            ordering: c.ordering,
          },
        }),
      ),
  ]);
  await deleteOrphanedCustomPositions();
}

export async function deleteSignUpSheet(sheetID: number) {
  await prisma.signupSheet.delete({
    where: {
      signup_id: sheetID,
    },
  });
  await deleteOrphanedCustomPositions();
}

export async function signUpToRole(
  sheetID: number,
  crewID: number,
  user_id: number,
) {
  try {
    await prisma.crew.update({
      where: {
        signup_id: sheetID,
        crew_id: crewID,
        // Ensure we don't clobber existing signups
        user_id: null,
      },
      data: {
        user_id,
      },
    });
    return { ok: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return {
        ok: false,
        reason:
          "Either the role doesn't exist or someone else is already signed up",
      };
    }
    throw e;
  }
}

export async function removeUserFromRole(
  sheetID: number,
  crewID: number,
  user_id: number,
) {
  try {
    await prisma.crew.update({
      where: {
        signup_id: sheetID,
        crew_id: crewID,
        user_id,
      },
      data: {
        user_id: null,
      },
    });
    return { ok: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return {
        ok: false,
        reason: "Either the role doesn't exist or someone else is signed up",
      };
    }
    throw e;
  }
}

export async function getCrewRole(crewID: number) {
  return prisma.crew.findFirst({
    where: {
      crew_id: crewID,
    },
    include: {
      signup_sheets: {
        include: {
          events: true,
        },
      },
    },
  });
}

export async function getClashingSheets(
  user: UserType,
  sheetOrID: SignupSheet | number,
) {
  let sheet;
  if (typeof sheetOrID === "number") {
    sheet = await getSignUpSheet(sheetOrID);
  } else {
    sheet = sheetOrID;
  }
  invariant(sheet, `Sheet ${sheetOrID} not found`);
  const clashingSheets = await prisma.signupSheet.findMany({
    where: {
      AND: [
        {
          crews: {
            some: {
              user_id: user.user_id,
            },
          },
        },
        {
          OR: [
            {
              arrival_time: {
                gte: sheet.arrival_time,
                lte: sheet.end_time,
              },
            },
            {
              end_time: {
                gte: sheet.arrival_time,
                lte: sheet.end_time,
              },
            },
            {
              AND: [
                {
                  arrival_time: {
                    lte: sheet.arrival_time,
                  },
                },
                {
                  end_time: {
                    gte: sheet.end_time,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    include: {
      events: true,
      crews: {
        include: {
          positions: true,
          users: true,
        },
        where: {
          user_id: user.user_id,
        },
      },
    },
  });

  return clashingSheets;
}
