import { getCurrentUser } from "@/lib/auth/server";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { prisma } from "@/lib/db";
import invariant from "@/lib/invariant";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  roles: z.array(z.string()),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  invariant(process.env.E2E_TEST === "true", "E2E test-only API");
  const payload = schema.parse(await req.json());
  const me = await getCurrentUser();
  const roles = await prisma.roleMember.findMany({
    where: {
      user_id: me.user_id,
    },
    include: {
      roles: true,
    },
  });
  const roleNames = roles.map((role) => role.roles.name);
  const rolesToAdd = payload.roles.filter((role) => !roleNames.includes(role));
  const rolesToRemove = roleNames.filter(
    (role) => !payload.roles.includes(role),
  );
  await prisma.roleMember.deleteMany({
    where: {
      user_id: me.user_id,
      roles: {
        name: {
          in: rolesToRemove,
        },
      },
    },
  });
  const roleIdsToAdd = await prisma.role.findMany({
    where: {
      name: {
        in: rolesToAdd,
      },
    },
    select: {
      role_id: true,
    },
  });
  await prisma.roleMember.createMany({
    data: roleIdsToAdd.map((roleId) => ({
      user_id: me.user_id,
      role_id: roleId.role_id,
    })),
  });
  return NextResponse.json({ ok: true });
}
