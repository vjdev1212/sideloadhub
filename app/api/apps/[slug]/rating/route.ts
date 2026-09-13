import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const userKey = session?.user?.email?.toLowerCase();
  if (!userKey) return NextResponse.json({ error: "Sign in with Google to rate apps." }, { status: 401 });

  const { slug } = await params;
  const body = await request.json().catch(() => null) as { rating?: unknown } | null;
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const app = await db.app.findFirst({ where: { slug, enabled: true }, select: { id: true } });
  if (!app) return NextResponse.json({ error: "App not found." }, { status: 404 });

  await db.appRating.upsert({
    where: { appId_userKey: { appId: app.id, userKey } },
    update: { rating },
    create: { appId: app.id, userKey, rating },
  });

  const aggregate = await db.appRating.aggregate({ where: { appId: app.id }, _avg: { rating: true }, _count: { rating: true } });
  return NextResponse.json({ average: aggregate._avg.rating ?? 0, count: aggregate._count.rating ?? 0, rating });
}
