/* ==========================================================================
   GP · bootstrap de cada app publicada · Grupo Progestion
   1) Exige clave de sesion (si no -> vuelve al login).
   2) Descifra los datos (window.__ENC__) en memoria: define window.__DB__,
      window.__META__ y window.__FLUJO_PRELOADED__.
   3) Parcha el modo "snapshot" (sin motor local): loadFlujo/reloadData.
   4) Ejecuta el script de la app que quedo en cola (<script type=text/gp-app>).
   5) Inyecta boton "Inicio", registra el service worker.
   ========================================================================== */
(async function () {
  const goLogin = () => location.replace("index.html");
  try {
    if (!window.GPSession || !window.GPSession.has()) return goLogin();
    if (!window.__ENC__ || !window.GPCrypto) return goLogin();

    const keyBytes = window.GPSession.getKeyBytes();
    const keys = await window.GPCrypto.importKeys(keyBytes);

    // --- datos principales ---
    const dbText = await window.GPCrypto.decryptText(keys, window.__ENC__.db);
    (0, eval)(dbText); // define window.__DB__ y window.__META__

    // --- flujo de caja (Factoring), opcional ---
    if (window.__ENC__.flujo) {
      try {
        const fText = await window.GPCrypto.decryptText(keys, window.__ENC__.flujo);
        window.__FLUJO_PRELOADED__ = JSON.parse(fText);
      } catch (e) {
        window.__FLUJO_PRELOADED__ = null;
      }
    }

    // --- modo snapshot: no hay motor local en el celular ---
    if (window.GP) {
      window.GP.loadFlujo = function () {
        window.GP.FLUJO = window.__FLUJO_PRELOADED__ || null;
        return Promise.resolve(window.GP.FLUJO);
      };
      window.GP.reloadData = function (cb) {
        if (cb) cb(false);
      };
    }

    // --- ejecutar la app (su script quedo en cola sin ejecutarse) ---
    const tag = document.querySelector('script[type="text/gp-app"]');
    if (tag) {
      const s = document.createElement("script");
      s.textContent = tag.textContent;
      document.body.appendChild(s);
    }

    injectChrome();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  } catch (e) {
    if (e && e.message === "BAD_KEY" && window.GPSession) window.GPSession.clear();
    console.error("GP boot:", e);
    goLogin();
  }

  function injectChrome() {
    if (document.getElementById("gpHome")) return;
    const b = document.createElement("button");
    b.id = "gpHome";
    b.type = "button";
    b.title = "Volver al inicio";
    b.setAttribute("aria-label", "Volver al inicio");
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>';
    b.onclick = () => (location.href = "index.html");
    document.body.appendChild(b);
  }
})();
