import { db } from "./db";
import { getAltStoreConfig, getReadme, getReleases, getRepository, isIpaAsset, normalizeVersion, extractDescription } from "./github";

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function syncRepository(repositoryId: string) {
  const stored = await db.repository.findUnique({ where: { id: repositoryId } });
  if (!stored) throw new Error("Repository not found");
  await db.repository.update({ where: { id: repositoryId }, data: { syncStatus: "SYNCING", lastSyncError: null } });
  try {
    const repo = await getRepository(stored.githubUrl);
    const releases = await getReleases(repo.owner, repo.repository);
    const readme = await getReadme(repo.owner, repo.repository);
    const config = await getAltStoreConfig(repo.owner, repo.repository, stored.branch || repo.default_branch);
    const name = typeof config?.name === "string" ? config.name : repo.name;
    const developerName = typeof config?.developerName === "string" ? config.developerName : repo.owner;
    const description = typeof config?.description === "string" ? config.description : repo.description || extractDescription(readme);
    const bundleId = typeof config?.bundleIdentifier === "string" ? config.bundleIdentifier : `com.sideloadhub.${slugify(repo.owner)}.${slugify(repo.name)}`;
    const category = typeof config?.category === "string" ? config.category : "Other";
    const iconUrl = typeof config?.iconURL === "string" && config.iconURL.startsWith("https://") ? config.iconURL : null;
    const slug = `${slugify(name)}-${slugify(repo.owner)}-${slugify(repo.name)}`.slice(0, 100);
    const app = await db.app.upsert({ where: { slug }, update: { name, bundleId, developerName, description, iconUrl, category, githubRepositoryUrl: repo.html_url, githubOwner: repo.owner, githubRepository: repo.repository, lastSyncedAt: new Date() }, create: { slug, name, bundleId, developerName, description, iconUrl, category, githubRepositoryUrl: repo.html_url, githubOwner: repo.owner, githubRepository: repo.repository, lastSyncedAt: new Date() } });
    await db.appRepository.upsert({ where: { appId_repositoryId: { appId: app.id, repositoryId } }, update: { configuration: config ?? undefined }, create: { appId: app.id, repositoryId, configuration: config ?? undefined } });
    for (const release of releases.filter(r => !r.draft && (!r.prerelease || config?.includePrereleases === true))) {
      const ipa = release.assets.filter(a => isIpaAsset(a.name));
      if (!ipa.length) continue;
      const dbRelease = await db.release.upsert({ where: { repositoryId_githubReleaseId: { repositoryId, githubReleaseId: BigInt(release.id) } }, update: { appId: app.id, tagName: release.tag_name, version: normalizeVersion(release.tag_name), releaseName: release.name, releaseNotes: release.body, publishedAt: release.published_at ? new Date(release.published_at) : null, prerelease: release.prerelease, draft: release.draft }, create: { appId: app.id, repositoryId, githubReleaseId: BigInt(release.id), tagName: release.tag_name, version: normalizeVersion(release.tag_name), releaseName: release.name, releaseNotes: release.body, publishedAt: release.published_at ? new Date(release.published_at) : null, prerelease: release.prerelease, draft: release.draft } });
      for (const asset of ipa) await db.ipaAsset.upsert({ where: { releaseId_githubAssetId: { releaseId: dbRelease.id, githubAssetId: BigInt(asset.id) } }, update: { fileName: asset.name, downloadUrl: asset.browser_download_url, size: BigInt(asset.size), contentType: asset.content_type }, create: { releaseId: dbRelease.id, githubAssetId: BigInt(asset.id), fileName: asset.name, downloadUrl: asset.browser_download_url, size: BigInt(asset.size), contentType: asset.content_type } });
    }
    await db.repository.update({ where: { id: repositoryId }, data: { owner: repo.owner, repository: repo.repository, branch: repo.default_branch, syncStatus: "SUCCESS", lastSyncAt: new Date(), lastSyncError: null } });
    return app;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown synchronization error";
    await db.repository.update({ where: { id: repositoryId }, data: { syncStatus: "ERROR", lastSyncAt: new Date(), lastSyncError: message.slice(0, 1000) } });
    throw error;
  }
}
