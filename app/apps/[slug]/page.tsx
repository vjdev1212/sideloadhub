import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

function getRequestOrigin(headerStore: Headers) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) return configured;

  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  const host = headerStore.get("host");
  if (host) return `${forwardedProto}://${host}`;

  return configured || "http://localhost:3000";
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await db.app.findFirst({ where: { slug, enabled: true }, include: { repositories: { include: { repository: true }, take: 1 }, releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" } } } });
  if (!app) notFound();

  const aggregate = await db.appRating.aggregate({ where: { appId: app.id }, _avg: { rating: true }, _count: { rating: true } });
  const average = aggregate._avg.rating ?? 0;
  const count = aggregate._count.rating ?? 0;
  const latest = app.releases[0];
  const repoName = app.repositories[0]?.repository.repository;
  const site = getRequestOrigin(await headers());
  const altStoreUrl = repoName ? `${site}/${encodeURIComponent(repoName)}/altstore.json` : null;

  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-12">
    <div className="flex items-center justify-between"><Link href="/apps" className="text-sm text-gray-500">← Apps</Link><Link href="/submit" className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">Add Repository</Link></div>
    <div className="mt-10 rounded-3xl border border-black/10 p-7 dark:border-white/10">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gray-100 dark:bg-white/10">{app.iconUrl ? <img src={app.iconUrl} alt="" className="h-full w-full object-cover" /> : "✦"}</div>
        <div className="min-w-0"><h1 className="text-4xl font-semibold">{app.name}</h1><p className="mt-2 text-gray-500">{app.developerName} · {app.bundleId}</p><div className="mt-4"><RatingStars slug={app.slug} average={average} count={count} /></div><div className="mt-5 flex flex-wrap gap-2">{latest?.assets.map(asset => <a key={asset.id} href={asset.downloadUrl} target="_blank" rel="noreferrer" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">Download IPA</a>)}<a href={app.githubRepositoryUrl} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold dark:border-white/10">GitHub</a></div></div>
      </div>
      {app.description && <p className="mt-7 leading-7 text-gray-600 dark:text-gray-300">{app.description}</p>}
      {altStoreUrl && <div className="mt-7 rounded-2xl bg-gray-50 p-4 dark:bg-white/[.04]"><p className="text-xs font-medium uppercase tracking-wider text-gray-500">AltStore JSON</p><a href={altStoreUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-medium text-blue-600 hover:underline">{altStoreUrl}</a><p className="mt-2 text-xs text-gray-500">Includes the 5 latest IPA versions for this app.</p></div>}
    </div>
    <h2 className="mt-10 text-2xl font-semibold">Version history</h2>
    <div className="mt-4 space-y-3">{app.releases.map(r => <article key={r.id} className="rounded-2xl border border-black/10 p-5 dark:border-white/10"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><strong>v{r.version}</strong><span className="ml-3 text-sm text-gray-500">{r.publishedAt?.toLocaleDateString()}</span></div><div className="flex flex-wrap gap-2">{r.assets.map(asset => <a key={asset.id} href={asset.downloadUrl} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold dark:border-white/10">Download IPA</a>)}</div></div>{r.releaseNotes && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{r.releaseNotes}</p>}</article>)}</div>
  </main>;
}
