#syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk update  && apk add ca-certificates git openssl

FROM base AS build
RUN apk update && apk add alpine-sdk python3
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY server/package.json ./server/package.json
COPY lib/db/schema.prisma ./lib/db/schema.prisma
COPY ./.yarn/ .yarn/
RUN --mount=type=cache,id=internal-site-yarn,target=.yarn/cache \
  yarn install --immutable --inline-builds

COPY . /app/

ENV NODE_ENV=production
ARG GIT_REV
ENV GIT_REV=$GIT_REV
ARG VERSION
ENV VERSION=$VERSION
RUN --mount=type=cache,target=/app/.next/cache \
  --mount=type=secret,id=sentry-auth-token \
  SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry-auth-token) \
  SKIP_ENV_VALIDATION=1 \
  PUBLIC_URL="http://localhost:3000" \
  yarn run build

FROM build AS sentry_modules
RUN yarn workspaces focus server --production

FROM base
COPY --from=build /app/dist /app/dist
COPY --from=sentry_modules /app/node_modules /app/node_modules
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/public /app/public
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/next.config.build.js /app/next.config.js
# Copy these in so that we can still run Prisma migrations in prod
COPY --from=build /app/lib/db/schema.prisma /app/lib/db/schema.prisma
COPY --from=build /app/lib/db/migrations /app/lib/db/migrations
# And so we can run the scripts
COPY --from=build /app/scripts /app/scripts
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["node", "dist/server/index.js"]
