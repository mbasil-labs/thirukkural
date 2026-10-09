import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/cn";

export function PwaRegister() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
  }, []);
  return null;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const update = () => setStandalone(media.matches || Boolean(nav.standalone));
    update();
    media.addEventListener("change", update);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  if (standalone) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return;
    }
    window.location.assign("/?install=1");
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={cn(
        "inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-md border border-border-dark bg-bg-raised px-2.5 text-xs font-medium text-on-dark transition-transform duration-150 ease-out active:scale-[0.96]",
        className,
      )}
      aria-label="Install app"
    >
      <Download className="size-3.5" strokeWidth={1.75} />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}
