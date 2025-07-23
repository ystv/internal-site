// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$executeRaw(Prisma.sql`SELECT 1;`);
  } catch (e) {
    return NextResponse.json(
      { status: "not ok :(", reason: "Could not connect to database" },
      { status: 500 },
    );
  }
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
