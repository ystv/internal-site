import { z } from "zod";
import { proc, router } from "../_base";

export default router({
  echo: proc
    .meta({
      openapi: { method: "GET", path: "/echo", protect: false },
      auth: { perms: ["PUBLIC"] },
    })
    .input(z.object({ value: z.string() }))
    .output(z.string())
    .query(async ({ input }) => {
      return input.value;
    }),
});
