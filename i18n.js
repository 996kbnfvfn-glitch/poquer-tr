/* ============================================================================
   POKERMIND · Idiomas
   Catalán por defecto, con castellano e inglés. Un único diccionario por idioma
   contiene tanto los textos de interfaz (UI) como todo el contenido del curso.
   ========================================================================== */
window.PM_I18N = (function () {
  'use strict';

  const CODES = ['ca', 'es', 'en'];
  const NAMES = { ca: 'Català', es: 'Castellano', en: 'English' };
  const DEFAULT = 'ca';

  let current = (function () {
    try {
      const saved = localStorage.getItem('pm-lang');
      if (saved && CODES.includes(saved)) return saved;
    } catch (e) {}
    return DEFAULT;                        /* el catalán es el idioma por defecto */
  })();

  const subs = new Set();
  const bundle = () => window.PM_CONTENT[current] || window.PM_CONTENT[DEFAULT];

  function setLocale(code) {
    if (!CODES.includes(code) || code === current) return;
    current = code;
    try { localStorage.setItem('pm-lang', code); } catch (e) {}
    document.documentElement.setAttribute('lang', code);
    subs.forEach(fn => fn(code));
  }

  /* t('calc.title') · admite sustituciones: t('sim.step', {n:2, total:5}) */
  function t(path, vars) {
    const parts = path.split('.');
    let node = bundle().UI;
    for (const p of parts) {
      if (node == null) break;
      node = node[p];
    }
    if (node == null) {
      const fb = window.PM_CONTENT[DEFAULT].UI;
      node = parts.reduce((acc, p) => (acc == null ? acc : acc[p]), fb);
    }
    if (typeof node !== 'string') return node == null ? path : node;
    return vars ? node.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : node;
  }

  /* --- Formato numérico según idioma --------------------------------------- */
  const tag = () => ({ ca: 'ca-ES', es: 'es-ES', en: 'en-US' })[current];
  const num = (n, d) => Number(n).toLocaleString(tag(), { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 0 : d });
  const pct = (x, d) => num(x * 100, d == null ? 1 : d) + '%';
  /* Número con signo explícito: lo consume el semáforo de estadísticas. */
  const signed = (n, d, unit) => (n > 0 ? '+' : n < 0 ? '−' : '') + num(Math.abs(n), d) + (unit || '');

  /* --- Nombre localizado de una mano hecha ---------------------------------- */
  const RCHAR = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  function handName(score) {
    const H = bundle().HAND_NAMES;
    const cat = Math.floor(score / 759375);
    const t1 = Math.floor((score % 759375) / 50625);
    const r = RCHAR[t1] || String(t1);
    const k = ['high', 'pair', 'twoPair', 'trips', 'straight', 'flush', 'full', 'quads', 'sf'][cat];
    if (cat === 8 && t1 === 14) return H.royal;
    return (H[k] || '{r}').replace('{r}', r);
  }

  /* --- Glosario -------------------------------------------------------------- */
  const term = id => bundle().GLOSSARY.find(g => g.id === id) || null;

  return {
    CODES, NAMES, DEFAULT,
    get code() { return current; },
    get L() { return bundle(); },
    setLocale, t, num, pct, signed, handName, term, tag,
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
  };
})();
