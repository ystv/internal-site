"use server";

import * as Permission from "@/features/permission";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {PermissionSchema} from "@/app/(authenticated)/admin/permissions/schema";

export async function addPermission(
    form: z.infer<typeof PermissionSchema>,
): Promise<FormResponse> {
    const payload = PermissionSchema.safeParse(form);
    if (!payload.success) {
        return zodErrorResponse(payload.error);
    }

    await Permission.addPermission(payload.data);
    revalidatePath(`/admin/permissions`);
    return { ok: true } as const;
}
