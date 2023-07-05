import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import { createContext } from "../../_context";
import { router } from "../../_router";

const handler = (req: NextRequest) => {
  console.log("query", req.nextUrl.searchParams);
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router,
    createContext,
  });
}

export const GET = handler;
export const POST = handler;
