"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function RatingStars({ slug, average = 0, count = 0 }: { slug: string; average?: number; count?: number }) {
  const [value, setValue] = useState(Math.round(average));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function rate(rating: number) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/apps/${encodeURIComponent(slug)}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await response.json();
      if (response.status === 401) {
        await signIn("google", { callbackUrl: window.location.href });
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to save rating.");
      setValue(rating);
      setMessage(`${data.average.toFixed(1)} / 5 · ${data.count} rating${data.count === 1 ? "" : "s"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save rating.");
    } finally { setBusy(false); }
  }

  return <div>
    <div className="flex items-center gap-1" aria-label={`Rating ${average.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" disabled={busy} onClick={() => rate(star)} onMouseEnter={() => setValue(star)} onMouseLeave={() => setValue(Math.round(average))} className="text-xl leading-none transition hover:scale-110 disabled:opacity-50" aria-label={`Rate ${star} out of 5`}>
        <span className={star <= value ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}>★</span>
      </button>)}
      <span className="ml-2 text-sm text-gray-500">{average ? average.toFixed(1) : "No rating"} {count ? `(${count})` : ""}</span>
    </div>
    <p className="mt-1 min-h-5 text-xs text-gray-500">{message || "Sign in with Google to rate this app."}</p>
  </div>;
}
