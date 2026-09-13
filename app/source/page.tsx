import SourceActions from "@/components/source-actions";

export default function SourcePage() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const source = `${site}/api/source.json`;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-16">
      <a href="/" className="text-sm text-gray-500">← SideloadHub</a>
      <h1 className="mt-12 text-5xl font-semibold tracking-tight">Your source</h1>
      <p className="mt-4 text-lg text-gray-500">Add this centralized source to AltStore or SideStore. Future approved releases will appear automatically.</p>
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Source URL</p>
        <code className="mt-3 block break-all rounded-2xl bg-gray-100 p-4 text-sm dark:bg-black/30">{source}</code>
        <SourceActions source={source} />
      </div>
    </main>
  );
}
