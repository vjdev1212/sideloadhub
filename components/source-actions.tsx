"use client";

export default function SourceActions({ source }: { source: string }) {
  async function copySource() {
    try {
      await navigator.clipboard.writeText(source);
      const button = document.getElementById("copy-source-button");
      if (button) button.textContent = "Copied";
      window.setTimeout(() => {
        if (button) button.textContent = "Copy Source URL";
      }, 1600);
    } catch {
      window.prompt("Copy this source URL", source);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button id="copy-source-button" type="button" onClick={copySource} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black">
        Copy Source URL
      </button>
      <a href={source} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold dark:border-white/10">
        Preview JSON
      </a>
    </div>
  );
}
