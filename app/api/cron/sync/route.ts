import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncRepository } from "@/lib/sync";

export const maxDuration = 60;

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected && request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const repositories = await db.repository.findMany({ where: { enabled: true }, orderBy: { lastSyncAt: "asc" }, take: 10 });
  const results = [];
  for (const repository of repositories) {
    try { const app = await syncRepository(repository.id); results.push({ id: repository.id, ok: true, appId: app.id }); }
    catch (error) { results.push({ id: repository.id, ok: false, error: error instanceof Error ? error.message : "Sync failed" }); }
  }
  return NextResponse.json({ ok: true, results });
}
