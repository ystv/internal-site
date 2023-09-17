import { NextRequest } from "next/server";
import { createOpenApiFetchHandler } from "trpc-openapi";
import { appRouter } from "../../_router";
import { createContext } from "../../_base";

const handler = createOpenApiFetchHandler({
  router: appRouter as any,
  createContext,
  endpoint: "/api/v1",
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
