import { type ZodError } from "zod";

import { type FormErrorResponse } from "@/components/Form";

export function zodErrorResponse(err: ZodError): FormErrorResponse {
  return {
    ok: false,
    errors: err.issues.reduce(
      (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
      {},
    ),
  };
}
