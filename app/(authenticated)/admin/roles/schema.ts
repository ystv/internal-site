import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const RolePermissionSchema = z.object({
  permission: z.string(),
  roleID: z.number(),
});

export const RoleUserSchema = z.object({
  userID: z.number(),
  roleID: z.number(),
});
