"use client";

import { useState } from "react";

type Props = { sourceUrl: string };

const actionBase = "inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition focus:outline-none focus:ring-4";
const primaryAction = `${actionBase} bg-black text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md focus:ring-black/10 dark:bg-white dark:text-black dark:focus:ring-white/10`;
const secondaryAction = `${actionBase} border border-black/10 bg-white text-gray-900 hover:border-black/20 hover:bg-gray-50 focus:ring-black/5 dark:border-white/10 dark:bg-white/[.04] dark:text-white dark:hover:bg-white/[.08] dark:focus:ring-white/5`;

export function SourceActions({ sourceUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const feedUrl = /\/(altstore\.json|source\.json)(?=$|\?)/i.test(sourceUrl)
    ? sourceUrl.replace(/\/(altstore\.json)(?=$|\?)/i, "/source.json")
    : sourceUrl;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const altStoreUrl = `altstore://source?url=${encodeURIComponent(feedUrl)}`;
  const sideStoreUrl = `sidestore://source?url=${encodeURIComponent(feedUrl)}`;

  return (
    <section className="mt-7 rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[.04] sm:p-6" aria-labelledby="source-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p id="source-title" className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Source</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Use the same source with AltStore or SideStore.</p>
        </div>
        <span className="text-xs text-gray-400">5 latest IPA versions</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <a href={feedUrl} target="_blank" rel="noreferrer" className={primaryAction}>View Source</a>
            <button type="button" onClick={copy} className={secondaryAction}>{copied ? "Copied" : "Copy Source URL"}</button>
          </div>
          <a href={feedUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all font-mono text-xs text-gray-500 underline-offset-4 transition hover:text-gray-900 hover:underline dark:hover:text-white">{feedUrl}</a>
        </div>

        <div className="rounded-2xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <a href={altStoreUrl} className={primaryAction}>Add to AltStore</a>
            <a href={sideStoreUrl} className={secondaryAction}>Add to SideStore</a>
          </div>
          <p className="mt-3 break-all font-mono text-xs text-gray-500">
            <span className="font-semibold text-gray-600 dark:text-gray-300">AltStore:</span> {altStoreUrl}
          </p>
          <p className="mt-2 break-all font-mono text-xs text-gray-500">
            <span className="font-semibold text-gray-600 dark:text-gray-300">SideStore:</span> {sideStoreUrl}
          </p>
        </div>
      </div>
    </section>
  );
}
