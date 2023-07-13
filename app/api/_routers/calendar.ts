import { z } from "zod";
import { proc, router } from "../_base";
import { _AttendeeModel, _EventModel } from "@/lib/types/schema";
import * as Calendar from "@/features/calendar";

export default router({
  getForYearMonth: proc
    .meta({
      openapi: {
        path: "/calendar/monthly/{year}/{month}",
        method: "GET",
        tags: ["calendar"],
        protect: true,
      },
      auth: { perms: ["MEMBER"] },
    })
    .input(z.object({ year: z.number(), month: z.number().gte(1).lte(12) }))
    .output(
      z.array(
        _EventModel.extend({
          attendees: z.array(
            _AttendeeModel.extend({
              users: z.object({
                user_id: z.number(),
                first_name: z.string(),
                last_name: z.string(),
              }),
            }),
          ),
        }),
      ),
    )
    .query(async ({ input }) => {
      // NB: JS dates (and therefore listEventsForMonth) works with 0-indexed months
      return await Calendar.listEventsForMonth(input.year, input.month - 1);
    }),
});
