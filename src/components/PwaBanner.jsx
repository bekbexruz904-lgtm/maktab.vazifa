import { useEffect, useState } from "react";
import { Download, RefreshCw, WifiOff, X } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

/** Oflayn, yangilanish va "Ilovani o'rnatish" bannerlari */
export default function PwaBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installEvent, setInstallEvent] = useState(null);
  const [updateWorker, setUpdateWorker] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const beforeInstall = (e) => { e.preventDefault(); setInstallEvent(e); };
    const installed = () => setInstallEvent(null);
    const update = (e) => setUpdateWorker(e.detail);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("pwa:update", update);

    if (isIOS() && !isStandalone()) setShowIOSHint(true);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("pwa:update", update);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const showInstall = !dismissed && !isStandalone() && (installEvent || showIOSHint);

  if (online && !updateWorker && !showInstall) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-3"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      {!online && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl bg-warn-soft px-4 py-3 text-sm font-medium text-warn shadow-lg" role="status">
          <WifiOff size={18} className="shrink-0" />
          Internet yo'q. Yangi ma'lumotlar yuklanmaydi.
        </div>
      )}

      {updateWorker && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg" role="status">
          <RefreshCw size={18} className="shrink-0 text-brand" />
          <span className="flex-1 text-ink">Ilovaning yangi versiyasi tayyor.</span>
          <button
            onClick={() => updateWorker.postMessage("SKIP_WAITING")}
            className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-on-brand"
          >
            Yangilash
          </button>
        </div>
      )}

      {showInstall && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg">
          <Download size={18} className="shrink-0 text-brand" />
          {installEvent ? (
            <>
              <span className="flex-1 text-ink">Ilovani telefoningizga o'rnating.</span>
              <button onClick={install} className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-on-brand">
                O'rnatish
              </button>
            </>
          ) : (
            <span className="flex-1 text-ink">
              O'rnatish uchun Safari'da «Ulashish» → «Bosh ekranga qo'shish» ni bosing.
            </span>
          )}
          <button onClick={dismiss} aria-label="Yopish" className="text-muted">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
