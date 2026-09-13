import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncRepository } from "@/lib/sync";

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(raw).digest("hex")}`;
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const payload = JSON.parse(raw) as { repository?: { html_url?: string }; action?: string };
  if (!["published", "released", "created"].includes(payload.action || "")) return NextResponse.json({ ok: true, ignored: true });
  const url = payload.repository?.html_url;
  if (!url) return NextResponse.json({ ok: true, ignored: true });
  const repository = await db.repository.findUnique({ where: { githubUrl: url } });
  if (!repository) return NextResponse.json({ ok: true, ignored: true });
  try { await syncRepository(repository.id); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 }); }
}
