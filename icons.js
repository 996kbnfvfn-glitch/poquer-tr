/* ============================================================================
   POKERMIND · Sistema de iconos
   Un único set: trazo de 1.6 sobre rejilla de 24, extremos redondeados,
   color heredado. Sustituye a los emoji, que mezclaban estilos y tamaños y
   se renderizaban distinto en cada sistema operativo.
   ========================================================================== */
window.PM_ICONS = (function () {
  'use strict';

  /* Cada icono es solo el contenido del <svg>: así comparten viewBox y trazo. */
  const P = {
    /* Tiempo y proceso */
    clock:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    hourglass:'<path d="M7 3h10M7 21h10M8 3v3.2a4 4 0 0 0 1.6 3.2L12 12l2.4-2.6A4 4 0 0 0 16 6.2V3M8 21v-3.2a4 4 0 0 1 1.6-3.2L12 12l2.4 2.6a4 4 0 0 1 1.6 3.2V21"/>',
    pause:    '<rect x="8" y="5" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="14" rx="1"/>',
    /* Estrategia */
    target:   '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    swords:   '<path d="M4 4h3l9.5 9.5M20 4h-3L7.5 13.5"/><path d="M4.5 16.5 8 20M19.5 16.5 16 20M6 14l4 4M18 14l-4 4"/>',
    scale:    '<path d="M12 4v16M7 20h10M3 9h8l-4 6a3.2 3.2 0 0 1-4 0zM13 9h8l-4 6a3.2 3.2 0 0 1-4 0z"/><path d="M12 6 4 8.6M12 6l8 2.6"/>',
    bolt:     '<path d="M13.5 3 5 13.5h5.5L10 21l8.5-10.5H13z"/>',
    puzzle:   '<path d="M9.5 4h5v2.2a1.8 1.8 0 1 0 3.6 0V4H20v5.5h-2.2a1.8 1.8 0 1 0 0 3.6H20V20h-5.5v-2.2a1.8 1.8 0 1 0-3.6 0V20H4v-5.5h2.2a1.8 1.8 0 1 0 0-3.6H4V4z"/>',
    tornado:  '<path d="M4 5h16M6 9h12M8.5 13h7M11 17h3"/><path d="M12 17c0 2 1 4 1 4"/>',
    /* Dinero y datos */
    bank:     '<path d="M3.5 9.5 12 4l8.5 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    chart:    '<path d="M4 19V5M4 19h16"/><path d="M8 16l3.5-4.5 3 2.5L20 8"/>',
    dice:     '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
    clover:   '<path d="M12 21c0-4 0-6 0-6"/><path d="M12 15c-2.6 2.2-6.4 1.4-6.4-1.6 0-1.6 1.2-2.6 2.6-2.6-1.4-1-1.4-3.4.4-4.4 1.6-.9 3.4.1 3.4 1.8 0-1.7 1.8-2.7 3.4-1.8 1.8 1 1.8 3.4.4 4.4 1.4 0 2.6 1 2.6 2.6 0 3-3.8 3.8-6.4 1.6z"/>',
    /* Cartas y mesa */
    cards:    '<rect x="3.5" y="6.5" width="11" height="14" rx="2.2"/><path d="M8 6.5 9.6 4a2 2 0 0 1 2.6-.8l6.4 3a2 2 0 0 1 .9 2.6L15 18"/>',
    spade:    '<path d="M12 3.5 6.8 9.2a3.6 3.6 0 0 0 2.6 6.1c1.1 0 2-.5 2.6-1.2-.2 2.4-1 4.4-2 5.4h4c-1-1-1.8-3-2-5.4.6.7 1.5 1.2 2.6 1.2a3.6 3.6 0 0 0 2.6-6.1z"/>',
    trophy:   '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4.5V7a3.5 3.5 0 0 0 3 3.4M17 5.5h2.5V7a3.5 3.5 0 0 1-3 3.4"/><path d="M12 14v3.5M8.5 20.5h7l-.8-3h-5.4z"/>',
    amphora:  '<path d="M9 3h6M10 3v2.2C7.5 6.4 6 8.8 6 12c0 4 2.6 8 6 8s6-4 6-8c0-3.2-1.5-5.6-4-6.8V3"/><path d="M6.5 9.5C5 9.5 4 10.5 4 12M17.5 9.5c1.5 0 2.5 1 2.5 2.5"/>',
    ship:     '<path d="M4 15.5 6 10h12l2 5.5"/><path d="M8 10V6.5h8V10M12 3v3.5"/><path d="M3 18.5c1.8 0 1.8 1.5 3.6 1.5s1.8-1.5 3.6-1.5 1.8 1.5 3.6 1.5 1.8-1.5 3.6-1.5 1.8 1.5 3.6 1.5"/>',
    /* Persona y mente */
    brain:    '<path d="M9.5 4.5a2.8 2.8 0 0 0-2.8 2.8A2.7 2.7 0 0 0 5 9.8c0 1 .5 1.8 1.3 2.3A2.7 2.7 0 0 0 5.6 14c0 1.5 1.2 2.7 2.7 2.7.2 1.6 1.5 2.8 3.2 2.8V4.5z"/><path d="M14.5 4.5a2.8 2.8 0 0 1 2.8 2.8A2.7 2.7 0 0 1 19 9.8c0 1-.5 1.8-1.3 2.3.5.5.7 1.2.7 1.9 0 1.5-1.2 2.7-2.7 2.7-.2 1.6-1.5 2.8-3.2 2.8"/>',
    eye:      '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/>',
    eyes:     '<circle cx="8" cy="12" r="3.4"/><circle cx="16" cy="12" r="3.4"/><circle cx="8.8" cy="11.4" r="1"/><circle cx="16.8" cy="11.4" r="1"/>',
    heart:    '<path d="M12 20s-7.2-4.4-7.2-9.2A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20z"/>',
    statue:   '<path d="M8 20.5h8M9 20.5V9a3 3 0 0 1 6 0v11.5"/><path d="M9.5 6.5 12 3.5l2.5 3"/><path d="M9 13h6"/>',
    fish:     '<path d="M3 12c3-4 6.5-5 9-5s5.5 1.5 7 3.5L21 12l-2 1.5C17.5 15.5 14.5 17 12 17s-6-1-9-5z"/><path d="M3 12c1.5-.5 3-.5 4 0M16.5 11.2h.01"/>',
    /* Objetos */
    flame:    '<path d="M12 21c3.3 0 6-2.5 6-5.8 0-4.2-4.5-5.7-4.5-9.7 0 0-2.5 1.4-2.5 4.2 0 1.6.8 2.4.8 3.4a1.7 1.7 0 0 1-3.4.2C8 14 6 15.4 6 17.5 6 19.4 8.7 21 12 21z"/>',
    ice:      '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5"/><path d="M12 6.5 10 4.5M12 6.5l2-2M12 17.5l-2 2M12 17.5l2 2"/>',
    chain:    '<path d="M9.5 14.5a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 1 1 5 5l-1 1"/><path d="M14.5 9.5a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 1 1-5-5l1-1"/>',
    headphones:'<path d="M4.5 15v-2.5a7.5 7.5 0 0 1 15 0V15"/><rect x="2.8" y="14" width="4" height="6" rx="2"/><rect x="17.2" y="14" width="4" height="6" rx="2"/>',
    /* Pantallas y señal */
    monitor:  '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20.5h6M12 16.5v4"/>',
    laptop:   '<rect x="5" y="5" width="14" height="10" rx="1.8"/><path d="M2.5 18.5h19l-1.2-2.5H3.7z"/>',
    broadcast:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 4l4 3 4-3"/><path d="M7.5 15.5h4"/>',
    antenna:  '<path d="M12 21v-7"/><circle cx="12" cy="11.5" r="2"/><path d="M8.2 7.8a5.4 5.4 0 0 1 7.6 0M5.6 5.2a9 9 0 0 1 12.8 0"/>',
    /* Interfaz */
    check:    '<path d="M5 12.5 9.5 17 19 7"/>',
    close:    '<path d="M6 6l12 12M18 6L6 18"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    arrowR:   '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"/>',
    arrowL:   '<path d="M19 12H6M11 6.5 5.5 12 11 17.5"/>',
    chevL:    '<path d="M14.5 6 9 12l5.5 6"/>',
    chevR:    '<path d="M9.5 6 15 12l-5.5 6"/>',
    sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
    moon:     '<path d="M20 13.5A8 8 0 0 1 10.5 4 8.2 8.2 0 1 0 20 13.5z"/>',
    sound:    '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>',
    mute:     '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 10l4 4M20 10l-4 4"/>',
    share:    '<circle cx="17.5" cy="6" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="M8.8 10.8l6.4-3.6M8.8 13.2l6.4 3.6"/>',
    help:     '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 1.9-2.4 3.4"/><circle cx="12" cy="17" r=".8"/>',
    search:   '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 20 20"/>',
    book:     '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 18.2A2.5 2.5 0 0 1 6.5 16H19v5H6.5"/>',
    doc:      '<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5M9 13h6M9 17h6"/>',
    grid:     '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chip:     '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/>',
    play:     '<path d="M8 5.6v12.8a.6.6 0 0 0 .92.5l10-6.4a.6.6 0 0 0 0-1l-10-6.4A.6.6 0 0 0 8 5.6z"/>',
    stop:     '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    quote:    '<path d="M9.5 6C7 7.2 5.5 9.4 5.5 12v6h6v-6H8.2c0-1.8.7-3.2 2.3-4zM19.5 6c-2.5 1.2-4 3.4-4 6v6h6v-6h-3.3c0-1.8.7-3.2 2.3-4z"/>',
    mic:      '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"/>',
    shield:   '<path d="M12 3.2 5 6v5.4c0 4.3 2.9 7.4 7 9.4 4.1-2 7-5.1 7-9.4V6z"/><path d="M9.2 12.1l2 2 3.6-4"/>'
  };

  /* Puente desde los emoji del contenido: así el texto sigue siendo texto
     y la iconografía queda centralizada aquí. */
  const FROM_EMOJI = {
    '⏱️':'clock', '⏳':'hourglass', '⏸️':'pause', '⚔️':'swords', '⚖️':'scale', '⚡':'bolt',
    '⛓️':'chain', '🃏':'cards', '🌪️':'tornado', '🍀':'clover', '🎧':'headphones', '🎯':'target',
    '🎲':'dice', '🏆':'trophy', '🏦':'bank', '🏺':'amphora', '🐟':'fish', '👀':'eyes', '👁️':'eye',
    '💻':'laptop', '📡':'antenna', '📺':'broadcast', '🔥':'flame', '🖥️':'monitor', '🗿':'statue',
    '🚢':'ship', '🧊':'ice', '🧠':'brain', '🧩':'puzzle', '🫀':'heart', '♠':'spade', '🂡':'cards',
    '🪙':'chip', '🂠':'cards', '📊':'chart', '🗂️':'grid', '🎭':'eyes', '🛡️':'help', '🔎':'search',
    '💭':'brain', '🤠':'trophy', '⚜️':'spade', '📚':'book'
  };

  const resolve = name => P[name] ? name : (FROM_EMOJI[name] || null);
  return { PATHS: P, FROM_EMOJI, resolve, names: Object.keys(P) };
})();

/* Componente <Icon>: se registra en PM_UI para usarlo como cualquier otro. */
(function () {
  'use strict';
  const { html } = PM_UI;
  function Icon({ name, size = 20, stroke = 1.6, style, className }) {
    const key = PM_ICONS.resolve(name);
    if (!key) return null;
    return html`<svg viewBox="0 0 24 24" width=${size} height=${size} fill="none" stroke="currentColor"
      stroke-width=${stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"
      class=${className} style=${{ display: 'block', flex: 'none', ...(style || {}) }}
      dangerouslySetInnerHTML=${{ __html: PM_ICONS.PATHS[key] }}></svg>`;
  }
  PM_UI.Icon = Icon;
})();
