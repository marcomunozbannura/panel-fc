/* ============================================================
   GP Apps · íconos SVG corporativos · Grupo Progestion
   GP.icon(name, size=16) -> string SVG inline (línea, Lucide/Feather-like)
   viewBox 0 0 24 24 · fill=none · stroke=currentColor · 1.75 · round
   Cárgese ANTES de core.js. Robusto ante orden de carga.
   ============================================================ */
(function(){
  var GP = window.GP = window.GP || {};

  // Cada valor es SOLO el contenido interior del <svg> (paths).
  var P = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M21 10V7h-3"/>',
    trendDown:'<path d="M3 7l6 6 4-4 8 8"/><path d="M21 14v3h-3"/>',
    building:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01"/><path d="M10 21v-4h4v4"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    receipt:'<path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    coins:'<circle cx="8" cy="8" r="5"/><path d="M18.5 6.5a5 5 0 0 1 0 11M13 16a5 5 0 0 0 5 5"/>',
    wallet:'<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8H6"/><circle cx="17" cy="14" r="1"/>',
    bank:'<path d="M3 10h18"/><path d="M12 3l9 5H3l9-5z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/>',
    alert:'<path d="M10.3 3.5 1.9 18a1.5 1.5 0 0 0 1.3 2.3h17.6a1.5 1.5 0 0 0 1.3-2.3L13.7 3.5a1.5 1.5 0 0 0-2.6 0z"/><path d="M12 9v4M12 17h.01"/>',
    refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    cycle:'<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.4-2.6"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.4 2.6"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    pie:'<path d="M12 3a9 9 0 1 0 9 9h-9V3z"/><path d="M14 3.2A9 9 0 0 1 20.8 10H14V3.2z"/>',
    bars:'<path d="M4 20V10M10 20V4M16 20v-8M22 20v-4" transform="translate(-1)"/>',
    barChart:'<path d="M3 21h18"/><rect x="5" y="11" width="3.2" height="7" rx="1"/><rect x="10.4" y="6" width="3.2" height="12" rx="1"/><rect x="15.8" y="13" width="3.2" height="5" rx="1"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    download:'<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    arrowUp:'<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    arrowDown:'<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
    arrowRight:'<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    chevronRight:'<path d="M9 6l6 6-6 6"/>',
    check:'<path d="M4 12.5l5 5 11-11"/>',
    scale:'<path d="M12 3v18M7 21h10"/><path d="M12 6 5 9l-2.5 6a4 4 0 0 0 5 0L5 9M19 9l-7-3M19 9l2.5 6a4 4 0 0 1-5 0L19 9"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    activity:'<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    percent:'<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
    hourglass:'<path d="M6 3h12M6 21h12"/><path d="M7 3c0 4 4 6 5 9 1-3 5-5 5-9M7 21c0-4 4-6 5-9 1 3 5 5 5 9"/>',
    handshake:'<path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.1-3.1a2 2 0 0 0 0-2.8L14 9l-4 4"/><path d="m10 13-2-2a2 2 0 0 0-2.8 0L3 13.2"/><path d="m21 12-3.5-3.5L13 12"/><path d="M3 13.2 6.5 17"/>',
    sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h13M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="18.5" cy="18" r="2"/>',
    creditCard:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    dot:'<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 3 2 3H5"/>',
    shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z"/><path d="M9 12l2 2 4-4"/>',
    zap:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4"/>'
  };
  // alias
  P.money = P.coins;

  GP.icon = function(name, size){
    size = size || 16;
    var body = P[name];
    if(body === undefined){ body = P.dot; }
    return '<svg class="gpic" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" '+
           'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" '+
           'aria-hidden="true" focusable="false">'+body+'</svg>';
  };
  // set de claves disponibles (por si un app quiere validar)
  GP.iconKeys = Object.keys(P);
})();
