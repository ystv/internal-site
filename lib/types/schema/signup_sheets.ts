import * as z from "zod";
import {
  Completecrews,
  crewsModel,
  Completeevents,
  eventsModel,
} from "./index";

export const _signup_sheetsModel = z.object({
  signup_id: z.number().int(),
  event_id: z.number().int().nullish(),
  title: z.string(),
  description: z.string(),
  unlock_date: z.date().nullish(),
  arrival_time: z.date().nullish(),
  start_time: z.date().nullish(),
  end_time: z.date().nullish(),
});

export interface Completesignup_sheets
  extends z.infer<typeof _signup_sheetsModel> {
  crews: Completecrews[];
  events?: Completeevents | null;
}

/**
 * signup_sheetsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const signup_sheetsModel: z.ZodSchema<Completesignup_sheets> = z.lazy(
  () =>
    _signup_sheetsModel.extend({
      crews: crewsModel.array(),
      events: eventsModel.nullish(),
    }),
);
