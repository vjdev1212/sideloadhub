import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRepositoryHeader } from "@/lib/github";
import { buildAltStoreSource, buildReleaseNews, type SourceApp } from "@/lib/source";

export const dynamic = "force-dynamic";

function asString(config: Record<string, unknown>, key: string) {
  return typeof config[key] === "string" && config[key].trim() ? config[key].trim() : undefined;
}

function asStringArray(config: Record<string, unknown>, key: string) {
  return Array.isArray(config[key]) ? config[key].filter((value): value is string => typeof value === "string" && /^https:\/\//i.test(value)) : [];
}

function feedIdentifier(repositoryName: string) {
  const safe = repositoryName.toLowerCase().trim().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "") || "app";
  return `com.sideloadhub.${safe}`;
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
              releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" } },
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

  const identifier = feedIdentifier(repo.repository);
  const iconURL = asString(config, "iconURL") || app.iconUrl || `https://github.com/${encodeURIComponent(repo.owner)}.png?size=512`;
  const headerFromRepo = await getRepositoryHeader(repo.owner, repo.repository, repo.branch || "main", config.headerURL);
  const headerURL = headerFromRepo || iconURL;
  const website = asString(config, "website") || app.developerWebsite || app.githubRepositoryUrl;
  const subtitle = asString(config, "subtitle") || app.name;
  const description = asString(config, "description") || app.description || `${app.name} published from ${repo.owner}/${repo.repository}.`;
  const tintColor = asString(config, "tintColor") || "#007AFF";
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

  const configuredPermissions = config.appPermissions && typeof config.appPermissions === "object" && !Array.isArray(config.appPermissions)
    ? config.appPermissions as { entitlements?: unknown; privacy?: unknown }
    : {};

  const sourceApp: SourceApp = {
    name: app.name,
    bundleIdentifier: identifier,
    developerName: app.developerName,
    subtitle,
    localizedDescription: description,
    iconURL,
    headerURL,
    website,
    tintColor,
    category,
    screenshots,
    versions,
    appPermissions: {
      entitlements: Array.isArray(configuredPermissions.entitlements) ? configuredPermissions.entitlements.filter((value): value is string => typeof value === "string") : [],
      privacy: Array.isArray(configuredPermissions.privacy) ? configuredPermissions.privacy.filter((value): value is string => typeof value === "string") : [],
    },
  };

  const source = buildAltStoreSource(sourceApp, {
    name: app.name,
    identifier,
    subtitle,
    description,
    iconURL,
    headerURL,
    website,
    tintColor,
    featuredApps: [identifier],
    news: buildReleaseNews(sourceApp, versions, tintColor, headerURL, website),
  });

  return NextResponse.json(source, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
