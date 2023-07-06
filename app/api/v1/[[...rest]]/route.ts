import { NextRequest } from "next/server";
import {
  createOpenApiFetchHandler
} from '@markspolakovs/trpc-openapi';
import { router } from "../../_router";
import { createContext } from "../../_context";

const handler = createOpenApiFetchHandler({
  router,
  createContext,
  endpoint: "/api/v1"
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
