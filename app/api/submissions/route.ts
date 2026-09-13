import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRepository, parseGitHubRepositoryUrl } from "@/lib/github";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const githubUrl = String(body?.githubUrl ?? "").trim();
    parseGitHubRepositoryUrl(githubUrl);
    const repo = await getRepository(githubUrl);
    const submission = await db.submission.create({ data: { githubUrl: repo.html_url, metadata: body?.metadata ?? undefined } });
    return NextResponse.json({ id: submission.id, status: submission.status, repository: { name: repo.name, owner: repo.owner, description: repo.description, url: repo.html_url } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit repository" }, { status: 400 });
  }
}
