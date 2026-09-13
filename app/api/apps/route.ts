import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const apps = await db.app.findMany({
    where: { enabled: true, ...(category ? { category } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { developerName: { contains: q, mode: "insensitive" } }, { bundleId: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}) },
    include: { releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" }, take: 5 } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(apps);
}
