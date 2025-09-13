import { NextResponse } from "next/server";

import { fetchPublicCommittee } from "@/features/committee";

export const dynamic = "force-dynamic";

export async function GET() {
  const committee = await fetchPublicCommittee();

  return NextResponse.json(committee);
}
