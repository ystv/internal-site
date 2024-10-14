import { FormErrorResponse } from "@/components/forms";
import { ZodError } from "zod";

export function zodErrorResponse(err: ZodError): FormErrorResponse {
  return {
    ok: false,
    errors: err.issues.reduce(
      (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
      {},
    ),
  };
}
