import { generateOpenApiDocument } from "trpc-openapi";
import { router } from "./_base";
import demo from "./_routers/demo";
import videos from "./_routers/videos";
import calendar from "./_routers/calendar";

export const appRouter = router({
  demo,
  videos,
  calendar,
});

export const openapiSpec = generateOpenApiDocument(appRouter as any, {
  title: "YSTV Internal API",
  baseUrl: "/api/v1",
  version: "0.0.1",
});
