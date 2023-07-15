import { Position, SignupSheet, User } from "@prisma/client";
import { Crew } from ".prisma/client";

export type SignupSheetObjectType = SignupSheet & {
  crews: (Crew & {
    positions: Position | null;
    users: User | null;
  })[];
};
