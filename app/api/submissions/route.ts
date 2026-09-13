import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRepository, parseGitHubRepositoryUrl } from "@/lib/github";
import { syncRepository } from "@/lib/sync";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const githubUrl = String(body?.githubUrl ?? "").trim();
    const parsed = parseGitHubRepositoryUrl(githubUrl);
    const repo = await getRepository(githubUrl);
    const existing = await db.repository.findUnique({ where: { githubUrl: repo.html_url } });
    const repository = existing ?? await db.repository.create({ data: { githubUrl: repo.html_url, owner: parsed.owner, repository: parsed.repository, branch: repo.default_branch } });
    const app = await syncRepository(repository.id);
    const submission = await db.submission.create({
      data: { githubUrl: repo.html_url, metadata: body?.metadata ?? undefined, status: "IMPORTED" },
    });
    return NextResponse.json({ id: submission.id, status: submission.status, repository: await db.repository.findUnique({ where: { id: repository.id } }), app }, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import repository" }, { status: 400 });
  }
}
