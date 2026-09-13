import Link from "next/link";
import { db } from "@/lib/db";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentRepositories = await db.repository.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      apps: {
        include: {
          app: {
            include: {
              releases: { where: { draft: false }, orderBy: { publishedAt: "desc" }, take: 1, include: { assets: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const appIds = recentRepositories.flatMap(repo => repo.apps.map(link => link.app.id));
  const recentRatings = appIds.length
    ? await db.appRating.groupBy({ by: ["appId"], where: { appId: { in: appIds } }, _avg: { rating: true }, _count: { rating: true } })
    : [];
  const ratingMap = new Map(recentRatings.map(r => [r.appId, { average: r._avg.rating ?? 0, count: r._count.rating ?? 0 }]));

  const topRatingGroups = await db.appRating.groupBy({
    by: ["appId"],
    _avg: { rating: true },
    _count: { rating: true },
    orderBy: [{ _count: { rating: "desc" } }, { _avg: { rating: "desc" } }],
    take: 6,
  });
  const topApps = topRatingGroups.length ? await db.app.findMany({ where: { id: { in: topRatingGroups.map(r => r.appId) }, enabled: true } }) : [];
  const topAppMap = new Map(topApps.map(app => [app.id, app]));

  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">SideloadHub</Link>
        <Link href="/submit" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">Add Repository</Link>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pb-20 lg:pt-24">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">One app. Its latest releases. Ready for AltStore.</div>
          <h1 className="text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-8xl">Discover iOS apps for sideloading.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">Add a public GitHub repository and SideloadHub will keep its latest IPA releases in sync for you.</p>
          <div className="mt-9"><Link href="/submit" className="inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black">Add Repository</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-6"><p className="text-sm font-medium text-blue-600">Fresh from GitHub</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Recently Added</h2><p className="mt-2 text-sm text-gray-500">The 10 newest repositories in the catalog.</p></div>
        {recentRepositories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentRepositories.map(repo => {
              const app = repo.apps[0]?.app;
              const release = app?.releases[0];
              const rating = app ? ratingMap.get(app.id) : undefined;
              return <article key={repo.id} className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[.04]">
                <Link href={app ? `/apps/${app.slug}` : `/submit`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gray-100 text-2xl dark:bg-white/10">{app?.iconUrl ? <img src={app.iconUrl} alt="" className="h-full w-full object-cover" /> : <span>{app?.name?.slice(0, 1).toUpperCase() ?? "✦"}</span>}</div>
                    <div className="min-w-0"><h3 className="truncate font-semibold">{app?.name ?? repo.repository}</h3><p className="truncate text-sm text-gray-500">github.com/{repo.owner}/{repo.repository}</p>{release && <p className="mt-2 text-xs text-gray-500">Latest v{release.version}</p>}</div>
                  </div>
                </Link>
                {app && rating && <div className="mt-5"><RatingStars slug={app.slug} average={rating.average} count={rating.count} /></div>}
              </article>;
            })}
          </div>
        ) : <div className="rounded-3xl border border-dashed border-black/10 px-6 py-14 text-center dark:border-white/10"><h3 className="text-xl font-semibold">No repositories yet</h3><p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">Add the first public GitHub repository to build the catalog.</p></div>}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-6"><p className="text-sm font-medium text-amber-500">Community picks</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Top Starred Apps</h2><p className="mt-2 text-sm text-gray-500">Apps with the most community ratings.</p></div>
        {topRatingGroups.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {topRatingGroups.map(group => {
              const app = topAppMap.get(group.appId);
              if (!app) return null;
              return <article key={app.id} className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[.04]"><Link href={`/apps/${app.slug}`} className="block"><div className="flex items-center gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/10">{app.iconUrl ? <img src={app.iconUrl} alt="" className="h-full w-full object-cover" /> : "✦"}</div><div className="min-w-0"><h3 className="truncate font-semibold">{app.name}</h3><p className="truncate text-sm text-gray-500">{app.developerName}</p></div></div></Link><div className="mt-5"><RatingStars slug={app.slug} average={group._avg.rating ?? 0} count={group._count.rating} /></div></article>;
            })}
          </div>
        ) : <div className="rounded-3xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-gray-500 dark:border-white/10">Ratings will appear here as users review apps.</div>}
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} SideloadHub</span><Link href="/submit">Add Repository</Link></footer>
    </main>
  );
}
