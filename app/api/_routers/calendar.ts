import { z } from "zod";
import { proc, router } from "../_base";
import { _AttendeeModel, _EventModel, _UserModel } from "@/lib/types/schema";
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
    .input(z.object({ year: z.number(), month: z.number() }))
    .output(
      z.array(
        _EventModel.extend({
          attendees: z.array(_AttendeeModel.extend({ users: _UserModel })),
        }),
      ),
    )
    .query(async ({ input }) => {
      return await Calendar.listEventsForMonth(input.year, input.month);
    }),
});
