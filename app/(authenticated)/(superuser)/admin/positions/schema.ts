import { router } from "@trpc/server";
import {
  ReadonlyURLSearchParams,
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ZodError, z } from "zod";

export const searchParamsSchema = z.object({
  count: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(10),
  page: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(1),
  query: z
    .preprocess((val) => decodeURIComponent(val as string), z.string())
    .optional(),
});

export const createPositionSchema = z.object({
  name: z.string(),
  brief_description: z.string().optional(),
  full_description: z.string().optional(),
});

export const updatePositionSchema = z.object({
  position_id: z.number(),
  name: z.string(),
  brief_description: z.string().optional(),
  full_description: z.string().optional(),
});

export const deletePositionSchema = z.object({
  position_id: z.number(),
});

/**
 * Returns the default values for objects in the given zod schema
 * @param schema A zod schema
 * @returns Object containing the default values for fields in the schema
 */
export function getDefaults<Schema extends z.AnyZodObject>(
  schema: Schema,
): z.infer<typeof schema> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault)
        return [key, value._def.defaultValue()];
      return [key, undefined];
    }),
  );
}

/**
 * A fun little function for validating URL search params against a zod schema,
 *    if running on the client will redirect to keep params in the same order as they
 *    appear in the schema
 * @param schema A zod schema to validate the searchParams against, must contain all
 *    optional or values with defaults
 * @param searchParams Search params either from client (URLSearchParams type) or
 *    server (Object)
 * @param data data.server must be set if running on the server, otherwise shit breaks
 * @returns Validated search params as an object
 */
export function useValidSearchParams<Schema extends z.AnyZodObject>(
  schema: Schema,
  searchParams: ReadonlyURLSearchParams | Object,
): z.infer<Schema> {
  "use client";
  const niceSearchParams = validateSearchParams(schema, searchParams);

  const pathname = usePathname();
  const validSearchParamsString = getSearchParamsString(niceSearchParams);
  if (validSearchParamsString !== useSearchParams().toString()) {
    redirect(`${pathname}?${validSearchParamsString}`);
  }

  return niceSearchParams;
}

export function validateSearchParams<Schema extends z.AnyZodObject>(
  schema: Schema,
  searchParams: Object | ReadonlyURLSearchParams,
): z.infer<Schema> {
  let searchParamsObject: Object;
  if (searchParams instanceof ReadonlyURLSearchParams) {
    searchParamsObject = Object.fromEntries(searchParams.entries());
  } else {
    searchParamsObject = searchParams;
  }

  const parsedSchema = schema.safeParse(searchParamsObject);

  if (parsedSchema.success) {
    return parsedSchema.data;
  } else {
    const data = schema.safeParse(
      Object.fromEntries(
        Object.entries(schema.shape)
          .map(([key, value]) => {
            if (searchParamsObject.hasOwnProperty(key)) {
              const searchParamValue = getValue(
                searchParamsObject,
                key as keyof Object,
              );
              if (value instanceof z.ZodDefault) {
                if (value.safeParse(searchParamValue).success) {
                  return [key, searchParamValue];
                }
                return [key, value._def.defaultValue()];
              } else if (value instanceof z.ZodOptional) {
                if (value.safeParse(searchParamValue).success) {
                  return [key, searchParamValue];
                }
              } else {
                throw new TypeError(
                  "Invalid Schema, all validators must be either optional or contain default values",
                );
              }
            }
          })
          .filter((value) => value !== undefined) as any[],
      ) as z.infer<Schema>,
    );

    if (!data.success) {
      throw new TypeError(
        "Invalid Schema, all validators must be either optional or contain default values",
      );
    }

    return data.data;
  }
}

/**
 * Redirects the client to keep searchParams kept nice across reloads
 * @param searchParams An object containing searchParams and their values
 */
export function useRevalidateClientSearchParams(searchParams: Object) {
  "use client";
  const pathname = usePathname();
  const validSearchParamsString = getSearchParamsString(searchParams);
  if (validSearchParamsString !== useSearchParams().toString()) {
    redirect(`${pathname}?${validSearchParamsString}`);
  }
}

export function useUpdateClientSearchParams(searchParams: Object) {
  "use client";
  const router = useRouter();
  const pathname = usePathname();
  const validSearchParamsString = getSearchParamsString(searchParams);
  if (validSearchParamsString !== useSearchParams().toString()) {
    router.push(`${pathname}?${validSearchParamsString}`);
  }
}

export function getSearchParamsString(paramsObject: Object) {
  return Object.entries(paramsObject)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function getValue<T, K extends keyof T>(data: T, key: K) {
  return data[key];
}
