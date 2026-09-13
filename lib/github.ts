import { z } from "zod";

const repositorySchema = z.object({
  id: z.number(), html_url: z.string().url(), name: z.string(), owner: z.object({ login: z.string() }),
  description: z.string().nullable(), default_branch: z.string(), archived: z.boolean().default(false), private: z.boolean().default(false),
});

export type GitHubRepository = z.infer<typeof repositorySchema>;
export type GitHubAsset = { id: number; name: string; browser_download_url: string; size: number; content_type: string | null };
export type GitHubRelease = { id: number; tag_name: string; name: string | null; body: string | null; published_at: string | null; created_at: string; prerelease: boolean; draft: boolean; assets: GitHubAsset[] };

export function parseGitHubRepositoryUrl(input: string) {
  const url = new URL(input.trim());
  if (url.protocol !== "https:" || url.hostname !== "github.com") throw new Error("Only public GitHub HTTPS repository URLs are supported.");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("Invalid GitHub repository URL.");
  return { owner: parts[0], repository: parts[1].replace(/\.git$/, "") };
}

export async function githubFetch<T>(path: string): Promise<T> {
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "SideloadHub/1.0" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.github.com${path}`, { headers, cache: "no-store" });
    if (response.ok) return (await response.json()) as T;
    const body = await response.text();
    if ((response.status === 403 || response.status === 429) && attempt < 2) { await new Promise(r => setTimeout(r, (attempt + 1) * 1500)); continue; }
    lastError = new Error(`GitHub API ${response.status}: ${body.slice(0, 250)}`); break;
  }
  throw lastError ?? new Error("GitHub API request failed");
}

export async function getRepository(input: string) {
  const parsed = parseGitHubRepositoryUrl(input);
  const repo = repositorySchema.parse(await githubFetch(`/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repository)}`));
  if (repo.private || repo.archived) throw new Error("Repository must be public and not archived.");
  return { ...repo, ...parsed };
}

export async function getReleases(owner: string, repository: string) {
  return githubFetch<GitHubRelease[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/releases?per_page=100`);
}

export async function getReadme(owner: string, repository: string) {
  try {
    const data = await githubFetch<{ content?: string; encoding?: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/readme`);
    return data.content ? Buffer.from(data.content, data.encoding === "base64" ? "base64" : "utf8").toString("utf8") : "";
  } catch { return ""; }
}

export async function getAltStoreConfig(owner: string, repository: string, branch: string) {
  try {
    const data = await githubFetch<{ content?: string; encoding?: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/.altstore.json?ref=${encodeURIComponent(branch)}`);
    if (!data.content) return null;
    return JSON.parse(Buffer.from(data.content, data.encoding === "base64" ? "base64" : "utf8").toString("utf8")) as Record<string, unknown>;
  } catch { return null; }
}

export function isIpaAsset(name: string) { return name.toLowerCase().endsWith(".ipa"); }
export function normalizeVersion(value: string) {
  const match = value.match(/\d+(?:\.\d+){0,3}(?:[-+][0-9A-Za-z.-]+)?/);
  return match?.[0] ?? value.trim().replace(/^v/i, "");
}
export function extractDescription(readme: string) {
  return readme.replace(/^\s*#.*$/gm, "").replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[[^\]]+\]\([^)]*\)/g, "$1").replace(/[*_`>#]/g, "").split(/\n\s*\n/).map(x => x.trim()).find(Boolean)?.slice(0, 500) ?? "";
}
