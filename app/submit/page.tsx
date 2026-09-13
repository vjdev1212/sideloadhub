"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SubmitPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ githubUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");
      setMessage(data.app ? "Repository imported. Its available IPA releases are now in the catalog." : "Repository imported."); setGithubUrl("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed"); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-16 lg:px-8">
    <Link href="/" className="text-sm text-gray-500">← SideloadHub</Link>
    <div className="mt-12"><p className="text-sm font-medium text-blue-600">Repository import</p><h1 className="mt-2 text-5xl font-semibold tracking-tight">Add a GitHub repository.</h1><p className="mt-5 text-lg text-gray-600 dark:text-gray-300">We’ll inspect its public releases and IPA assets, then add eligible releases directly to the catalog.</p></div>
    <form onSubmit={submit} className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04] sm:p-8">
      <label className="text-sm font-medium">Public GitHub repository URL</label>
      <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required placeholder="https://github.com/developer/app" className="mt-3 w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3 outline-none ring-0 dark:border-white/10" />
      <button disabled={busy} className="mt-4 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black">{busy ? "Importing…" : "Import repository"}</button>
      {message && <p className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 text-sm dark:bg-white/10">{message}</p>}
    </form>
  </main>;
}
