import { _VideoItemModel } from "@/lib/types/schema";
import { findVideoByID } from "@/features/videos";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { proc, router } from "../_base";

export default router({
  get: proc
    .meta({
      openapi: { method: "GET", path: "/videos/{id}", protect: true },
      auth: { perms: ["Watch.Admin"] },
    })
    .input(z.object({ id: z.number() }))
    .output(_VideoItemModel)
    .query(async ({ input }) => {
      const v = await findVideoByID(input.id);
      if (!v) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return v;
    }),
});
