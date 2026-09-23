"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
        registration.update();
        navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
      }).catch(() => undefined);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setShowInstall(false);
    setInstallEvent(null);
  }

  return (
    <>
      {offline && (
        <div className="pwa-status-banner" role="status">
          You're offline · showing cached content
        </div>
      )}
      {showInstall && installEvent && (
        <div className="pwa-install-banner" role="dialog" aria-label="Install SideloadHub">
          <div className="pwa-install-icon">S</div>
          <div className="pwa-install-copy">
            <strong>Install SideloadHub</strong>
            <span>Use it like a native app with faster cached loading.</span>
          </div>
          <button onClick={install}>Install</button>
          <button className="pwa-dismiss" onClick={() => setShowInstall(false)} aria-label="Dismiss">×</button>
        </div>
      )}
    </>
  );
}
