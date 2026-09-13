export type SourceVersion = { version: string; date?: string; downloadURL: string; size?: number; localizedDescription?: string };
export type SourceApp = { name: string; bundleIdentifier: string; developerName: string; subtitle?: string; localizedDescription?: string; iconURL?: string; versions: SourceVersion[] };
export type AltStoreSource = { name: string; identifier: string; apps: SourceApp[] };

const versionKey = (v: string) => v.replace(/^v/i, "").split(/[+-]/)[0].split(".").map(n => Number(n) || 0);
function compareVersion(a: string, b: string) { const aa = versionKey(a), bb = versionKey(b); for (let i=0;i<4;i++) if ((aa[i]??0)!==(bb[i]??0)) return (bb[i]??0)-(aa[i]??0); return b.localeCompare(a); }

export function buildAltStoreSource(apps: SourceApp[], name = "SideloadHub"): AltStoreSource {
  const valid = apps.filter(app => app.name && app.bundleIdentifier && app.developerName && app.versions.length).map(app => ({
    ...app,
    versions: app.versions.filter(v => v.version && /^https:\/\//i.test(v.downloadURL)).sort((a,b) => compareVersion(a.version,b.version)),
  })).filter(app => app.versions.length);
  return { name, identifier: "com.sideloadhub.source", apps: valid };
}
