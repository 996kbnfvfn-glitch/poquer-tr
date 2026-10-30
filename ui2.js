/* ============================================================================
   POKERMIND · Componentes v2
   Texto con términos de glosario, semáforo de estadísticas y barra de claves.
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useMemo } = React;
  const U = PM_UI, E = PM, I = PM_I18N;
  const { html, sound } = U;

  /* Nombre del palo en el idioma activo (para lectores de pantalla). */
  const SUITS_BY_LANG = {
    ca: { s: 'de piques', h: 'de cors', d: 'de diamants', c: 'de trèvols' },
    es: { s: 'de picas', h: 'de corazones', d: 'de diamantes', c: 'de tréboles' },
    en: { s: 'of spades', h: 'of hearts', d: 'of diamonds', c: 'of clubs' }
  };
  const suitName = s => (SUITS_BY_LANG[I.code] || SUITS_BY_LANG.ca)[s] || '';

  /* --- Texto con términos del glosario -------------------------------------
     Los textos del contenido pueden escribir [[id]] o [[id|palabra visible]].
     Se renderiza como un término subrayado que muestra definición y ejemplo. */
  function Term({ id, label }) {
    const [open, setOpen] = useState(false);
    const g = I.term(id);
    const box = useRef(null);
    useEffect(() => {
      if (!open) return;
      const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
      const esc = e => e.key === 'Escape' && setOpen(false);
      document.addEventListener('mousedown', away);
      document.addEventListener('keydown', esc);
      return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
    }, [open]);
    if (!g) return html`<span>${label || id}</span>`;
    return html`<span ref=${box} style=${{ position: 'relative', display: 'inline' }}>
      <button type="button" class="term" aria-expanded=${open}
        title=${g.short}
        onMouseEnter=${() => setOpen(true)} onMouseLeave=${() => setOpen(false)}
        onFocus=${() => setOpen(true)} onClick=${e => { e.preventDefault(); setOpen(!open); }}>${label || g.term}</button>
      ${open && html`<span class="term-pop" role="tooltip">
        <b>${g.term}</b><span>${g.short}</span><span class="ex">${g.ex}</span></span>`}
    </span>`;
  }

  /* Convierte una cadena con marcas [[...]] en nodos React. */
  function RichText({ children, text }) {
    const src = text != null ? text : children;
    if (typeof src !== 'string' || src.indexOf('[[') === -1) return src || null;
    const out = [];
    const re = /\[\[([a-z0-9]+)(?:\|([^\]]+))?\]\]/gi;
    let last = 0, m, k = 0;
    while ((m = re.exec(src)) !== null) {
      if (m.index > last) out.push(src.slice(last, m.index));
      out.push(html`<${Term} key=${'t' + (k++)} id=${m[1]} label=${m[2]} />`);
      last = m.index + m[0].length;
    }
    if (last < src.length) out.push(src.slice(last));
    return out;
  }
  /* Versión sin componentes, para atributos y títulos. */
  const plain = s => (typeof s === 'string' ? s.replace(/\[\[([a-z0-9]+)(?:\|([^\]]+))?\]\]/gi, (m, id, lb) => lb || id) : s);

  /* --- Semáforo de estadísticas ---------------------------------------------
     Verde si el valor favorece al jugador, rojo si le perjudica. El color nunca
     va solo: siempre lo acompaña el signo o una flecha. */
  function signOf(value, opts) {
    const o = opts || {};
    if (o.tone) return o.tone;                          /* tono forzado */
    const v = Number(value);
    if (!isFinite(v) || v === 0) return 'neutral';
    const good = o.lowerIsBetter ? v < 0 : v > 0;
    return good ? 'pos' : 'neg';
  }
  /* Valor con umbral: por debajo de `good` es verde, por encima de `bad` es rojo. */
  function toneByThreshold(v, good, bad) { return v <= good ? 'pos' : v >= bad ? 'neg' : 'warn'; }

  function Stat({ value, display, decimals, unit, lowerIsBetter, tone, arrow }) {
    const t = signOf(value, { lowerIsBetter, tone });
    const txt = display != null ? display : I.signed(Number(value), decimals == null ? 1 : decimals, unit || '');
    const ar = arrow === false ? null : t === 'pos' ? '▲' : t === 'neg' ? '▼' : null;
    return html`<span class=${'stat stat--' + t}>${ar && html`<span class="arrow" aria-hidden="true">${ar}</span>`}${txt}</span>`;
  }

  function StatBox({ label, value, note, tone, lowerIsBetter, display, decimals, unit, raw }) {
    const t = tone || signOf(value, { lowerIsBetter });
    const txt = display != null ? display : (raw ? value : I.signed(Number(value), decimals == null ? 1 : decimals, unit || ''));
    return html`<div class=${'statbox statbox--' + t}>
      <span class="hint">${label}</span>
      <span class="v" style=${{ color: t === 'pos' ? 'var(--good)' : t === 'neg' ? 'var(--bad)' : t === 'warn' ? 'var(--warn)' : 'var(--gold)' }}>${txt}</span>
      ${note && html`<span class="hint">${note}</span>`}
    </div>`;
  }

  /* --- Barra de claves ------------------------------------------------------
     Rota sola, se detiene al pasar el cursor y acompaña todas las pestañas. */
  function InsightBar() {
    const items = I.L.INSIGHTS;
    const [i, setI] = useState(() => Math.floor(Math.random() * items.length));
    const [play, setPlay] = useState(true);
    useEffect(() => {
      if (!play || U.reduceMotion()) return;
      const id = setInterval(() => setI(x => (x + 1) % items.length), 7000);
      return () => clearInterval(id);
    }, [play, items.length]);
    const it = items[i % items.length];
    return html`<div class="insight" onMouseEnter=${() => setPlay(false)} onMouseLeave=${() => setPlay(true)}>
      <div class="shell insight-in">
        <span class="insight-ico"><${U.Icon} name=${it.icon} size=${15} /></span>
        <p class="insight-txt" key=${i} aria-live="polite"><b>${it.author || it.title}</b>${it.text}${it.source ? html`<span style=${{ color: "var(--ink-4)", marginLeft: "8px" }}>· ${it.source}</span>` : ""}</p>
        <div class="insight-nav">
          <button onClick=${() => setI((i - 1 + items.length) % items.length)} aria-label=${I.t('common.prev')}><${U.Icon} name='chevL' size=${15} /></button>
          <button onClick=${() => setPlay(!play)} aria-pressed=${!play}
            aria-label=${play ? I.t('common.pause') : I.t('common.play')}><${U.Icon} name=${play ? 'pause' : 'arrowR'} size=${15} /></button>
          <button onClick=${() => setI((i + 1) % items.length)} aria-label=${I.t('common.next')}><${U.Icon} name='chevR' size=${15} /></button>
        </div>
      </div>
    </div>`;
  }

  Object.assign(PM_UI, { Term, RichText, plain, Stat, StatBox, InsightBar, suitName, signOf, toneByThreshold });
})();

/* Hook de media query: permite replantear el layout en móvil, no solo encogerlo. */
(function () {
  'use strict';
  const { useState, useEffect } = React;
  PM_UI.useMedia = function useMedia(query) {
    const [match, setMatch] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
      const mq = window.matchMedia(query);
      const on = e => setMatch(e.matches);
      mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
      setMatch(mq.matches);
      return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
    }, [query]);
    return match;
  };
})();
