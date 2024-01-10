import {z} from "zod";

export const PermissionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});