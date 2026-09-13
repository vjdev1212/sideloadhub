import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await db.app.findFirst({ where: { slug, enabled: true }, include: { releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" } } } });
  if (!app) notFound();
  const latest = app.releases[0];
  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-12"><Link href="/apps" className="text-sm text-gray-500">← Apps</Link><div className="mt-10 rounded-3xl border border-black/10 p-7 dark:border-white/10"><div className="flex gap-5"><div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-gray-100 dark:bg-white/10">{app.iconUrl ? <img src={app.iconUrl} alt="" className="h-full w-full object-cover" /> : "✦"}</div><div><h1 className="text-4xl font-semibold">{app.name}</h1><p className="mt-2 text-gray-500">{app.developerName} · {app.bundleId}</p><div className="mt-5 flex gap-2">{latest?.assets[0] && <a href={latest.assets[0].downloadUrl} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">Download IPA</a>}<a href={app.githubRepositoryUrl} className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold dark:border-white/10">GitHub</a></div></div></div><p className="mt-7 leading-7 text-gray-600 dark:text-gray-300">{app.description}</p></div><h2 className="mt-10 text-2xl font-semibold">Version history</h2><div className="mt-4 space-y-3">{app.releases.map(r => <article key={r.id} className="rounded-2xl border border-black/10 p-5 dark:border-white/10"><div className="flex justify-between"><strong>v{r.version}</strong><span className="text-sm text-gray-500">{r.publishedAt?.toLocaleDateString()}</span></div>{r.releaseNotes && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{r.releaseNotes}</p>}</article>)}</div></main>;
}
