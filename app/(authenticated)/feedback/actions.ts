"use server";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import * as Feedback from "@/features/userFeedback";
import { wrapServerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/server";

import { UserReportSchema } from "./schema";

export const doHandleUserReport = wrapServerAction(
  "doHandleUserReport",
  async function doHandleUserReport(dataRaw: unknown): Promise<FormResponse> {
    await getCurrentUser();
    const data = UserReportSchema.safeParse(dataRaw);
    if (!data.success) {
      return zodErrorResponse(data.error);
    }

    return await Feedback.submit(
      data.data.type,
      data.data.description,
      data.data.path,
    );
  },
);
