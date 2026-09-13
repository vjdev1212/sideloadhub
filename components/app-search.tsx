"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AppSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      if (nextUrl !== `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`) {
        router.replace(nextUrl, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [value, pathname, router, searchParams]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value);

  return (
    <div className="relative mt-8">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400">
        <path d="m21 21-4.35-4.35m1.35-5.65A7 7 0 1 1 4 11a7 7 0 0 1 14 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        name="q"
        value={value}
        onChange={onChange}
        placeholder="Search apps or developers…"
        aria-label="Search apps or developers"
        autoComplete="off"
        className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black/25 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-white/[.04] dark:focus:border-white/25 dark:focus:ring-white/5"
      />
    </div>
  );
}
