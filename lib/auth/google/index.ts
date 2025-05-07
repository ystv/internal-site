import { prisma } from "@/lib/db";
import { OAuth2Client } from "google-auth-library";
import { SlackTokenJson } from "../slack";
import { env } from "@/lib/env";

const Google = new OAuth2Client();

interface GoogleTokenClaims {
  iss: string;
  azp?: string;
  aud: string;
  sub: string;
  hd?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number;
  exp: number;
}

const permissibleDomains = new Set(
  env.GOOGLE_PERMITTED_DOMAINS?.split(",") ?? [],
);

export async function verifyGoogleToken(
  rawToken: string,
): Promise<GoogleTokenClaims> {
  const ticket = await Google.verifyIdToken({
    idToken: rawToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("No payload in token");
  }
  if (!payload.hd) {
    throw new Error("No hosted domain in token");
  }
  if (!permissibleDomains.has(payload.hd)) {
    throw new Error("Invalid hosted domain in token");
  }
  return payload;
}

export async function findOrCreateUserFromGoogleToken(rawToken: string) {
  const claims = await verifyGoogleToken(rawToken);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          identities: {
            some: {
              provider: "google",
              provider_key: claims.sub,
            },
          },
        },
        {
          email: claims.email,
        },
      ],
    },
    include: {
      identities: true,
    },
  });
  if (user) {
    await prisma.identity.upsert({
      where: {
        provider_provider_key: {
          provider: "google",
          provider_key: claims.sub,
        },
      },
      update: {},
      create: {
        provider: "google",
        provider_key: claims.sub,
        user_id: user.user_id,
      },
    });

    return user;
  }
  return prisma.user.create({
    data: {
      first_name: claims.given_name!,
      last_name: claims.family_name!,
      email: claims.email!,
      avatar: claims.picture,
      identities: {
        create: {
          provider: "google",
          provider_key: claims.sub,
        },
      },
    },
    include: {
      identities: true,
    },
  });
}
