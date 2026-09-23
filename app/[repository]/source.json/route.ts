import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRepositoryHeader } from "@/lib/github";
import { buildAltStoreSource, buildReleaseNews, type SourceApp, type SourceNews, type SourceVersion } from "@/lib/source";

export const dynamic = "force-dynamic";

const DEFAULT_TINT = "#007AFF";
const DEFAULT_MIN_OS = "26.0";
const PLATFORMS = ["ios", "ipados", "tvos", "watchos", "visionos", "macos"];

function asString(config: Record<string, unknown>, key: string) {
  return typeof config[key] === "string" && config[key].trim() ? config[key].trim() : undefined;
}

function asStringArray(config: Record<string, unknown>, key: string) {
  return Array.isArray(config[key])
    ? config[key].filter((value): value is string => typeof value === "string" && /^https:\/\//i.test(value))
    : [];
}

function safePart(value: string) {
  return value.toLowerCase().trim().replace(/\.ipa$/i, "").replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "") || "app";
}

function today() {
  return new Date().toISOString();
}

function assetIdentity(fileName: string) {
  const withoutExtension = fileName.replace(/\.ipa$/i, "");
  const platformMatch = withoutExtension.match(
    new RegExp(`(?:^|[-_. ])(${PLATFORMS.join("|")})(?=$|[-_. ])`, "i"),
  );
  const platform = platformMatch?.[1]?.toLowerCase() || "ios";

  const baseName = withoutExtension
    .replace(new RegExp(`(?:^|[-_. ])${PLATFORMS.join("|")}(?=$|[-_. ])`, "gi"), "-")
    .replace(/(?:^|[-_. ])v?\\d+(?:\\.\\d+){1,3}(?=$|[-_. ])/gi, "-")
    .replace(/[-_. ]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    key: `${baseName.toLowerCase()}-${platform}`,
    baseName: baseName || "app",
    platform,
  };
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
      },
    },
  });

  if (!repo || repo.apps.length === 0) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const repositoryApps: SourceApp[] = [];
  const allNews: SourceNews[] = [];

  for (const appLink of repo.apps) {
    const app = appLink.app;
    const config = appLink.configuration && typeof appLink.configuration === "object" && !Array.isArray(appLink.configuration)
      ? appLink.configuration as Record<string, unknown>
      : {};

    const iconURL = asString(config, "iconURL") || app.iconUrl || `https://raw.githubusercontent.com/${repo.owner}/${repo.repository}/${repo.branch || "main"}/icon.png`;
    const headerFromRepo = await getRepositoryHeader(repo.owner, repo.repository, repo.branch || "main", config.headerURL);
    const headerURL = headerFromRepo || iconURL;
    const website = asString(config, "website") || app.developerWebsite || app.githubRepositoryUrl;
    const aboutText = app.description?.trim() || "";
    const subtitle = aboutText || asString(config, "subtitle") || app.name;
    const description = aboutText || asString(config, "description") || `${app.name} is an iOS application distributed through GitHub releases.`;
    const tintColor = asString(config, "tintColor") || DEFAULT_TINT;
    const category = asString(config, "category") || "utilities";
    const configuredScreenshots = asStringArray(config, "screenshots");
    const screenshots = configuredScreenshots.length ? configuredScreenshots : [iconURL];
    const minOSVersion = DEFAULT_MIN_OS;

    const permissions = config.appPermissions && typeof config.appPermissions === "object" && !Array.isArray(config.appPermissions)
      ? config.appPermissions as { entitlements?: unknown; privacy?: unknown }
      : {};

    const assetsByIdentity = new Map<string, {
      baseName: string;
      platform: string;
      versions: SourceVersion[];
    }>();

    for (const release of app.releases) {
      for (const asset of release.assets) {
        if (!/^https:\/\//i.test(asset.downloadUrl) || !/\.ipa$/i.test(asset.fileName)) continue;

        const identity = assetIdentity(asset.fileName);
        const entry = assetsByIdentity.get(identity.key) || {
          baseName: identity.baseName,
          platform: identity.platform,
          versions: [],
        };

        entry.versions.push({
          version: release.version || "1.0.0",
          date: release.publishedAt?.toISOString() || today(),
          downloadURL: asset.downloadUrl,
          size: asset.size ? Number(asset.size) : 0,
          localizedDescription: release.releaseNotes?.trim() || `Version ${release.version || "1.0.0"} release.`,
          minOSVersion,
        });

        assetsByIdentity.set(identity.key, entry);
      }
    }

    const assets = [...assetsByIdentity.values()];
    const hasMultiplePlatforms = new Set(assets.map(asset => asset.platform)).size > 1;
    const baseIdentifier = app.bundleId?.trim() || `com.sideloadhub.${safePart(repo.repository)}`;

    for (const entry of assets) {
      const versions = entry.versions.sort((a, b) => b.date.localeCompare(a.date));
      const platformSuffix = entry.platform === "ios" && !hasMultiplePlatforms ? "" : `-${entry.platform}`;
      const displayPlatform = entry.platform === "ipados" ? "iPadOS" : entry.platform === "tvos" ? "tvOS" : entry.platform === "watchos" ? "watchOS" : entry.platform === "visionos" ? "visionOS" : entry.platform === "macos" ? "macOS" : "iOS";
      const identifier = `${baseIdentifier}${platformSuffix}`;

      const sourceApp: SourceApp = {
        name: hasMultiplePlatforms ? `${app.name} — ${displayPlatform}` : app.name,
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
        downloadURL: versions[0]?.downloadURL || website,
        versions,
        appPermissions: {
          entitlements: Array.isArray(permissions.entitlements)
            ? permissions.entitlements.filter((value): value is string => typeof value === "string")
            : [],
          privacy: Array.isArray(permissions.privacy)
            ? permissions.privacy.filter((value): value is string => typeof value === "string")
            : [],
        },
      };

      repositoryApps.push(sourceApp);
      allNews.push(...buildReleaseNews(sourceApp, versions, tintColor, headerURL, `${repo.githubUrl.replace(/\/$/, "")}/releases`));
    }
  }

  if (repositoryApps.length === 0) {
    return NextResponse.json({ error: "No IPA releases found" }, { status: 404 });
  }

  const primary = repositoryApps[0];
  const source = buildAltStoreSource(repositoryApps, {
    name: primary.name.split(" — ")[0],
    identifier: `com.sideloadhub.${safePart(repo.repository)}`,
    subtitle: primary.subtitle,
    description: primary.localizedDescription,
    iconURL: primary.iconURL,
    headerURL: primary.headerURL,
    website: primary.website,
    tintColor: primary.tintColor,
    featuredApps: [...new Set(repositoryApps.map(app => app.bundleIdentifier))],
    news: allNews
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10),
  });

  return NextResponse.json(source, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
