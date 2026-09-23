import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DesktopHeader, MobileNav } from "@/components/mobile-nav";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: { default: "SideloadHub", template: "%s · SideloadHub" },
  description: "Discover and track the latest releases from independent iOS developers.",
  applicationName: "SideloadHub",
  generator: "SideloadHub",
  appleWebApp: {
    capable: true,
    title: "SideloadHub",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon-192", type: "image/png", sizes: "192x192" },
      { url: "/icon-512", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f8fb",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DesktopHeader />
        <div className="app-shell">{children}</div>
        <MobileNav />
        <PwaRegister />
      </body>
    </html>
  );
}
