"use client";

import { useState } from "react";

type Props = { sourceUrl: string };

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

  const actionClass = "inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85 dark:bg-white dark:text-black";

  return (
    <div className="mt-7 rounded-2xl border border-black/10 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[.04]">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Source</p>
      <div className="mt-4 space-y-4 text-sm">
        <div>
          <a href={feedUrl} target="_blank" rel="noreferrer" className={actionClass}>
            View Source
          </a>
          <p className="mt-2 break-all text-xs text-gray-500">{feedUrl}</p>
        </div>

        <div>
          <button type="button" onClick={copy} className={actionClass}>
            {copied ? "Copied!" : "Copy Source URL"}
          </button>
          <p className="mt-2 break-all text-xs text-gray-500">{feedUrl}</p>
        </div>

        <div>
          <a href={altStoreUrl} className={actionClass}>
            Add to AltStore
          </a>
          <p className="mt-2 break-all text-xs text-gray-500">{altStoreUrl}</p>
        </div>

        <div>
          <a href={sideStoreUrl} className={actionClass}>
            Add to SideStore
          </a>
          <p className="mt-2 break-all text-xs text-gray-500">{sideStoreUrl}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">The feed contains the 5 latest IPA versions.</p>
    </div>
  );
}
