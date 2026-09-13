import Link from "next/link";
import { db } from "@/lib/db";
import { RatingStars } from "@/components/rating-stars";
import { AppSearch } from "@/components/app-search";

export const dynamic = "force-dynamic";

export default async function AppsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim();
  const sort = params.sort === "rating" ? "rating" : "updated";

  const apps = await db.app.findMany({
    where: {
      enabled: true,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { developerName: { contains: q, mode: "insensitive" } },
              { bundleId: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      releases: { where: { draft: false }, include: { assets: true }, orderBy: { publishedAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const ratingGroups = apps.length
    ? await db.appRating.groupBy({
        by: ["appId"],
        where: { appId: { in: apps.map((app) => app.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const ratings = new Map(
    ratingGroups.map((rating) => [
      rating.appId,
      { average: rating._avg.rating ?? 0, count: rating._count.rating ?? 0 },
    ]),
  );

  if (sort === "rating") {
    apps.sort((a, b) => {
      const aRating = ratings.get(a.id);
      const bRating = ratings.get(b.id);
      const countDiff = (bRating?.count ?? 0) - (aRating?.count ?? 0);
      if (countDiff !== 0) return countDiff;
      return (bRating?.average ?? 0) - (aRating?.average ?? 0);
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-gray-500 transition hover:text-black dark:hover:text-white">← SideloadHub</Link>
        <Link href="/submit" className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-black">Add Repository</Link>
      </div>

      <div className="mt-12">
        <h1 className="text-5xl font-semibold tracking-tight">Apps</h1>
        <p className="mt-3 text-gray-500">Apps synchronized from public GitHub repositories.</p>
      </div>

      <AppSearch initialQuery={q} />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={q ? `/apps?q=${encodeURIComponent(q)}` : "/apps"} className={`rounded-full px-4 py-2 text-sm font-medium transition ${sort === "updated" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 text-gray-600 hover:border-black/20 dark:border-white/10 dark:text-gray-300"}`}>
          Recently Updated
        </Link>
        <Link href={q ? `/apps?q=${encodeURIComponent(q)}&sort=rating` : "/apps?sort=rating"} className={`rounded-full px-4 py-2 text-sm font-medium transition ${sort === "rating" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 text-gray-600 hover:border-black/20 dark:border-white/10 dark:text-gray-300"}`}>
          Top Rated
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => {
          const latest = app.releases[0];
          const rating = ratings.get(app.id);
          return (
            <article key={app.id} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[.04]">
              <Link href={`/apps/${app.slug}`} className="block">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/10">
                    {app.iconUrl ? <img src={app.iconUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">✦</span>}
                  </div>
                  <div className="min-w-0"><h2 className="truncate font-semibold">{app.name}</h2><p className="truncate text-sm text-gray-500">{app.developerName}</p></div>
                </div>
                <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{app.description || "Independent iOS app distributed from GitHub."}</p>
              </Link>
              {rating && <div className="mt-4"><RatingStars slug={app.slug} average={rating.average} count={rating.count} /></div>}
              <div className="mt-5 flex items-center justify-between text-sm"><span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-white/10">{app.category}</span>{latest && <strong>v{latest.version}</strong>}</div>
            </article>
          );
        })}
      </div>

      {apps.length === 0 && <div className="mt-10 rounded-3xl border border-dashed border-black/10 p-12 text-center text-gray-500 dark:border-white/10">No apps found yet. Add a repository to start the catalog.</div>}
    </main>
  );
}
