/* ==========================================================================
   GP · sesion · Grupo Progestion
   Guarda SOLO la clave derivada (base64) en sessionStorage: se borra al cerrar
   la app/pestana. No se guarda la contrasena ni datos en claro.
   ========================================================================== */
(function () {
  const K = "gp_k";
  window.GPSession = {
    saveKeyB64: (b64) => {
      try {
        sessionStorage.setItem(K, b64);
      } catch (e) {}
    },
    getKeyBytes: () => {
      const b = sessionStorage.getItem(K);
      return b && window.GPCrypto ? window.GPCrypto.b64toBytes(b) : null;
    },
    has: () => !!sessionStorage.getItem(K),
    clear: () => {
      try {
        sessionStorage.removeItem(K);
      } catch (e) {}
    },
  };
})();
