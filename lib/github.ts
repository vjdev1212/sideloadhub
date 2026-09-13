import { z } from "zod";

const repositorySchema = z.object({
  html_url: z.string().url(),
  name: z.string(),
  owner: z.object({ login: z.string() }),
  description: z.string().nullable(),
  default_branch: z.string(),
});

export function parseGitHubRepositoryUrl(input: string) {
  const url = new URL(input.trim());
  if (url.protocol !== "https:" || url.hostname !== "github.com") throw new Error("Only public github.com repository URLs are supported");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("Invalid GitHub repository URL");
  return { owner: parts[0], repository: parts[1].replace(/\.git$/, "") };
}

export async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`GitHub API error ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getRepository(input: string) {
  const { owner, repository } = parseGitHubRepositoryUrl(input);
  return repositorySchema.parse(await githubFetch(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`));
}

export function isIpaAsset(name: string) { return name.toLowerCase().endsWith(".ipa"); }

export function normalizeVersion(value: string) {
  const match = value.match(/(?:^|[^0-9])([0-9]+(?:\.[0-9]+){0,3})(?:[^0-9]|$)/);
  return match?.[1] ?? value.replace(/^v/i, "").trim();
}
