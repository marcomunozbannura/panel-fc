/* ==========================================================================
   GP · registro del service worker con auto-refresco · Grupo Progestion
   Al abrir la app comprueba si hay una version nueva publicada; si la hay,
   el SW nuevo se activa y la pagina se recarga UNA vez -> datos frescos sin
   que el usuario tenga que cerrar/reabrir. Guarda contra bucles de recarga y
   evita recargar en la primera instalacion (cuando aun no habia controlador).
   ========================================================================== */
(function () {
  if (!("serviceWorker" in navigator)) return;
  var refreshing = false;
  var hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (refreshing) return;
    if (!hadController) return; // 1a instalacion: no recargar
    refreshing = true;
    location.reload();
  });

  navigator.serviceWorker
    .register("sw.js")
    .then(function (reg) {
      try { reg.update(); } catch (e) {}
    })
    .catch(function () {});
})();
