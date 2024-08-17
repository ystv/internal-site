#syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y ca-certificates git openssl

FROM base AS build
WORKDIR /app
COPY ./.yarn/ .yarn/
COPY . /app/
RUN --mount=type=cache,id=calendar2023-yarn,target=.yarn/cache yarn install --immutable --inline-builds

ENV NODE_ENV=production
ARG GIT_REV
ENV GIT_REV=$GIT_REV
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ARG VERSION
ENV VERSION=$VERSION
RUN SKIP_ENV_VALIDATION=1 yarn run build

FROM base
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/public /app/public
COPY --from=build /app/.next/static /app/.next/static
# Copy these in so that we can still run Prisma migrations in prod
COPY --from=build /app/lib/db/schema.prisma /app/lib/db/schema.prisma
COPY --from=build /app/lib/db/migrations /app/lib/db/migrations
# And so we can run the scripts
COPY --from=build /app/scripts /app/scripts
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["node", "dist/server/index.js"]
