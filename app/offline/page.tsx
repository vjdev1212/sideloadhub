import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-[#111214] text-3xl font-extrabold text-white shadow-lg">S</div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">You're offline</h1>
      <p className="mt-3 text-sm leading-6 text-gray-500">SideloadHub couldn't reach the network. Cached pages and images may still be available.</p>
      <Link href="/" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-black px-6 text-sm font-semibold text-white dark:bg-white dark:text-black">Try again</Link>
    </main>
  );
}
