import {
  ReadonlyURLSearchParams,
  redirect,
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

function getValue<T, K extends keyof T>(data: T, key: K) {
  return data[key];
}
