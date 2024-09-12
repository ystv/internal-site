"use server";

import { zodErrorResponse } from "@/components/FormServerHelpers";
import { UserReportSchema } from "./schema";
import * as Feedback from "@/features/userFeedback";
import { getCurrentUser } from "@/lib/auth/server";
import { FormResponse } from "@/components/Form";
import { wrapServerAction } from "@/lib/actions";

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
