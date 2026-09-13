"use client";

import { FormEvent, useState } from "react";

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(url ? "Repository received. Import and approval workflow will be connected next." : "Enter a GitHub repository URL.");
  }
  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-16"><a href="/" className="text-sm text-gray-500">← SideloadHub</a><h1 className="mt-12 text-5xl font-semibold tracking-tight">Submit an app</h1><p className="mt-4 text-lg text-gray-500">Connect a public GitHub repository and let SideloadHub track its releases.</p><form onSubmit={submit} className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"><label className="text-sm font-medium">GitHub repository URL</label><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/developer/example-app" className="mt-2 w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:border-blue-500 dark:border-white/10"/><button className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">Submit repository</button>{message && <p className="mt-4 text-sm text-gray-500">{message}</p>}</form></main>;
}
