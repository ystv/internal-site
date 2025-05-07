"use client";

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
  redirect,
} from "next/navigation";
import { z } from "zod";
import { getSearchParamsString } from "./util";
import { validateSearchParams } from "./validate";

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
