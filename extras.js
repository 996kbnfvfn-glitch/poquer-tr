/* ============================================================================
   POKERMIND · Millores additives
   ----------------------------------------------------------------------------
   Quatre peces noves que no alteren cap secció existent:
     1. Índex i paleta de cerca de tot el lloc (⌘K / Ctrl+K o la icona).
     2. Calaix de navegació per a mòbil (totes les seccions + preferències).
     3. Avís d'emmagatzematge, connectat de debò a PM_CONSENT.
     4. Peces de càrrega (barra determinada i repartiment de cartes).
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useMemo, useCallback } = React;
  const U = PM_UI, I = PM_I18N, CN = PM_CONSENT;
  const { html, sound, toast } = U;
  const t = (k, v) => I.t(k, v);

  /* --- Normalització per cercar sense accents ni majúscules ---------------- */
  /* Nota: el rang de diacrítics s'escriu amb escapades \u per no dependre de
     com es desa el fitxer en disc. */
  const norm = s => String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\[\[([a-z0-9]+)(?:\|([^\]]+))?\]\]/gi, (m, id, lb) => lb || id);

  const clean = s => U.plain(String(s == null ? '' : s));

  /* ========================================================================
     1. ÍNDEX DE CERCA
     Es reconstrueix quan canvia l'idioma. Cada entrada apunta a una pestanya.
     ====================================================================== */
  const ORDER = ['tab', 'term', 'hand', 'skill', 'case', 'history', 'variant',
                 'position', 'action', 'mental', 'tell', 'bias', 'archetype', 'sheet', 'quiz'];

  function buildIndex(L) {
    const out = [];
    const add = (type, tab, title, sub, kw) => {
      if (!title) return;
      out.push({
        i: out.length, type, tab,
        title: clean(title), sub: clean(sub || ''),
        hay: norm(title) + ' ' + norm(sub || '') + ' ' + norm(kw || '')
      });
    };
    const arr = k => (Array.isArray(L[k]) ? L[k] : []);

    (L.TABS || []).forEach(x => add('tab', x.id, x.label, t('search.groups.tab')));

    /* Els dos jocs viuen dins de la mateixa pestanya, aixi que no surten a TABS:
       sense aixo, cercar "blackjack" no donava cap resultat. */
    const bj = (L.UI || {}).bj;
    if (bj) {
      add('tab', 'simulador', bj.pokerName, bj.pokerDesc, bj.pickTitle + ' ' + (bj.pickSub || ''));
      add('tab', 'simulador', bj.bjName, bj.bjDesc, bj.pickTitle + ' ' + (bj.pickSub || '') + ' 21');
    }
    if (L.COMPARE) add('variant', 'inicio', L.COMPARE.title, L.COMPARE.lede,
      (L.COMPARE.rows || []).map(r => r.k + ' ' + r.poker + ' ' + r.bj).join(' ') + ' ' + (L.COMPARE.note || ''));

    arr('GLOSSARY').forEach(g => add('term', 'vocabulario', g.term, g.short, g.id + ' ' + (g.def || '') + ' ' + (g.ex || '')));
    arr('RANKINGS').forEach(r => add('hand', 'reglas', r.name, r.desc, r.cards + ' ' + r.odds));
    arr('SKILLS').forEach(s => add('skill', 'habilidades', s.name, s.short, s.body));
    arr('CASES').forEach(c => add('case', 'casos', c.name, c.title, (c.pillar || '') + ' ' + (c.fact || '') + ' ' + (c.when || '')));
    arr('HISTORY').forEach(h => add('history', 'historia', h.title, (h.year || '') + ' · ' + (h.era || ''), h.summary + ' ' + [].concat(h.detail || []).join(' ')));
    arr('VARIANTS').forEach(v => add('variant', 'reglas', v.name, v.tag, (v.use || '') + ' ' + (v.blurb || '')));
    arr('POSITIONS').forEach(p => add('position', 'reglas', p.name, p.k, p.text));
    arr('ACTIONS').forEach(a => add('action', 'reglas', a.es || a.k, a.k, a.text));
    arr('MENTAL').forEach(m => add('mental', 'mental', m.name, m.claim, [].concat(m.tips || []).join(' ')));
    arr('TELLS').forEach(x => add('tell', 'psicologia', x.scene, t('search.groups.tell'), (x.q || '') + ' ' + [].concat(x.options || []).join(' ')));
    arr('BIASES').forEach(b => add('bias', 'psicologia', b.name, b.def, b.example));
    Object.keys(L.ARCHETYPES || {}).forEach(k => {
      const a = L.ARCHETYPES[k];
      add('archetype', 'psicologia', a.name, a.sub, (a.profile || '') + ' ' + [].concat(a.counter || []).join(' '));
    });
    arr('SHEETS').forEach(s => add('sheet', 'recursos', s.name, s.desc));
    arr('QUIZ').forEach(q => add('quiz', 'recursos', q.q, t('search.groups.quiz'), [].concat(q.a || []).join(' ') + ' ' + (q.why || '')));

    return out;
  }

  /* Puntuació: el títol pesa molt més que el cos, i començar per la paraula
     pesa més que contenir-la. Totes les paraules de la consulta han d'aparèixer. */
  function rank(list, q) {
    const words = norm(q).split(/\s+/).filter(w => w.length > 0);
    if (!words.length) return [];
    const res = [];
    for (const it of list) {
      const nt = norm(it.title);
      let score = 0, all = true;
      for (const w of words) {
        const ti = nt.indexOf(w);
        if (ti === 0) score += 60;
        else if (ti > 0 && /\s/.test(nt[ti - 1] || '')) score += 44;
        else if (ti > 0) score += 26;
        else if (it.hay.indexOf(w) !== -1) score += 8;
        else { all = false; break; }
      }
      if (!all) continue;
      if (nt === norm(q)) score += 80;
      score -= ORDER.indexOf(it.type);                 /* desempat estable per tipus */
      res.push({ it, score });
    }
    res.sort((a, b) => b.score - a.score || a.it.i - b.it.i);
    return res.slice(0, 40).map(r => r.it);
  }

  /* Ressalta els trossos que coincideixen, sense tocar el text original. */
  function Highlight({ text, q }) {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return text;
    const nt = norm(text);
    const marks = [];
    for (const w of words) {
      let from = 0, at;
      while ((at = nt.indexOf(w, from)) !== -1) { marks.push([at, at + w.length]); from = at + w.length; }
    }
    if (!marks.length) return text;
    marks.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const m of marks) {
      const last = merged[merged.length - 1];
      if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]);
      else merged.push(m.slice());
    }
    const out = []; let cur = 0;
    merged.forEach((m, k) => {
      if (m[0] > cur) out.push(text.slice(cur, m[0]));
      out.push(html`<mark key=${'m' + k}>${text.slice(m[0], m[1])}</mark>`);
      cur = m[1];
    });
    if (cur < text.length) out.push(text.slice(cur));
    return out;
  }

  const TYPE_ICON = {
    tab: 'grid', term: 'book', hand: 'cards', skill: 'target', case: 'trophy', history: 'hourglass',
    variant: 'spade', position: 'target', action: 'swords', mental: 'brain', tell: 'eye',
    bias: 'eyes', archetype: 'statue', sheet: 'doc', quiz: 'help'
  };

  /* ========================================================================
     PALETA DE CERCA
     ====================================================================== */
  function SearchPalette({ open, onClose, go }) {
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(0);
    const input = useRef(null), listRef = useRef(null);
    const index = useMemo(() => (open ? buildIndex(I.L) : []), [open, I.code]);
    const hits = useMemo(() => rank(index, q), [index, q]);

    useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current && input.current.focus(), 30); } }, [open]);
    useEffect(() => setSel(0), [q]);

    /* Bloqueja el desplaçament del fons mentre la paleta és oberta. */
    useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [open]);

    /* Manté l'opció seleccionada a la vista. */
    useEffect(() => {
      const el = listRef.current && listRef.current.querySelector('[data-sel="1"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, [sel, hits.length]);

    const choose = useCallback(it => { onClose(); go(it.tab); sound.play('card'); }, [onClose, go]);

    if (!open) return null;

    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => (hits.length ? (s + 1) % hits.length : 0)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => (hits.length ? (s - 1 + hits.length) % hits.length : 0)); return; }
      if (e.key === 'Enter' && hits[sel]) { e.preventDefault(); choose(hits[sel]); return; }
      if (e.key === 'Tab') e.preventDefault();          /* el focus no surt del quadre */
    };

    /* Agrupa mantenint l'ordre de rellevància dels grups. */
    const groups = [];
    hits.forEach(it => {
      let g = groups.find(x => x.type === it.type);
      if (!g) { g = { type: it.type, items: [] }; groups.push(g); }
      g.items.push(it);
    });

    const G = t('search.groups');
    return html`<div class="pal-bg" onMouseDown=${e => e.target === e.currentTarget && onClose()}>
      <div class="pal" role="dialog" aria-modal="true" aria-label=${t('search.title')} onKeyDown=${onKey}>
        <div class="pal-head">
          <span class="pal-ico" aria-hidden="true"><${U.Icon} name="search" size=${18} /></span>
          <input ref=${input} class="pal-input" type="search" role="combobox" aria-expanded="true"
            aria-controls="pal-list" aria-autocomplete="list" autoComplete="off" spellCheck="false"
            aria-label=${t('search.title')} placeholder=${t('search.placeholder')}
            value=${q} onInput=${e => setQ(e.target.value)} />
          ${q && html`<button class="pal-clear" type="button" onClick=${() => { setQ(''); input.current && input.current.focus(); }}
            aria-label=${t('common.close')}><${U.Icon} name="close" size=${15} /></button>`}
          <kbd class="pal-esc mono">esc</kbd>
        </div>

        <div class="pal-body" id="pal-list" role="listbox" ref=${listRef}
             aria-label=${t('search.title')}>
          ${!q && html`<p class="pal-idle">${t('search.idle')}</p>`}
          ${q && !hits.length && html`<div class="pal-idle">
            <strong style=${{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>${t('search.empty', { q: clean(q) })}</strong>
            ${t('search.emptyHint')}</div>`}
          ${groups.map(g => html`<div key=${g.type} class="pal-group">
            <div class="pal-glabel">${G[g.type] || g.type}</div>
            ${g.items.map(it => {
              const i = hits.indexOf(it), on = i === sel;
              return html`<button key=${it.i} type="button" role="option" aria-selected=${on}
                data-sel=${on ? '1' : '0'} class=${'pal-hit' + (on ? ' is-sel' : '')}
                onMouseMove=${() => setSel(i)} onClick=${() => choose(it)}>
                <span class="pal-hico" aria-hidden="true"><${U.Icon} name=${TYPE_ICON[it.type] || 'doc'} size=${16} /></span>
                <span class="pal-htxt">
                  <span class="pal-htitle"><${Highlight} text=${it.title} q=${q} /></span>
                  ${it.sub && html`<span class="pal-hsub"><${Highlight} text=${it.sub} q=${q} /></span>`}
                </span>
                <span class="pal-harrow" aria-hidden="true"><${U.Icon} name="arrowR" size=${15} /></span>
              </button>`;
            })}
          </div>`)}
        </div>

        <div class="pal-foot">
          <span><kbd class="mono">↑</kbd><kbd class="mono">↓</kbd> ${t('search.navigate')}</span>
          <span><kbd class="mono">↵</kbd> ${t('search.select')}</span>
          <span><kbd class="mono">esc</kbd> ${t('search.close')}</span>
          <span class="pal-count mono" aria-live="polite">
            ${q ? (hits.length === 1 ? t('search.count1') : t('search.count', { n: hits.length })) : ''}</span>
        </div>
      </div>
    </div>`;
  }

  /* ========================================================================
     2. CALAIX DE NAVEGACIÓ (MÒBIL)
     Llista totes les seccions i replega les preferències que a la barra
     superior queden amagades en pantalles estretes.
     ====================================================================== */
  function NavDrawer({ open, onClose, tab, setTab, visited, theme, setTheme, snd, setSnd,
                       lang, setLang, onSearch, onHelp, onPrivacy }) {
    const box = useRef(null);

    useEffect(() => {
      if (!open) return;
      const prevFocus = document.activeElement;
      const prevOv = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = e => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'Tab' && box.current) {
          const f = box.current.querySelectorAll('button:not([disabled]),a[href]');
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener('keydown', onKey);
      setTimeout(() => box.current && box.current.querySelector('button') && box.current.querySelector('button').focus(), 40);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOv;
        prevFocus && prevFocus.focus && prevFocus.focus();
      };
    }, [open, onClose]);

    if (!open) return null;
    const jump = id => { onClose(); setTab(id); };

    return html`<div class="dr-bg" onMouseDown=${e => e.target === e.currentTarget && onClose()}>
      <nav class="dr" ref=${box} role="dialog" aria-modal="true" aria-label=${t('menu.title')}>
        <div class="dr-head">
          <span class="brand"><span class="pip" aria-hidden="true">♠</span>PokerMind</span>
          <button class="icon-btn" onClick=${onClose} aria-label=${t('menu.close')}>
            <${U.Icon} name="close" size=${17} /></button>
        </div>

        <div class="dr-scroll">
          <button class="dr-search" type="button" onClick=${() => { onClose(); onSearch(); }}>
            <${U.Icon} name="search" size=${16} /><span>${t('menu.search')}</span>
          </button>

          <div class="dr-label" id="dr-secs">${t('menu.sections')}</div>
          <ul class="dr-list" aria-labelledby="dr-secs">
            ${I.L.TABS.map((x, i) => html`<li key=${x.id}>
              <button type="button" class=${'dr-item' + (tab === x.id ? ' is-on' : '')}
                aria-current=${tab === x.id ? 'page' : undefined} onClick=${() => jump(x.id)}>
                <span class="dr-n mono">${String(i + 1).padStart(2, '0')}</span>
                <span class="dr-t">${x.label}</span>
                ${visited && visited.has(x.id) && tab !== x.id
                  ? html`<span class="dr-dot" aria-hidden="true"></span>` : null}
              </button></li>`)}
          </ul>

          <div class="dr-label" id="dr-tools">${t('menu.tools')}</div>
          <div class="dr-rows" aria-labelledby="dr-tools">
            <div class="dr-row">
              <span class="dr-rl">${t('menu.lang')}</span>
              <div class="lang" role="group" aria-label=${t('nav.lang')}>
                ${I.CODES.map(c => html`<button key=${c} type="button" onClick=${() => setLang(c)}
                  aria-pressed=${lang === c} title=${I.NAMES[c]}>${c.toUpperCase()}</button>`)}
              </div>
            </div>
            <div class="dr-row">
              <span class="dr-rl">${t('menu.theme')}</span>
              <button class="dr-toggle" type="button" onClick=${() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <${U.Icon} name=${theme === 'dark' ? 'moon' : 'sun'} size=${15} />
                ${theme === 'dark' ? t('menu.themeDark') : t('menu.themeLight')}</button>
            </div>
            <div class="dr-row">
              <span class="dr-rl">${t('menu.sound')}</span>
              <button class="dr-toggle" type="button" onClick=${() => setSnd(sound.toggle())} aria-pressed=${snd}>
                <${U.Icon} name=${snd ? 'sound' : 'mute'} size=${15} />
                ${snd ? t('menu.soundOn') : t('menu.soundOff')}</button>
            </div>
          </div>

          <div class="dr-foot">
            <button type="button" onClick=${() => { onClose(); onHelp(); }}>
              <${U.Icon} name="help" size=${15} />${t('menu.shortcuts')}</button>
            <button type="button" onClick=${() => { onClose(); onPrivacy(); }}>
              <${U.Icon} name="shield" size=${15} />${t('menu.privacy')}</button>
          </div>
        </div>
      </nav>
    </div>`;
  }

  /* ========================================================================
     3. AVÍS D'EMMAGATZEMATGE
     Primera capa amb les dues opcions al mateix nivell visual (accep­tar i
     rebutjar tenen el mateix pes, com demana la guia de l'AEPD) i segona capa
     amb el detall per categories. Connectat a PM_CONSENT: rebutjar esborra.
     ====================================================================== */
  function ConsentNotice({ force, onSettled }) {
    const [shown, setShown] = useState(() => !CN.decided());
    const [panel, setPanel] = useState(false);
    const [optIn, setOptIn] = useState(() => CN.prefs);
    const box = useRef(null);

    /* El peu de pàgina i el menú poden tornar a obrir l'avís. */
    useEffect(() => {
      if (!force) return;
      setOptIn(CN.prefs); setPanel(true); setShown(true);
    }, [force]);

    useEffect(() => {
      if (!shown) return;
      const onKey = e => { if (e.key === 'Escape' && panel) setPanel(false); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [shown, panel]);

    const settle = (prefs, msg) => {
      CN.save(prefs);
      setShown(false); setPanel(false);
      onSettled && onSettled();
      toast(msg, prefs ? 'ok' : '');
    };

    if (!shown) return null;

    const KEYS = { ess: ['pm-lang', 'pm-theme', 'pm-consent'], opt: CN.OPTIONAL };

    return html`<div class=${'ck' + (panel ? ' is-panel' : '')} role="dialog" aria-modal=${panel ? 'true' : 'false'}
      aria-labelledby="ck-title" ref=${box}>
      <div class="ck-in">
        <div class="ck-top">
          <span class="ck-ico" aria-hidden="true"><${U.Icon} name="shield" size=${18} /></span>
          <div class="ck-txt">
            <h2 class="ck-title" id="ck-title">${t('consent.title')}</h2>
            <p class="ck-lede">${t('consent.lede')}</p>
            <p class="ck-body">${t('consent.body')}</p>
          </div>
        </div>

        ${panel && html`<div class="ck-cats">
          <div class="ck-cat">
            <div class="ck-crow">
              <strong>${t('consent.catEss')}</strong>
              <span class="ck-always">${t('consent.always')}</span>
            </div>
            <p>${t('consent.catEssDesc')}</p>
            <div class="ck-keys mono">${KEYS.ess.join(' · ')}</div>
          </div>
          <div class="ck-cat">
            <div class="ck-crow">
              <strong>${t('consent.catOpt')}</strong>
              <button type="button" class=${'ck-sw' + (optIn ? ' is-on' : '')} role="switch"
                aria-checked=${optIn} onClick=${() => setOptIn(v => !v)}>
                <span class="ck-swt" aria-hidden="true"></span>
                <span class="ck-swl">${optIn ? t('consent.on') : t('consent.off')}</span>
              </button>
            </div>
            <p>${t('consent.catOptDesc')}</p>
            <div class="ck-keys mono">${KEYS.opt.join(' · ')}</div>
          </div>
          <p class="ck-third"><${U.Icon} name="broadcast" size=${14} /><span>${t('consent.third')}</span></p>
        </div>`}

        <div class="ck-acts">
          ${panel
            ? html`<button class="btn btn-gold btn-sm" type="button"
                onClick=${() => settle(optIn, optIn ? t('consent.okAll') : t('consent.okNone'))}>${t('consent.save')}</button>`
            : html`<${React.Fragment}>
                <button class="ck-btn" type="button" onClick=${() => settle(false, t('consent.okNone'))}>${t('consent.reject')}</button>
                <button class="ck-btn" type="button" onClick=${() => settle(true, t('consent.okAll'))}>${t('consent.accept')}</button>
              <//>`}
          <button class="ck-link" type="button" onClick=${() => setPanel(p => !p)} aria-expanded=${panel}>
            ${t('consent.config')}</button>
          <a class="ck-link" href=${(window.PM_LEGAL_BASE || 'legal/') + 'cookies.html'}
            target="_blank" rel="noopener">${t('consent.policy')}</a>
        </div>
        ${!panel && html`<p class="ck-note">${t('consent.change')}</p>`}
      </div>
    </div>`;
  }

  /* ========================================================================
     4. PECES DE CÀRREGA
     ====================================================================== */
  /* Barra de progrés: determinada si arriba `value` (0–1), indeterminada si no. */
  function LoadBar({ value, label }) {
    const det = typeof value === 'number' && isFinite(value);
    return html`<div class="lbar" role="progressbar" aria-label=${label || t('common.loading')}
      aria-valuemin="0" aria-valuemax="100" aria-valuenow=${det ? Math.round(value * 100) : undefined}>
      <div class=${'lbar-fill' + (det ? '' : ' is-indet')}
           style=${det ? { width: Math.max(2, Math.min(100, value * 100)) + '%' } : null}></div>
    </div>`;
  }

  /* Tres cartes que es reparteixen en bucle. Per a esperes curtes dins la pàgina. */
  function DealLoader({ label, size = 26 }) {
    return html`<span class="dealer" role="status" aria-live="polite">
      <span class="dealer-cards" aria-hidden="true" style=${{ '--dh': size + 'px' }}>
        <i></i><i></i><i></i>
      </span>
      ${label && html`<span class="dealer-l">${label}</span>`}
    </span>`;
  }

  window.PM_EXTRA = { SearchPalette, NavDrawer, ConsentNotice, buildIndex, rank, norm };
  Object.assign(PM_UI, { LoadBar, DealLoader });
})();
