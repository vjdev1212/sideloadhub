import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildAltStoreSource, type SourceApp } from "@/lib/source";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ repository: string }> }) {
  const { repository } = await params;
  const repo = await db.repository.findFirst({
    where: { repository: { equals: repository, mode: "insensitive" }, enabled: true },
    include: {
      apps: {
        include: {
          app: {
            include: {
              releases: {
                where: { draft: false },
                include: { assets: true },
                orderBy: { publishedAt: "desc" },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const app = repo?.apps[0]?.app;
  if (!app || !repo) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

  const sourceApp: SourceApp = {
    name: app.name,
    bundleIdentifier: app.bundleId,
    developerName: app.developerName,
    subtitle: app.category,
    localizedDescription: app.description ?? undefined,
    iconURL: app.iconUrl ?? undefined,
    versions: app.releases.flatMap(r => r.assets.filter(a => /^https:\/\//i.test(a.downloadUrl)).map(a => ({
      version: r.version,
      date: r.publishedAt?.toISOString(),
      downloadURL: a.downloadUrl,
      size: a.size ? Number(a.size) : undefined,
      localizedDescription: r.releaseNotes ?? undefined,
    }))),
  };

  const source = buildAltStoreSource([sourceApp], app.name);
  return NextResponse.json(source, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
