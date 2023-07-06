import { TRPCError, initTRPC } from "@trpc/server";
import {
  OpenApiMeta,
  generateOpenApiDocument,
} from "@markspolakovs/trpc-openapi";
import { Context } from "./_context";
import z from "zod";
import { findVideoByID } from "@/lib/videos";

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
  videos: t.router({
    get: publicProcedure
      .meta({ openapi: { method: "GET", path: "/videos/{id}" } })
      .input(z.object({ id: z.number() }))
      .output(z.object({ video_id: z.number(), name: z.string(), url: z.string(), description: z.string(), duration: z.number(), thumbnail: z.string(), created_at: z.date(), updated_at: z.date().nullable() }))
      .query(async ({ input }) => {
        const v = await findVideoByID(input.id);
        if (!v) {
          throw new TRPCError({
            code: "NOT_FOUND"
          });
        }
        return v;
      })
  })
});

export const openapiSpec = generateOpenApiDocument(router, {
  title: "YSTV Internal API",
  baseUrl: "/api/v1",
  version: "0.0.1",
});
