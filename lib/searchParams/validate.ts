import {
  ReadonlyURLSearchParams,
  redirect,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { z } from "zod";
import { getSearchParamsString } from "./util";

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
  const validSearchParams = validateSearchParams(schema, searchParams);

  const pathname = usePathname();
  const oldSearchParams = Object.fromEntries(useSearchParams().entries());
  const oldSearchParamsString = getSearchParamsString(oldSearchParams);
  const newSearchParamsString = getSearchParamsString(validSearchParams);

  if (newSearchParamsString !== oldSearchParamsString) {
    redirect(`${pathname}?${newSearchParamsString}`);
  }

  return validSearchParams;
}

function getValue<T, K extends keyof T>(data: T, key: K) {
  return data[key];
}
