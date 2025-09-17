"use server";

import { isMinioEnabled } from ".";
import { wrapServerAction } from "../actions";

export const isMinioEnabledAction = wrapServerAction(
  "changePreference",
  async function isMinioEnabledAction(): Promise<boolean> {
    return isMinioEnabled;
  },
);
