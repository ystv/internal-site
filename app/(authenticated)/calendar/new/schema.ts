import { isBefore } from "date-fns";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { EventTypes } from "@/features/calendar/types";

export const schema = zfd
  .formData({
    name: z.string().nonempty(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    description: z.string().default(""),
    location: z.string().default(""),
    private: z.boolean().optional().default(false),
    tentative: z.boolean().optional().default(false),
    type: z.enum(EventTypes),
    host: z.coerce.number().optional(),
    slack_channel_id: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .default(null),
    slack_channel_new_name: z
      .string()
      .regex(
        /^[a-zA-Z0-9-]{1,80}$/,
        "Channel names can’t contain spaces or punctuation. Use dashes to separate words.",
      )
      .optional()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .default(null),
    is_recurring: z.boolean(),
    recurring_dates: z.array(z.coerce.date()),
  })
  .refine((val) => isBefore(val.startDate, val.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
