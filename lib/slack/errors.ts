import { isCodedError } from "@slack/bolt";
import { z } from "zod";

const errorModel = z.object({
  code: z.string(),
  data: z.object({
    ok: z.boolean(),
    error: z.string(),
    response_metadata: z
      .object({
        scopes: z.array(z.string()),
      })
      .optional(),
    acceptedScopes: z.array(z.string()).optional(),
  }),
});

/**
 * If passed a coded slack error, will parse and return it
 * @param e Possible slack error
 * @returns parsed slack error
 */
export function parseOrThrowSlackError(e: unknown) {
  if (!isCodedError(e)) throw e;

  const errorParsed = errorModel.safeParse(e);

  if (!errorParsed.success) {
    throw e;
  }

  return errorParsed.data;
}

/**
 * When passed a coded slack error and an error message to ignore, will parse the error and ignore or throw it depending on the message
 * @param e possible slack error
 * @param error_to_ignore the error message to ignore from slack
 * @returns parsed error that was ignored
 */
export function parseAndThrowOrIgnoreSlackError(
  e: unknown,
  error_to_ignore: string,
) {
  const errorParse = parseOrThrowSlackError(e);

  if (errorParse.data.error !== error_to_ignore) throw e;

  return errorParse;
}
