import { TEST_ONLY_setSession } from "@/lib/auth/server";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { prisma } from "@/lib/db";
import invariant from "@/lib/invariant";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  invariant(process.env.E2E_TEST === "true", "E2E test-only API");
  const payload = schema.parse(await req.json());
  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: {},
    create: {
      email: payload.email,
      username: payload.email.replace(/@.+$/, ""),
      first_name: "Test",
      last_name: "User",
    },
  });
  await TEST_ONLY_setSession({ userID: user.user_id });
  return NextResponse.json({ ok: true });
}