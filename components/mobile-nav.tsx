"use client";

import Link from "next/link";
import { Compass, Plus, Shield, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/apps", label: "Browse", icon: Compass },
  { href: "/submit", label: "Add Repository", icon: Plus },
];

export function MobileNav() {
  const pathname = usePathname();
  const links = items.map(({ href, label, icon: Icon }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return <Link key={href} href={href} className={active ? "active" : ""}><Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} /><span>{label}</span></Link>;
  });

  return (
    <>
      <aside className="mobile-sidebar" aria-label="Primary navigation">
        <Link href="/" className="mobile-sidebar-brand" aria-label="SideloadHub home"><span className="mobile-brand-icon"><Sparkles className="h-4 w-4" /></span><span className="mobile-sidebar-brand-text">SideloadHub</span></Link>
        <nav className="mobile-sidebar-links">{links}</nav>
        <Link href="/admin" className="mobile-sidebar-admin"><Shield className="h-4 w-4" /><span>Admin</span></Link>
      </aside>
      <header className="mobile-landscape-nav">
        <div className="mobile-landscape-inner"><Link href="/" className="mobile-brand" aria-label="SideloadHub home"><span className="mobile-brand-icon"><Sparkles className="h-4 w-4" /></span><span>SideloadHub</span></Link><nav className="mobile-nav-links" aria-label="Primary navigation">{items.map(({ href, label, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} className={active ? "active" : ""}><Icon className="h-[17px] w-[17px]" strokeWidth={active ? 2.5 : 2} /><span>{label === "Add Repository" ? "Add" : label}</span></Link>; })}</nav></div>
      </header>
    </>
  );
}

export function DesktopHeader() {
  return <header className="desktop-header mx-auto hidden max-w-6xl items-center justify-between px-5 py-5 md:flex lg:px-8"><Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-white dark:bg-white dark:text-black"><Sparkles className="h-4 w-4" /></span>SideloadHub</Link><nav className="flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[.04]"><Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">Home</Link><Link href="/apps" className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">Browse</Link><Link href="/submit" className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">Add Repository</Link></nav></header>;
}
