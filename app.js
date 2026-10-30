/* ============================================================================
   POKERMIND · Shell de la aplicación
   Navegación por pestañas, idiomas, tema, sonido, atajos y montaje.
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useCallback } = React;
  const U = PM_UI, I = PM_I18N, S = PM_SEC, X = PM_EXTRA;
  const { html, Modal, InsightBar, toast, sound } = U;
  const t = (k, v) => I.t(k, v);

  const VIEWS = { inicio: S.Inicio, historia: S.Historia, reglas: S.Reglas, simulador: S.Simulador, habilidades: S.Habilidades,
                  mental: S.Mental, psicologia: S.Psicologia, probabilidad: S.Probabilidad,
                  recursos: S.Recursos, casos: S.Casos, entrevista: S.Entrevista, vocabulario: S.Vocabulario };
  const IDS = PM_CORE.TABS;
  /* L'adreça pot portar un segon darrere la pestanya: #entrevista/480.
     La pestanya és sempre el tros anterior a la barra; qui llegeix el segon és
     la pàgina de l'entrevista. */
  const fromHash = () => {
    const h = (location.hash || '').replace('#', '').split('/')[0];
    return IDS.includes(h) ? h : 'inicio';
  };

  /* --- Cabecera: marca, herramientas y tira de pestañas --------------------- */
  function Header({ tab, setTab, visited, theme, setTheme, snd, setSnd, onHelp, lang, setLang, progress, stuck,
                    onSearch, onMenu }) {
    const bar = useRef(null);
    /* La pestaña activa se mantiene a la vista en pantallas estrechas. */
    useEffect(() => {
      const el = bar.current && bar.current.querySelector('[aria-selected="true"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: U.reduceMotion() ? 'auto' : 'smooth' });
    }, [tab]);

    return html`<header class=${'head' + (stuck ? ' is-stuck' : '')}>
      <div class="shell nav-in">
        <a class="brand" href="#inicio" onClick=${e => { e.preventDefault(); setTab('inicio'); }}>
          <span class="pip" aria-hidden="true">♠</span>PokerMind
        </a>
        <div class="nav-tools" style=${{ marginLeft: 'auto' }}>
          <button class="nav-search" type="button" onClick=${onSearch} aria-label=${t('search.open')}>
            <${U.Icon} name="search" size=${16} />
            <span class="nav-search-t">${t('search.open')}</span>
            <kbd class="nav-search-k">${/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <div class="lang nav-collapse" role="group" aria-label=${t('nav.lang')}>
            ${I.CODES.map(c => html`<button key=${c} onClick=${() => setLang(c)} aria-pressed=${lang === c}
              title=${I.NAMES[c]}>${c.toUpperCase()}</button>`)}
          </div>
          <button class="icon-btn" onClick=${() => { setTheme(theme === 'dark' ? 'light' : 'dark'); sound.play('chip'); }}
            aria-label=${theme === 'dark' ? t('nav.toLight') : t('nav.toDark')}><${U.Icon} name=${theme === 'dark' ? 'sun' : 'moon'} size=${17} /></button>
          <button class="icon-btn nav-collapse" onClick=${() => setSnd(sound.toggle())} aria-pressed=${snd}
            aria-label=${snd ? t('nav.soundOff') : t('nav.soundOn')}><${U.Icon} name=${snd ? 'sound' : 'mute'} size=${17} /></button>
          <button class="icon-btn optional" onClick=${() => {
              const url = location.href;
              if (navigator.share) navigator.share({ title: 'PokerMind', url }).catch(() => {});
              else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast(t('nav.copied'), 'ok'), () => toast(t('nav.copyFail'), 'err'));
            }} aria-label=${t('nav.share')}><${U.Icon} name='share' size=${16} /></button>
          <button class="icon-btn nav-collapse" onClick=${onHelp} aria-label=${t("nav.shortcuts")}><${U.Icon} name="help" size=${17} /></button>
          <button class="icon-btn nav-menu" onClick=${onMenu} aria-label=${t('menu.open')} aria-haspopup="dialog">
            <${U.Icon} name="menu" size=${18} /></button>
        </div>
      </div>
      <div class="shell" style=${{ position: 'relative' }}>
        <div class="tabbar" role="tablist" aria-label="PokerMind" ref=${bar}>
          ${I.L.TABS.map((x, i) => html`<button key=${x.id} role="tab" id=${'tab-' + x.id}
            aria-selected=${tab === x.id} aria-controls=${'panel-' + x.id} tabIndex=${tab === x.id ? 0 : -1}
            class=${visited.has(x.id) && tab !== x.id ? 'visited' : ''}
            onClick=${() => setTab(x.id)}>
            <span class="tnum">${String(i + 1).padStart(2, '0')}</span>${x.label}<span class="tdot" aria-hidden="true"></span>
          </button>`)}
        </div>
        <div class="progress-bar" style=${{ width: (progress * 100) + '%' }} aria-hidden="true"></div>
      </div>
      <${InsightBar} />
    </header>`;
  }

  /* --- Límite de errores ---------------------------------------------------- */
  class Boundary extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(err) { return { err }; }
    render() {
      if (!this.state.err) return this.props.children;
      return html`<div class="shell" style=${{ padding: '80px 0' }}>
        <div class="panel" style=${{ display: 'grid', gap: '14px', maxWidth: '60ch' }}>
          <h2 style=${{ fontSize: '1.4rem' }}>${t('error.title')}</h2>
          <p style=${{ color: 'var(--ink-2)' }}>${t('error.text')}</p>
          <code class="mono" style=${{ fontSize: '.8rem', color: 'var(--ink-3)' }}>${String(this.state.err)}</code>
          <button class="btn btn-gold btn-sm" style=${{ justifySelf: 'start' }} onClick=${() => location.reload()}>${t('error.reload')}</button>
        </div>
      </div>`;
    }
  }

  /* --- Aplicación ------------------------------------------------------------ */
  function App() {
    const [tab, setTabState] = useState(fromHash);
    const [visited, setVisited] = useState(() => new Set([fromHash()]));
    const [lang, setLangState] = useState(I.code);
    const [theme, setThemeState] = useState(() => { try { return localStorage.getItem('pm-theme') || 'dark'; } catch (e) { return 'dark'; } });
    const [snd, setSnd] = useState(false);
    const [help, setHelp] = useState(false);
    const [search, setSearch] = useState(false);
    const [menu, setMenu] = useState(false);
    /* Cada increment torna a obrir l'avís d'emmagatzematge a la segona capa. */
    const [privacy, setPrivacy] = useState(0);
    const [progress, setProgress] = useState(0);
    const [stuck, setStuck] = useState(false);
    const main = useRef(null);

    const setTab = useCallback(id => {
      if (!VIEWS[id]) return;
      setTabState(prev => {
        if (prev === id) return prev;
        history.replaceState(null, '', '#' + id);
        setVisited(v => new Set(v).add(id));
        window.scrollTo({ top: 0, behavior: U.reduceMotion() ? 'auto' : 'smooth' });
        sound.play('card');
        setTimeout(() => main.current && main.current.focus({ preventScroll: true }), 60);
        return id;
      });
    }, []);

    const setTheme = tm => {
      setThemeState(tm);
      document.documentElement.setAttribute('data-theme', tm);
      try { localStorage.setItem('pm-theme', tm); } catch (e) {}
    };
    const setLang = c => { I.setLocale(c); setLangState(c); };

    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('lang', I.code);
      if (window.PMBOOT) window.PMBOOT.done();          /* la capa d'arrencada es retira aquí */
      const id = setTimeout(() => document.documentElement.classList.add('reveal-on'), 120);
      const onHash = () => setTabState(fromHash());
      window.addEventListener('hashchange', onHash);
      return () => { clearTimeout(id); window.removeEventListener('hashchange', onHash); };
    }, []);

    /* Progreso de lectura de la pestaña actual */
    useEffect(() => {
      let raf = null;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const h = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(h > 40 ? Math.min(1, window.scrollY / h) : 0);
          setStuck(window.scrollY > 8);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }, [tab]);

    /* Atajos de teclado */
    useEffect(() => {
      const onKey = e => {
        const el = e.target;
        const tag = (el.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
        /* El cercador s'obre també des d'un camp de text: és la drecera estàndard. */
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault(); setSearch(true); return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (typing) return;
        if (e.key === '/') { e.preventDefault(); setSearch(true); return; }
        const i = IDS.indexOf(tab);
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9) { setTab(IDS[n - 1]); return; }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(el.closest && el.closest('[role="tablist"]'))) {
          setTab(IDS[(i + (e.key === 'ArrowRight' ? 1 : -1) + IDS.length) % IDS.length]); return;
        }
        if (e.key === 't' || e.key === 'T') setTheme(theme === 'dark' ? 'light' : 'dark');
        if (e.key === 's' || e.key === 'S') setSnd(sound.toggle());
        if (e.key === 'l' || e.key === 'L') setLang(I.CODES[(I.CODES.indexOf(I.code) + 1) % I.CODES.length]);
        if (e.key === '?') setHelp(true);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [tab, theme, setTab]);

    const View = VIEWS[tab] || S.Inicio;
    return html`<${Boundary}>
      <${Header} tab=${tab} setTab=${setTab} visited=${visited} theme=${theme} setTheme=${setTheme}
        snd=${snd} setSnd=${setSnd} onHelp=${() => setHelp(true)} lang=${lang} setLang=${setLang}
        progress=${progress} stuck=${stuck}
        onSearch=${() => setSearch(true)} onMenu=${() => setMenu(true)} />
      <main id=${'panel-' + tab} role="tabpanel" aria-labelledby=${'tab-' + tab} tabIndex="-1" ref=${main}
            style=${{ outline: 'none' }}>
        <div class="tabview" key=${tab + lang}><${View} go=${setTab} /></div>
      </main>
      <${S.Footer} go=${setTab} onPrivacy=${() => setPrivacy(p => p + 1)} />
      <${U.ToastHost} />
      <${X.SearchPalette} open=${search} onClose=${() => setSearch(false)} go=${setTab} />
      <${X.NavDrawer} open=${menu} onClose=${() => setMenu(false)} tab=${tab} setTab=${setTab}
        visited=${visited} theme=${theme} setTheme=${setTheme} snd=${snd} setSnd=${setSnd}
        lang=${lang} setLang=${setLang} onSearch=${() => setSearch(true)}
        onHelp=${() => setHelp(true)} onPrivacy=${() => setPrivacy(p => p + 1)} />
      <${X.ConsentNotice} force=${privacy} />
      <${Modal} open=${help} onClose=${() => setHelp(false)} title=${t('shortcuts.title')} sub=${t('shortcuts.sub')}>
        <div style=${{ display: 'grid', gap: '8px' }}>
          ${t('shortcuts.keys').map(([k, v]) => html`<div key=${k} style=${{ display: 'flex', gap: '16px', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <kbd class="mono" style=${{ background: 'var(--surface-overlay)', border: '1px solid var(--line)', borderRadius: '6px',
              padding: '4px 9px', fontSize: '.8rem', minWidth: '64px', textAlign: 'center' }}>${k}</kbd>
            <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${v}</span>
          </div>`)}
        </div>
      <//>
    <//>`;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
})();
