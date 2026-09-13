import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRepositoryHeader } from "@/lib/github";
import { buildAltStoreSource, buildReleaseNews, type SourceApp, type SourceVersion } from "@/lib/source";

export const dynamic = "force-dynamic";

const DEFAULT_TINT = "#007AFF";
const DEFAULT_MIN_OS = "15.0";

function asString(config: Record<string, unknown>, key: string) {
  return typeof config[key] === "string" && config[key].trim() ? config[key].trim() : undefined;
}

function asStringArray(config: Record<string, unknown>, key: string) {
  return Array.isArray(config[key])
    ? config[key].filter((value): value is string => typeof value === "string" && /^https:\/\//i.test(value))
    : [];
}

function feedIdentifier(repositoryName: string) {
  const safe = repositoryName.toLowerCase().trim().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "") || "app";
  return `com.sideloadhub.${safe}`;
}

function today() {
  return new Date().toISOString();
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

  const config = appLink.configuration && typeof appLink.configuration === "object" && !Array.isArray(appLink.configuration)
    ? appLink.configuration as Record<string, unknown>
    : {};

  const identifier = feedIdentifier(repo.repository);
  const iconURL = asString(config, "iconURL") || app.iconUrl || `https://raw.githubusercontent.com/${repo.owner}/${repo.repository}/${repo.branch || "main"}/icon.png`;
  const headerFromRepo = await getRepositoryHeader(repo.owner, repo.repository, repo.branch || "main", config.headerURL);
  const headerURL = headerFromRepo || iconURL;
  const website = asString(config, "website") || app.developerWebsite || app.githubRepositoryUrl;
  const subtitle = asString(config, "subtitle") || `${app.name} - ${app.developerName}`;
  const description = asString(config, "description") || app.description || `${app.name} is an iOS application distributed through GitHub releases.`;
  const tintColor = asString(config, "tintColor") || DEFAULT_TINT;
  const category = asString(config, "category") || "utilities";
  const configuredScreenshots = asStringArray(config, "screenshots");
  const screenshots = configuredScreenshots.length ? configuredScreenshots : [iconURL];
  const minOSVersion = asString(config, "minOSVersion") || asString(config, "minimumOSVersion") || DEFAULT_MIN_OS;

  const versions: SourceVersion[] = app.releases.flatMap(release => {
    const asset = release.assets.find(candidate => /^https:\/\//i.test(candidate.downloadUrl));
    if (!asset) return [];
    return [{
      version: release.version || "1.0.0",
      date: release.publishedAt?.toISOString() || today(),
      downloadURL: asset.downloadUrl,
      size: asset.size ? Number(asset.size) : 0,
      localizedDescription: release.releaseNotes?.trim() || `Version ${release.version || "1.0.0"} release.`,
      minOSVersion,
    }];
  });

  const latestDownloadURL = versions[0]?.downloadURL || website;
  const configuredPermissions = config.appPermissions && typeof config.appPermissions === "object" && !Array.isArray(config.appPermissions)
    ? config.appPermissions as { entitlements?: unknown; privacy?: unknown }
    : {};

  const sourceApp: SourceApp = {
    name: app.name,
    bundleIdentifier: identifier,
    developerName: app.developerName || repo.owner,
    subtitle,
    localizedDescription: description,
    iconURL,
    headerURL,
    website,
    tintColor,
    category,
    screenshots,
    downloadURL: latestDownloadURL,
    versions,
    appPermissions: {
      entitlements: Array.isArray(configuredPermissions.entitlements)
        ? configuredPermissions.entitlements.filter((value): value is string => typeof value === "string")
        : [],
      privacy: Array.isArray(configuredPermissions.privacy)
        ? configuredPermissions.privacy.filter((value): value is string => typeof value === "string")
        : [],
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
    news: buildReleaseNews(sourceApp, versions, tintColor, headerURL, `${repo.githubUrl.replace(/\/$/, "")}/releases`),
  });

  return NextResponse.json(source, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
