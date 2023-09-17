import SignupSheetUpdateInput = Prisma.SignupSheetUpdateInput;
import { prisma } from "@/lib/db";
import { Event, Prisma } from "@prisma/client";
import { CrewPositionType } from "@/features/calendar/crew_positions";
import { omit } from "lodash";
import { ExposedUser } from "@/features/people";

export interface CrewType {
  crew_id: number;
  position_id: number;
  positions: CrewPositionType;
  ordering: number;
  locked: boolean;
  user_id: number | null;
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
            position_id: c.position_id,
            ordering: c.ordering,
            locked: c.locked,
            user_id: c.user_id,
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
  position_id: number;
  user_id: number | null;
}

export async function updateSignUpSheet(
  sheetID: number,
  data: Omit<SignupSheetUpdateInput, "crews" | "events"> & {
    crews: CrewCreateUpdateInput[];
  },
) {
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
            position_id: c.position_id,
            user_id: c.user_id,
            locked: c.locked,
            ordering: c.ordering,
          },
        }),
      ),
  ]);
}

export async function deleteSignUpSheet(sheetID: number) {
  await prisma.signupSheet.delete({
    where: {
      signup_id: sheetID,
    },
  });
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
