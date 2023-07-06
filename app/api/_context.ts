import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Permission } from "./_router";
export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  if (req.url.includes("TEST_AUTH=true")) {
    return {
      user: {
        id: 1,
        name: "TEST",
        permissions: ["SUDO"] satisfies Permission[] as Permission[],
      },
    };
  }
  return {
    user: null,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
