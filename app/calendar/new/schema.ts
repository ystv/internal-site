import { zfd } from "zod-form-data";
import { z } from "zod";

const EventTypes = ["show", "meeting", "social", "other"] as const;
export type EventType = (typeof EventTypes)[number];

export const schema = zfd.formData({
  name: z.string().nonempty(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  description: z.string().default(""),
  location: z.string().default(""),
  private: z.boolean().optional().default(false),
  tentative: z.boolean().optional().default(false),
  type: z.enum(EventTypes),
});
