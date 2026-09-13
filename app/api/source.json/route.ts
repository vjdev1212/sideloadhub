import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ name: "SideloadHub", identifier: "com.sideloadhub.source", apps: [] }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
