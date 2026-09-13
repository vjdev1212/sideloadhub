import { NextResponse } from "next/server";
import { syncRepository } from "@/lib/sync";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  try { return NextResponse.json({ ok: true, app: await syncRepository(id) }); }
  catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Sync failed" }, { status: 400 }); }
}
