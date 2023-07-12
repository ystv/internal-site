import { TRPCError, initTRPC } from "@trpc/server";
import {
  OpenApiMeta,
  generateOpenApiDocument,
} from "trpc-openapi";
import { Context } from "./_context";
import z from "zod";
import { findVideoByID } from "@/lib/videos";
import { _VideoItemModel } from "@/lib/types/schema";

export type Permission = "PUBLIC" | "SUDO" | "Watch.Admin";

interface AuthMeta {
  perms: [Permission, ...Permission[]];
}

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta & { auth: AuthMeta }>()
  .create();

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
  })
);

export const router = t.router({
  echo: proc
    .meta({
      openapi: { method: "GET", path: "/echo" },
      auth: { perms: ["PUBLIC"] },
    })
    .input(z.object({ value: z.string() }))
    .output(z.string())
    .query(async ({ input }) => {
      return input.value;
    }),
  videos: t.router({
    get: proc
      .meta({
        openapi: { method: "GET", path: "/videos/{id}" },
        auth: { perms: ["Watch.Admin"] },
      })
      .input(z.object({ id: z.number() }))
      .output(_VideoItemModel)
      .query(async ({ input }) => {
        const v = await findVideoByID(input.id);
        if (!v) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }
        return v;
      }),
  }),
});

export const openapiSpec = generateOpenApiDocument(router, {
  title: "YSTV Internal API",
  baseUrl: "/api/v1",
  version: "0.0.1",
});
