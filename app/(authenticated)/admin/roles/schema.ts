import { z } from "zod";

import { PermissionEnum } from "@/lib/auth/permissions";

export const searchParamsSchema = z.object({
  count: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(10),
  page: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(1),
  query: z.string().optional(),
});

export const createRoleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  permissions: z.array(PermissionEnum),
});

export const updateRoleSchema = z.object({
  role_id: z.number(),
  name: z.string().min(3),
  description: z.string().optional(),
  permissions: z.array(PermissionEnum),
});

export const deleteRoleSchema = z.object({
  role_id: z.number(),
});
