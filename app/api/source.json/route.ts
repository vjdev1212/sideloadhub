import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildAltStoreSource, type SourceApp } from "@/lib/source";

export const dynamic = "force-dynamic";

export async function GET() {
  const apps = await db.app.findMany({ where: { enabled: true }, include: { releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" } } } });
  const sourceApps: SourceApp[] = apps.map(app => ({
    name: app.name,
    bundleIdentifier: app.bundleId,
    developerName: app.developerName,
    subtitle: app.category,
    localizedDescription: app.description ?? undefined,
    iconURL: app.iconUrl ?? undefined,
    versions: app.releases.flatMap(r => r.assets.filter(a => /^https:\/\//i.test(a.downloadUrl)).map(a => ({ version: r.version, date: r.publishedAt?.toISOString(), downloadURL: a.downloadUrl, size: a.size ? Number(a.size) : undefined, localizedDescription: r.releaseNotes ?? undefined }))),
  }));
  const source = buildAltStoreSource(sourceApps);
  return NextResponse.json(source, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
