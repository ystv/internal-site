import { z } from "zod";
import { proc, router } from "../_base";
import { _AttendeeModel, _EventModel } from "@/lib/db/types";
import * as Calendar from "@/features/calendar";
import { TRPCError } from "@trpc/server";
import { schema as createEventSchema } from "@/app/calendar/new/schema";
import { canManage } from "@/features/calendar/permissions";
import { getCurrentUser } from "@/lib/auth/legacy";

const ExposedEventModel = _EventModel.extend({
  attendees: z.array(
    _AttendeeModel.extend({
      users: z.object({
        user_id: z.number(),
        first_name: z.string(),
        last_name: z.string(),
        nickname: z.string().optional(),
      }),
    }),
  ),
});

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
    .output(z.array(ExposedEventModel))
    .query(async ({ input }) => {
      // NB: JS dates (and therefore listEventsForMonth) works with 0-indexed months
      return await Calendar.listEventsForMonth(input.year, input.month - 1);
    }),
  event: router({
    get: proc
      .meta({
        openapi: {
          path: "/calendar/event/[id]",
          method: "GET",
          tags: ["calendar"],
          protect: true,
        },
        auth: { perms: ["MEMBER"] },
      })
      .input(z.object({ id: z.number() }))
      .output(ExposedEventModel)
      .query(async ({ input }) => {
        const evt = await Calendar.getEvent(input.id);
        if (!evt) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }
        return evt;
      }),
    create: proc
      .meta({
        openapi: {
          path: "/calendar/event",
          method: "POST",
          tags: ["calendar"],
          protect: true,
        },
        auth: { perms: ["MEMBER"] }, // More specific auth is handled below
      })
      .input(createEventSchema.innerType())
      .output(ExposedEventModel)
      .mutation(async ({ input, ctx }) => {
        if (!canManage(input.type, ctx.user!.permissions)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to create this type of event",
          });
        }
        return await Calendar.createEvent({
          name: input.name,
          description: input.description,
          event_type: input.type,
          start_date: input.startDate,
          end_date: input.endDate,
          location: input.location,
          created_by: ctx.user!.id,
          is_private: input.private,
          is_cancelled: false,
          is_tentative: input.tentative,
        });
      }),
  }),
});
