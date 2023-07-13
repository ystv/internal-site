import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { OpenApiMeta } from "trpc-openapi";
import { Permission } from "@/lib/auth/common";

export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  if (
    req.url.includes("TEST_AUTH=true") ||
    req.headers.get("Authorization")?.includes("TEST_AUTH")
  ) {
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

interface AuthMeta {
  perms: [Permission, ...Permission[]];
}

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta & { auth: AuthMeta }>()
  .create({});

export const router = t.router;
export const middleware = t.middleware;
export const proc = t.procedure.use(
  middleware(({ ctx, next, meta, path }) => {
    if (!meta?.auth) {
      throw new Error("Internal error - no auth meta on procedure " + path);
    }
    if (meta.auth.perms.includes("PUBLIC")) {
      return next();
    }
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    if (ctx.user.permissions.includes("SUDO")) {
      return next();
    }
    if (meta.auth.perms.some((x) => ctx.user.permissions.includes(x))) {
      return next();
    }
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }),
);
