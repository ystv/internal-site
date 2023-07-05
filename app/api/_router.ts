import { initTRPC } from "@trpc/server";
import {
  OpenApiMeta,
  generateOpenApiDocument,
} from "@markspolakovs/trpc-openapi";
import { Context } from "./_context";
import z from "zod";

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const middleware = t.middleware;
export const publicProcedure = t.procedure;

export const router = t.router({
  echo: publicProcedure
    .meta({ openapi: { method: "GET", path: "/echo" } })
    .input(z.object({ value: z.string() }))
    .output(z.string())
    .query(async ({ input }) => {
      return input.value;
    }),
});

export const openapiSpec = generateOpenApiDocument(router, {
  title: "YSTV Internal API",
  baseUrl: "/api/v1",
  version: "0.0.1",
});
