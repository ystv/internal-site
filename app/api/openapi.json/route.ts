import { NextResponse } from "next/server";
import { openapiSpec } from "../_router";

export function GET() {
  return NextResponse.json(openapiSpec);
}
