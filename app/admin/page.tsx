"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCw, LogOut, LoaderCircle } from "lucide-react";

type Repository = {
  id: string;
  githubUrl: string;
  owner: string;
  repository: string;
  syncStatus: string;
  lastSyncAt: string | null;
  apps: { app: { name: string } }[];
  _count: { releases: number };
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadRepositories() {
    const response = await fetch("/api/repositories", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load repositories");
    setRepositories(await response.json());
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      setLoggedIn(true); setSecret(""); await loadRepositories();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Login failed"); }
    finally { setBusy(false); }
  }

  async function deleteRepository(repo: Repository) {
    const confirmed = window.confirm("Delete " + repo.owner + "/" + repo.repository + " from SideloadHub?\n\nThis removes its stored releases and IPA assets. The GitHub repository itself will NOT be deleted.");
    if (!confirmed) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/repositories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: repo.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setRepositories((items) => items.filter((item) => item.id !== repo.id));
      setMessage(repo.owner + "/" + repo.repository + " removed from SideloadHub.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/admin", { method: "DELETE" });
    setLoggedIn(false); setRepositories([]);
  }

  useEffect(() => { loadRepositories().then(() => setLoggedIn(true)).catch(() => undefined); }, []);

  if (!loggedIn) return <main className="mx-auto max-w-md px-4 py-16"><h1 className="text-3xl font-bold tracking-tight">SideloadHub Admin</h1><p className="mt-2 text-sm text-gray-500">Enter the configured ADMIN_SECRET to manage repositories.</p><form onSubmit={login} className="mt-6 rounded-3xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.09] dark:bg-white/[.04]"><label htmlFor="secret" className="text-sm font-semibold">Admin secret</label><input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required className="mt-2 min-h-12 w-full rounded-2xl border border-black/10 bg-gray-50 px-4 outline-none dark:border-white/10 dark:bg-black/20" /><button disabled={busy} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sign in"}</button>{message && <p className="mt-3 text-sm text-red-500">{message}</p>}</form></main>;

  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-5 lg:px-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-blue-600">Admin</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Repositories</h1></div><div className="flex gap-2"><button onClick={() => loadRepositories().catch((e) => setMessage(e.message))} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-semibold dark:border-white/10"><RefreshCw className="h-4 w-4" />Refresh</button><button onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-semibold dark:border-white/10"><LogOut className="h-4 w-4" />Logout</button></div></div>{message && <p className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 text-sm dark:bg-white/10">{message}</p>}<div className="mt-6 space-y-3">{repositories.map((repo) => <div key={repo.id} className="flex flex-col gap-4 rounded-3xl border border-black/[.08] bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-white/[.09] dark:bg-white/[.04]"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{repo.owner}/{repo.repository}</p><p className="mt-1 truncate text-xs text-gray-500">{repo.githubUrl}</p><div className="mt-2 flex gap-2 text-xs text-gray-400"><span>{repo.apps.length} app{repo.apps.length === 1 ? "" : "s"}</span><span>·</span><span>{repo._count.releases} releases</span><span>·</span><span>{repo.syncStatus}</span></div></div><button onClick={() => deleteRepository(repo)} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 disabled:opacity-50 dark:border-red-900/50"><Trash2 className="h-4 w-4" />Delete</button></div>)}{repositories.length === 0 && <div className="rounded-3xl border border-dashed border-black/10 p-12 text-center text-sm text-gray-500 dark:border-white/10">No repositories.</div>}</div></main>;
}
