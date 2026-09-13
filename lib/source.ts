export type SourceVersion = {
  version: string;
  date: string;
  downloadURL: string;
  size: number;
  localizedDescription: string;
  minOSVersion: string;
};

export type SourceNews = {
  title: string;
  identifier: string;
  caption: string;
  date: string;
  tintColor: string;
  imageURL: string;
  notify: boolean;
  url: string;
};

export type SourceApp = {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle: string;
  localizedDescription: string;
  iconURL: string;
  headerURL: string;
  website: string;
  tintColor: string;
  category: string;
  screenshots: string[];
  downloadURL: string;
  versions: SourceVersion[];
  appPermissions: { entitlements: string[]; privacy: string[] };
};

export type AltStoreSource = {
  name: string;
  identifier: string;
  subtitle: string;
  description: string;
  iconURL: string;
  headerURL: string;
  website: string;
  tintColor: string;
  featuredApps: string[];
  apps: SourceApp[];
  news: SourceNews[];
};

const versionKey = (v: string) => v.replace(/^v/i, "").split(/[+-]/)[0].split(".").map(n => Number(n) || 0);

function compareVersion(a: string, b: string) {
  const aa = versionKey(a), bb = versionKey(b);
  for (let i = 0; i < 4; i++) {
    if ((aa[i] ?? 0) !== (bb[i] ?? 0)) return (bb[i] ?? 0) - (aa[i] ?? 0);
  }
  return b.localeCompare(a);
}

export function buildAltStoreSource(app: SourceApp, metadata: AltStoreSource): AltStoreSource {
  const versions = app.versions
    .filter(v => v.version && /^https:\/\//i.test(v.downloadURL))
    .sort((a, b) => compareVersion(a.version, b.version))
    .slice(0, 5);

  const latestDownloadURL = versions[0]?.downloadURL || app.downloadURL;

  return {
    ...metadata,
    apps: [{ ...app, versions, downloadURL: latestDownloadURL }],
  };
}

export function buildReleaseNews(app: SourceApp, releases: SourceVersion[], tintColor: string, imageURL: string, website: string): SourceNews[] {
  return releases.slice(0, 5).map(release => ({
    title: `${app.name} v${release.version} Released`,
    identifier: `${app.bundleIdentifier}-${release.version}-release`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    caption: release.localizedDescription,
    date: release.date.slice(0, 10),
    tintColor,
    imageURL,
    notify: true,
    url: website,
  }));
}
