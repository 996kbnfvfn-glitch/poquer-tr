/* ============================================================================
   POKERMIND · Componentes compartidos
   React sin build step: htm da plantillas tipo JSX con template literals.
   ========================================================================== */
window.PM_UI = (function () {
  'use strict';
  const { useState, useEffect, useRef, useCallback, useMemo } = React;
  const html = htm.bind(React.createElement);
  const E = PM;

  /* --- Observador único para todos los reveal/counters --------------------- */
  const observers = new Map();
  function observe(el, cb, opts) {
    const key = JSON.stringify(opts || {});
    if (!observers.has(key)) {
      observers.set(key, new IntersectionObserver(entries => {
        entries.forEach(en => { const fn = en.target.__pmcb; fn && fn(en.isIntersecting, en); });
      }, opts));
    }
    el.__pmcb = cb;
    observers.get(key).observe(el);
    return () => { observers.get(key).unobserve(el); delete el.__pmcb; };
  }

  /* Hook: ¿el elemento ha entrado en pantalla al menos una vez? */
  function useInView(opts) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
      if (!ref.current || seen) return;
      return observe(ref.current, vis => { if (vis) setSeen(true); }, opts || { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    }, [seen]);
    return [ref, seen];
  }

  /* Aparición al hacer scroll. Parte de un estado visible: si JS falla o el
     usuario pide menos movimiento, el contenido se lee igualmente. */
  function Reveal({ children, delay = 0, as = 'div', className = '', ...rest }) {
    const [ref, seen] = useInView();
    return html`<${as} ref=${ref} class=${'reveal ' + (seen ? 'in ' : '') + className}
      style=${{ transitionDelay: seen ? delay + 'ms' : '0ms' }} ...${rest}>${children}<//>`;
  }

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Contador que sube al entrar en pantalla. */
  function Counter({ to, dur = 1800, decimals = 0, prefix = '', suffix = '', className = '' }) {
    const [ref, seen] = useInView({ threshold: 0.4 });
    const [v, setV] = useState(0);
    useEffect(() => {
      if (!seen) return;
      if (reduceMotion()) { setV(to); return; }
      let raf, t0;
      const tick = t => {
        t0 = t0 || t;
        const p = Math.min(1, (t - t0) / dur);
        setV(to * (1 - Math.pow(1 - p, 3)));            // easeOutCubic
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [seen, to, dur]);
    const txt = v.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return html`<span ref=${ref} class=${'mono ' + className}>${prefix}${txt}${suffix}</span>`;
  }

  /* --- Sonido sintetizado (sin archivos externos) -------------------------- */
  const sound = (() => {
    let ctx = null, on = false;
    const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
    function noise(dur, freq, q, gain) {
      const c = ac(), n = c.sampleRate * dur, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(c.destination); src.start();
    }
    function tone(freq, dur, gain, type) {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
    }
    return {
      get enabled() { return on; },
      toggle(v) { on = v == null ? !on : v; if (on) { try { ac().resume(); } catch (e) {} this.play('chip'); } return on; },
      play(kind) {
        if (!on) return;
        try {
          if (kind === 'chip')    noise(0.09, 2600, 1.6, 0.16);
          if (kind === 'shuffle') noise(0.42, 1500, 0.7, 0.11);
          if (kind === 'card')    noise(0.14, 3400, 1.1, 0.09);
          if (kind === 'ding')    { tone(880, 0.16, 0.09); setTimeout(() => tone(1320, 0.22, 0.07), 90); }
          if (kind === 'err')     tone(180, 0.22, 0.08, 'triangle');
        } catch (e) { /* el navegador puede bloquear audio: silencio y seguimos */ }
      }
    };
  })();

  /* --- Avisos (toasts) ----------------------------------------------------- */
  let toastSeq = 0; const toastSubs = new Set(); let toastList = [];
  function toast(msg, kind) {
    const t = { id: ++toastSeq, msg, kind: kind || '' };
    toastList = [...toastList, t]; toastSubs.forEach(f => f(toastList));
    setTimeout(() => { toastList = toastList.filter(x => x.id !== t.id); toastSubs.forEach(f => f(toastList)); }, 4200);
    sound.play(kind === 'err' ? 'err' : 'ding');
  }
  function ToastHost() {
    const [list, setList] = useState(toastList);
    useEffect(() => { toastSubs.add(setList); return () => toastSubs.delete(setList); }, []);
    return html`<div class="toast-wrap" role="status" aria-live="polite">
      ${list.map(t => html`<div key=${t.id} class=${'toast ' + t.kind}>
        <${PM_UI.Icon} name=${t.kind === 'err' ? 'close' : t.kind === 'ok' ? 'check' : 'help'} size=${15} />
        <span>${t.msg}</span></div>`)}
    </div>`;
  }

  /* --- Carta ---------------------------------------------------------------- */
  function PlayingCard({ card, faceDown, width = 62, empty, label, dealIndex, onClick, selected }) {
    const r = card != null ? E.R_CHAR[E.rankOf(card)] : '';
    const s = card != null ? E.SUITS[E.suitOf(card)] : '';
    const red = card != null && E.isRed(card);
    const style = { '--cw': width + 'px', animationDelay: dealIndex != null ? dealIndex * 90 + 'ms' : undefined };
    const cls = ['pcard', faceDown ? 'is-down' : '', empty ? 'is-empty' : '', dealIndex != null ? 'pcard-deal' : '',
                 selected ? 'ring' : ''].join(' ');
    const aria = empty ? (label || '+') : faceDown ? '?'
               : E.R_CHAR[E.rankOf(card)] + ' ' + PM_UI.suitName(s);
    const inner = html`<div class="pcard-in">
        <div class=${'pcard-face' + (red ? ' red' : '')}>
          ${empty ? html`<span class="big" aria-hidden="true" style=${{ opacity: .5, fontSize: '1rem' }}>${label || '+'}</span>`
           : html`<${React.Fragment}>
              <span class="r">${r}<small style=${{ fontSize: '.7em', display: 'block' }}>${E.SUIT_GLYPH[s]}</small></span>
              <span class="big" aria-hidden="true">${E.SUIT_GLYPH[s]}</span>
              <span class="s">${r}</span><//>`}
        </div>
        <div class="pcard-back"></div>
      </div>`;
    if (onClick) return html`<button type="button" class=${'pcard-btn ' + cls} style=${style} onClick=${onClick}
        aria-label=${aria} aria-pressed=${!!selected}>${inner}</button>`;
    return html`<div class=${cls} style=${style} role="img" aria-label=${aria}>${inner}</div>`;
  }

  const Chip = ({ value, color = 'var(--gold)', size = 46 }) =>
    html`<div class="chip" style=${{ '--c': color, '--size': size + 'px' }} aria-hidden="true"><span>${value}</span></div>`;

  /* --- Modal accesible ------------------------------------------------------ */
  function Modal({ open, onClose, title, sub, children, wide }) {
    const box = useRef(null);
    useEffect(() => {
      if (!open) return;
      const prev = document.activeElement;
      const onKey = e => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && box.current) {                      // retención de foco
          const f = box.current.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      setTimeout(() => box.current && box.current.querySelector('button')?.focus(), 40);
      return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev && prev.focus && prev.focus(); };
    }, [open, onClose]);
    if (!open) return null;
    return html`<div class="modal-bg" onMouseDown=${e => e.target === e.currentTarget && onClose()}>
      <div class="modal" ref=${box} role="dialog" aria-modal="true" aria-label=${title}
           style=${wide ? { width: 'min(100%,860px)' } : null}>
        <div class="modal-head">
          <div style=${{ display: 'grid', gap: '4px' }}>
            <h3 style=${{ fontSize: '1.25rem' }}>${title}</h3>
            ${sub && html`<div class="hint">${sub}</div>`}
          </div>
          <button class="icon-btn no-print" style=${{ marginLeft: 'auto' }} onClick=${onClose} aria-label=${PM_I18N.t('common.close')}>✕</button>
        </div>
        <div class="modal-body">${children}</div>
      </div>
    </div>`;
  }

  /* --- Pestañas ------------------------------------------------------------- */
  function Tabs({ items, value, onChange, label }) {
    const onKey = e => {
      const i = items.findIndex(x => x.id === value);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        onChange(items[n].id);
      }
    };
    return html`<div class="tabs" role="tablist" aria-label=${label} onKeyDown=${onKey}>
      ${items.map(it => html`<button key=${it.id} role="tab" type="button"
         aria-selected=${value === it.id} tabIndex=${value === it.id ? 0 : -1}
         onClick=${() => { onChange(it.id); sound.play('chip'); }}>${it.name}</button>`)}
    </div>`;
  }

  const Tip = ({ text, children }) => html`<span class="tip" tabIndex="0">
      ${children}<span class="tip-pop" role="tooltip">${text}</span></span>`;

  const SectionHead = ({ n, eyebrow, title, lede, children }) => html`<${Reveal} className="sec-head">
      <div class="eyebrow"><span>${n}</span>${eyebrow}</div>
      <h1 class="sec-title">${title}</h1>
      ${lede && html`<p class="lede">${lede}</p>`}
      ${children}
    <//>`;

  /* --- Piezas de gráfico ---------------------------------------------------- */
  /* Barra horizontal etiquetada: una escala, valor visible, color por rol. */
  function BarRow({ label, value, max = 1, color = 'var(--s1)', display, note }) {
    const [ref, seen] = useInView({ threshold: 0.3 });
    const w = seen ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return html`<div ref=${ref} style=${{ display: 'grid', gap: '6px' }}>
      <div style=${{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '1rem' }}>
        <span style=${{ color: 'var(--ink-2)' }}>${label}</span>
        <span class="mono" style=${{ color: 'var(--ink)' }}>${display != null ? display : E.pct(value)}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style=${{ width: w + '%', background: color }}></div></div>
      ${note && html`<div class="hint">${note}</div>`}
    </div>`;
  }

  /* Donut de 2-3 segmentos (reparto de un mismo total). */
  function Donut({ segments, size = 190, thickness = 26, center }) {
    const r = (size - thickness) / 2, C = 2 * Math.PI * r;
    let acc = 0;
    return html`<div style=${{ position: 'relative', width: size + 'px', height: size + 'px', flex: 'none' }}>
      <svg width=${size} height=${size} viewBox=${`0 0 ${size} ${size}`} role="img"
           aria-label=${segments.map(s => `${s.label}: ${E.pct(s.value)}`).join(', ')}>
        <circle cx=${size/2} cy=${size/2} r=${r} fill="none" stroke="var(--surface-overlay)" stroke-width=${thickness}/>
        ${segments.map((s, i) => {
          const len = s.value * C, off = acc * C; acc += s.value;
          return html`<circle key=${i} cx=${size/2} cy=${size/2} r=${r} fill="none" stroke=${s.color}
            stroke-width=${thickness} stroke-dasharray=${`${len} ${C - len}`} stroke-dashoffset=${-off}
            transform=${`rotate(-90 ${size/2} ${size/2})`} style=${{ transition: 'stroke-dasharray .6s ease, stroke-dashoffset .6s ease' }}/>`;
        })}
      </svg>
      <div style=${{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>${center}</div>
    </div>`;
  }

  const Legend = ({ items }) => html`<div class="legend">
    ${items.map((it, i) => html`<span key=${i}><i style=${{ background: it.color }}></i>${it.label}</span>`)}</div>`;

  const Spinner = () => html`<span class="spin" aria-hidden="true" style=${{ display: 'inline-block', width: '13px', height: '13px',
    border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></span>`;

  return { html, useInView, Reveal, Counter, Modal, Tabs, Tip, SectionHead, PlayingCard, Chip,
           BarRow, Donut, Legend, Spinner, ToastHost, toast, sound, reduceMotion, observe };
})();
