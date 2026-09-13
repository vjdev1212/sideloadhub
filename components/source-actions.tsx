"use client";

import { useState } from "react";

type Props = { sourceUrl: string };

export function SourceActions({ sourceUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const normalizedSourceUrl = sourceUrl.replace(/\/altstore\.json(?:$|\?)/i, "/source.json$&".endsWith("$&") ? "" : "");
  const feedUrl = /\/altstore\.json(?:$|\?)/i.test(sourceUrl)
    ? sourceUrl.replace(/\/altstore\.json(?=$|\?)/i, "/source.json")
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
    <div className="mt-7 rounded-2xl border border-black/10 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[.04]">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Source</p>
      <div className="mt-3 space-y-3 text-sm">
        <div>
          <a href={feedUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">
            View Source <span className="font-normal text-gray-500">(Open link in new tab)</span>
          </a>
          <p className="mt-1 break-all text-xs text-gray-500">{feedUrl}</p>
        </div>

        <div>
          <button type="button" onClick={copy} className="font-semibold text-blue-600 hover:underline">
            {copied ? "Copied!" : "Copy Source URL"} <span className="font-normal text-gray-500">(Copies to Clipboard)</span>
          </button>
          <p className="mt-1 break-all text-xs text-gray-500">{feedUrl}</p>
        </div>

        <div>
          <a href={altStoreUrl} className="font-semibold text-blue-600 hover:underline">
            Add to AltStore
          </a>
          <p className="mt-1 break-all text-xs text-gray-500">{altStoreUrl}</p>
        </div>

        <div>
          <a href={sideStoreUrl} className="font-semibold text-blue-600 hover:underline">
            Add to SideStore
          </a>
          <p className="mt-1 break-all text-xs text-gray-500">{sideStoreUrl}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">The feed contains the 5 latest IPA versions.</p>
    </div>
  );
}
