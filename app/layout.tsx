import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SideloadHub", template: "%s · SideloadHub" },
  description: "Discover and track the latest releases from independent iOS developers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
