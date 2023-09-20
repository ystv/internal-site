import { prisma } from "@/lib/db";
import { OAuth2Client } from "google-auth-library";

const Google = new OAuth2Client();

interface GoogleTokenClaims {
  iss: string
  azp?: string
  aud: string
  sub: string
  hd?: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  locale?: string
  iat: number
  exp: number
}

const permissibleDomains = new Set(process.env.GOOGLE_PERMITTED_DOMAINS?.split(",") ?? []);

export async function verifyToken(rawToken: string): Promise<GoogleTokenClaims> {
  const ticket = await Google.verifyIdToken({
    idToken: rawToken,
    audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
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

export async function mustFindUserFromGoogleToken(rawToken: string) {
  const claims = await verifyToken(rawToken);
  const user = await prisma.user.findFirst({
    where: {
      identities: {
        some: {
          provider: "google",
          provider_key: claims.sub,
        }
      }
    }
  });
  if (!user) {
    throw new Error("No user found for Google token");
  }
  return user;
}

export async function findOrCreateUserFromGoogleToken(rawToken: string) {
  const claims = await verifyToken(rawToken);
  const user = await prisma.user.findFirst({
    where: {
      identities: {
        some: {
          provider: "google",
          provider_key: claims.sub,
        }
      }
    }
  });
  if (user) {
    return user;
  }
  return prisma.user.create({
    data: {
      first_name: claims.given_name!,
      last_name: claims.family_name!,
      email: claims.email!,
      username: claims.email!.split("@")[0],
      avatar: claims.picture,
      identities: {
        create: {
          provider: "google",
          provider_key: claims.sub,
        }
      }
    }
  });
}
