// PWA: service worker ro'yxatdan o'tkazish va yangilanishni kuzatish.
// Faqat production build'da ishlaydi (dev rejimda kesh xalaqit beradi).

export function registerSW() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      const announce = (worker) => {
        // Yangi versiya tayyor — ilovaga xabar beramiz
        window.dispatchEvent(new CustomEvent("pwa:update", { detail: worker }));
      };

      if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) announce(worker);
        });
      });

      // Ilova ochiq turganda ham vaqti-vaqti bilan yangilanishni tekshiramiz
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    } catch {
      /* service worker ishlamasa ham ilova oddiy saytdek ishlayveradi */
    }
  });

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}
