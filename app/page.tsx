import Link from "next/link";

const categories = ["Media", "Utilities", "Social", "Productivity", "Games", "Development", "Customization", "Education"];

const demoApps = [
  { name: "Example Player", developer: "Independent Developer", version: "1.4.2", category: "Media", icon: "▶" },
  { name: "Pocket Tools", developer: "Open Source Team", version: "2.1.0", category: "Utilities", icon: "✦" },
  { name: "Focus Desk", developer: "Studio North", version: "3.0.1", category: "Productivity", icon: "◒" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">SideloadHub</Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/apps" className="rounded-full px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5">Browse</Link>
          <Link href="/submit" className="rounded-full bg-black px-4 py-2 font-medium text-white dark:bg-white dark:text-black">Add Repository</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            One source. Every release.
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-8xl">Your iOS Sideloading App Store.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">Discover and track the latest releases from independent iOS developers — all in one place.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/apps" className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black">Browse Apps</Link>
            <Link href="/submit" className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/5">Add Repository</Link>
            <Link href="/source" className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold dark:border-white/10">Add Source</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-medium text-blue-600">Explore</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Featured Apps</h2></div><Link href="/apps" className="text-sm font-medium text-gray-500">View all →</Link></div>
        <div className="grid gap-4 md:grid-cols-3">
          {demoApps.map((app) => <article key={app.name} className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[.04]"><div className="flex items-start gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gray-100 text-2xl dark:bg-white/10">{app.icon}</div><div className="min-w-0"><h3 className="font-semibold">{app.name}</h3><p className="mt-1 text-sm text-gray-500">{app.developer}</p><span className="mt-3 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs dark:bg-white/10">{app.category}</span></div></div><div className="mt-6 flex justify-between border-t border-black/5 pt-4 text-sm dark:border-white/10"><span className="text-gray-500">Latest version</span><strong>{app.version}</strong></div></article>)}
        </div>
      </section>

      <section className="border-y border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[.02]"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><h2 className="text-2xl font-semibold">Browse by category</h2><div className="mt-6 flex flex-wrap gap-2">{categories.map(c => <Link key={c} href={`/categories/${c.toLowerCase()}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:border-black/20 dark:border-white/10 dark:bg-white/5">{c}</Link>)}</div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} SideloadHub</span><div className="flex gap-5"><Link href="/source">Source</Link><Link href="/submit">Submit an App</Link></div></footer>
    </main>
  );
}
