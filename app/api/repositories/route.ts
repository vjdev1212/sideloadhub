import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidAdminToken } from "@/lib/admin";
import { getRepository, parseGitHubRepositoryUrl } from "@/lib/github";
import { syncRepository } from "@/lib/sync";

export async function GET() {
  const repositories = await db.repository.findMany({ orderBy: { updatedAt: "desc" }, include: { apps: { include: { app: true } }, _count: { select: { releases: true } } } });
  return NextResponse.json(repositories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const githubUrl = String(body?.githubUrl ?? "").trim();
    const parsed = parseGitHubRepositoryUrl(githubUrl);
    const repo = await getRepository(githubUrl);
    const existing = await db.repository.findUnique({ where: { githubUrl } });
    const repository = existing ?? await db.repository.create({ data: { githubUrl: repo.html_url, owner: parsed.owner, repository: parsed.repository, branch: repo.default_branch } });
    const app = await syncRepository(repository.id);
    return NextResponse.json({ repository: await db.repository.findUnique({ where: { id: repository.id } }), app }, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import repository" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("sideloadhub_admin")?.value;
  if (!isValidAdminToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = String(body?.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const result = await db.$transaction(async (tx) => {
      const repository = await tx.repository.findUnique({
        where: { id },
        include: { apps: { select: { appId: true } } },
      });
      if (!repository) return null;

      const appIds = [...new Set(repository.apps.map((link) => link.appId))];
      await tx.repository.delete({ where: { id } });

      let orphanAppsDeleted = 0;
      for (const appId of appIds) {
        const remaining = await tx.appRepository.count({ where: { appId } });
        if (remaining === 0) {
          await tx.app.delete({ where: { id: appId } });
          orphanAppsDeleted++;
        }
      }

      return { repository: repository.githubUrl, orphanAppsDeleted };
    });

    if (!result) return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete repository" }, { status: 400 });
  }
}
