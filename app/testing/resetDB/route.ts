// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { TEST_ONLY_resetDB } from "@/lib/db";
import invariant from "@/lib/invariant";
import { NextResponse } from "next/server";

export async function POST() {
  invariant(process.env.E2E_TEST === "true", "E2E test-only API");
  await TEST_ONLY_resetDB();
  return NextResponse.json({ ok: true });
}
