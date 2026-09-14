"use client";

import Link from "next/link";
import { Compass, Plus, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: Sparkles, active: pathname === "/" },
    { href: "/apps", label: "Browse", icon: Compass, active: pathname.startsWith("/apps") },
    { href: "/submit", label: "Add", icon: Plus, active: pathname.startsWith("/submit") },
  ];

  return <nav className="mobile-nav fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg px-3 pb-[max(10px,env(safe-area-inset-bottom))]" aria-label="Primary navigation"><div className="flex items-center justify-around rounded-[24px] border border-black/10 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#16171b]/90">{items.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-4 py-2 text-[11px] font-semibold transition ${active ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 dark:text-gray-400"}`}><Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} /><span>{label}</span></Link>)}</div></nav>;
}

export function DesktopHeader() {
  return <header className="mx-auto hidden max-w-6xl items-center justify-between px-5 py-5 md:flex lg:px-8"><Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-white dark:bg-white dark:text-black"><Sparkles className="h-4 w-4" /></span>SideloadHub</Link><nav className="flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[.04]"><Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">Home</Link><Link href="/apps" className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">Browse</Link><Link href="/submit" className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">Add Repository</Link></nav></header>;
}
