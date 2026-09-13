export type SourceVersion = {
  version: string;
  date?: string;
  downloadURL: string;
  size?: number;
  localizedDescription?: string;
};

export type SourceApp = {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  localizedDescription?: string;
  iconURL?: string;
  versions: SourceVersion[];
};

export type AltStoreSource = {
  name: string;
  identifier?: string;
  apps: SourceApp[];
};

export function buildAltStoreSource(apps: SourceApp[], name = "SideloadHub"): AltStoreSource {
  const valid = apps.filter((app) =>
    Boolean(app.name && app.bundleIdentifier && app.developerName && app.versions.length && app.versions.every((v) => v.version && /^https:\/\//i.test(v.downloadURL)))
  ).map((app) => ({ ...app, versions: [...app.versions].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true })) }));
  return { name, identifier: "com.sideloadhub.source", apps: valid };
}
