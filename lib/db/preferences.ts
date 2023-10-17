import { z } from "zod";

export const UserPreferencesSchema: z.ZodSchema<PrismaJson.UserPreferences> =
  z.object({
    timeFormat: z.enum(["12hr", "24hr"]).optional(),
    icalFilter: z.enum(["only-mine", "all"]).optional(),
  });

export function preferenceDefaults(
  data: PrismaJson.UserPreferences,
): Required<PrismaJson.UserPreferences> {
  return {
    timeFormat: data.timeFormat ?? "12hr",
    icalFilter: data.icalFilter ?? "only-mine",
  };
}
