"use client";

import { useState } from "react";

type Props = { sourceUrl: string };

const actionBase =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-default";
const primaryAction = `${actionBase} bg-black text-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg focus:ring-black/10 dark:bg-white dark:text-black dark:focus:ring-white/10`;
const secondaryAction = `${actionBase} border border-black/10 bg-white text-gray-900 hover:border-black/20 hover:bg-gray-50 focus:ring-black/5 dark:border-white/10 dark:bg-white/[.04] dark:text-white dark:hover:bg-white/[.08] dark:focus:ring-white/5`;

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 5h5v5" />
      <path d="M19 5 11 13" />
      <path d="M18 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

function AltStoreIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#ff375f] text-white shadow-sm">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 4.2 4.4 17.5c-.7 1.2.2 2.7 1.6 2.7h12c1.4 0 2.3-1.5 1.6-2.7L12 4.2Zm0 4.1 4.8 8.3H7.2L12 8.3Zm0 7.4a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z" />
      </svg>
    </div>
  );
}

function SideStoreIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-black text-white shadow-sm dark:bg-white dark:text-black">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4.5v15" />
        <path d="m7 9.5 5-5 5 5" />
        <path d="M5.5 15.5h13" />
        <path d="M7.5 19.5h9" />
      </svg>
    </div>
  );
}

export function SourceActions({ sourceUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const feedUrl = /\/(altstore\.json|source\.json)(?=$|\?)/i.test(sourceUrl)
    ? sourceUrl.replace(/\/(altstore\.json)(?=$|\?)/i, "/source.json")
    : sourceUrl;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const altStoreUrl = `altstore://source?url=${encodeURIComponent(feedUrl)}`;
  const sideStoreUrl = `sidestore://source?url=${encodeURIComponent(feedUrl)}`;

  return (
    <section
      className="mt-7 overflow-hidden rounded-[28px] border border-black/[.08] bg-white shadow-[0_8px_35px_rgba(0,0,0,.06)] dark:border-white/[.1] dark:bg-[#111] dark:shadow-none"
      aria-labelledby="source-title"
    >
      <div className="border-b border-black/[.07] px-5 py-5 sm:px-7 sm:py-6 dark:border-white/[.08]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v13" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
            </div>
            <div>
              <p id="source-title" className="text-base font-semibold tracking-tight text-gray-950 dark:text-white">
                Add this app to your source
              </p>
              <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                Get the latest IPA versions directly in AltStore or SideStore.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-white/[.07] dark:text-gray-300">
            5 latest versions
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="rounded-2xl border border-black/[.08] bg-gray-50/80 p-3 dark:border-white/[.09] dark:bg-white/[.035]">
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="text-xs font-semibold uppercase tracking-[.12em] text-gray-500">Source URL</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={feedUrl}
              target="_blank"
              rel="noreferrer"
              title={feedUrl}
              className="min-w-0 flex-1 truncate rounded-xl bg-white px-3.5 py-3 font-mono text-xs text-gray-600 ring-1 ring-black/[.06] transition hover:text-gray-950 dark:bg-black/20 dark:text-gray-400 dark:ring-white/[.08] dark:hover:text-white"
            >
              {feedUrl}
            </a>
            <div className="flex gap-2">
              <a href={feedUrl} target="_blank" rel="noreferrer" className={`${secondaryAction} flex-1 gap-2 sm:flex-none`}>
                <ExternalIcon />
                <span>View</span>
              </a>
              <button type="button" onClick={copy} className={`${primaryAction} flex-1 gap-2 sm:flex-none`}>
                <CopyIcon />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href={altStoreUrl}
            className="group flex items-center gap-4 rounded-2xl border border-black/[.08] bg-white p-4 transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md dark:border-white/[.09] dark:bg-white/[.025] dark:hover:border-white/20"
          >
            <AltStoreIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-950 dark:text-white">AltStore</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">Add source automatically</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-black group-hover:text-white dark:bg-white/[.07] dark:text-gray-400 dark:group-hover:bg-white dark:group-hover:text-black">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </a>

          <a
            href={sideStoreUrl}
            className="group flex items-center gap-4 rounded-2xl border border-black/[.08] bg-white p-4 transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md dark:border-white/[.09] dark:bg-white/[.025] dark:hover:border-white/20"
          >
            <SideStoreIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-950 dark:text-white">SideStore</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">Add source automatically</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-black group-hover:text-white dark:bg-white/[.07] dark:text-gray-400 dark:group-hover:bg-white dark:group-hover:text-black">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Use the source URL above if the automatic buttons don't open your sideloading app.
        </p>
      </div>
    </section>
  );
}
