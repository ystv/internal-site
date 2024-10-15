import { z } from "zod";

export function parseAsSlackError(error: unknown) {
  const parsed = z
    .object({
      code: z.string(),
      data: z.object({
        ok: z.boolean(),
        error: z.string(),
      }),
    })
    .safeParse(error);

  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}
