import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildAltStoreSource, buildReleaseNews, type SourceApp } from "@/lib/source";

export const dynamic = "force-dynamic";

function asString(config: Record<string, unknown>, key: string) {
  return typeof config[key] === "string" && config[key].trim() ? config[key].trim() : undefined;
}

function asStringArray(config: Record<string, unknown>, key: string) {
  return Array.isArray(config[key]) ? config[key].filter((value): value is string => typeof value === "string" && /^https:\/\//i.test(value)) : [];
}

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

  const appLink = repo?.apps[0];
  const app = appLink?.app;
  if (!app || !repo) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

  const config = (appLink.configuration && typeof appLink.configuration === "object" && !Array.isArray(appLink.configuration))
    ? appLink.configuration as Record<string, unknown>
    : {};

  const iconURL = asString(config, "iconURL") || app.iconUrl || `https://github.com/${encodeURIComponent(repo.owner)}.png?size=512`;
  const headerURL = asString(config, "headerURL");
  const website = asString(config, "website") || app.developerWebsite || app.githubRepositoryUrl;
  const subtitle = asString(config, "subtitle") || app.name;
  const tintColor = asString(config, "tintColor");
  const category = asString(config, "category") || app.category.toLowerCase();
  const screenshots = asStringArray(config, "screenshots");
  const minOSVersion = asString(config, "minOSVersion") || asString(config, "minimumOSVersion");

  const versions = app.releases.flatMap(release => {
    const asset = release.assets.find(candidate => /^https:\/\//i.test(candidate.downloadUrl));
    if (!asset) return [];
    return [{
      version: release.version,
      date: release.publishedAt?.toISOString(),
      downloadURL: asset.downloadUrl,
      size: asset.size ? Number(asset.size) : undefined,
      localizedDescription: release.releaseNotes || undefined,
      minOSVersion,
    }];
  });

  const appPermissions = config.appPermissions && typeof config.appPermissions === "object" && !Array.isArray(config.appPermissions)
    ? config.appPermissions as { entitlements?: unknown; privacy?: unknown }
    : {};

  const sourceApp: SourceApp = {
    name: app.name,
    bundleIdentifier: app.bundleId,
    developerName: app.developerName,
    subtitle,
    localizedDescription: app.description || undefined,
    iconURL,
    headerURL,
    website,
    tintColor,
    category,
    screenshots,
    versions,
    appPermissions: {
      entitlements: Array.isArray(appPermissions.entitlements) ? appPermissions.entitlements.filter((value): value is string => typeof value === "string") : [],
      privacy: Array.isArray(appPermissions.privacy) ? appPermissions.privacy.filter((value): value is string => typeof value === "string") : [],
    },
  };

  const source = buildAltStoreSource(sourceApp, {
    name: app.name,
    identifier: app.bundleId,
    subtitle,
    description: app.description || undefined,
    iconURL,
    headerURL,
    website,
    tintColor,
    news: buildReleaseNews(sourceApp, versions, tintColor, headerURL || iconURL, website),
  });

  return NextResponse.json(source, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
