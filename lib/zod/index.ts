import { z } from "zod";

/**
 * Returns the default values for objects in the given zod schema
 * @param schema A zod schema
 * @returns Object containing the default values for fields in the schema
 */
export function getDefaults<Schema extends z.ZodObject>(
  schema: Schema,
): z.infer<typeof schema> {
  return schema.parse(
    Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        if (value instanceof z.ZodDefault) return [key, value.def.defaultValue];
        return [key, undefined];
      }),
    ),
  );
}
