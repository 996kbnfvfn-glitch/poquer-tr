/* ============================================================================
   POKERMIND · Pestañas (1/2): Inicio · Historia · Reglas · Habilidades
   Todo el texto llega de PM_I18N; aquí solo hay estructura y comportamiento.
   ========================================================================== */
window.PM_SEC = (function () {
  'use strict';
  const { useState, useEffect, useRef, useMemo } = React;
  const U = PM_UI, E = PM, I = PM_I18N;
  const { html, Reveal, Counter, Modal, Tabs, SectionHead, PlayingCard, Chip, BarRow, Donut, Legend,
          RichText, Stat, StatBox, toast, sound } = U;
  const t = (k, v) => I.t(k, v);
  const L = () => I.L;

  /* ==========================================================================
     1 · INICIO · la mesa reparte una mano real al cargar
     ========================================================================= */
  function KeyCarousel() {
    const items = L().INSIGHTS.slice(0, 4);
    const [i, setI] = useState(0);
    const [play, setPlay] = useState(true);
    useEffect(() => {
      if (!play || U.reduceMotion()) return;
      const id = setInterval(() => setI(x => (x + 1) % items.length), 6000);
      return () => clearInterval(id);
    }, [play, items.length]);
    return html`<div class="panel" onMouseEnter=${() => setPlay(false)} onMouseLeave=${() => setPlay(true)}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '16px' }}>
        <h2 style=${{ fontSize: '1.1rem' }}>${t('hero.keyTitle')}</h2>
        <span class="hint">${t('hero.keySub')}</span>
        <div class="dots" style=${{ marginLeft: 'auto' }}>
          ${items.map((x, k) => html`<button key=${k} aria-current=${k === i} onClick=${() => setI(k)}
            aria-label=${(k + 1) + ' ' + t('common.of') + ' ' + items.length}></button>`)}
        </div>
      </div>
      <div class="keycards">
        <div style=${{ display: 'flex', gap: '16px', transition: 'transform .5s cubic-bezier(.3,.9,.3,1)',
          transform: `translateX(-${i * 100}%)`, width: '100%' }}>
          ${items.map((x, k) => html`<div key=${k} class="keycard" aria-hidden=${k !== i}>
            <div class="quote-block">
              <q>${x.text}</q>
              <span class="quote-who"><b>${x.author}</b>${x.source ? " · " + x.source : ""}</span>
            </div>
          </div>`)}
        </div>
      </div>
    </div>`;
  }

  /* Comparació amb el blackjack: el contraexemple que sosté la hipòtesi. */
  function CompareTable() {
    const C = L().COMPARE;
    if (!C) return null;
    return html`<div class="panel" style=${{ display: 'grid', gap: '14px' }}>
      <div>
        <h2 style=${{ fontSize: '1.1rem', marginBottom: '5px' }}>${C.title}</h2>
        <p class="hint" style=${{ maxWidth: 'var(--read)' }}>${C.lede}</p>
      </div>
      <div class="cmp-wrap">
        <table class="cmp">
          <thead><tr><th></th><th class="win">Texas Hold'em</th><th>Blackjack</th></tr></thead>
          <tbody>
            ${C.rows.map(r => html`<tr key=${r.k}>
              <td class="k">${r.k}</td>
              <td class=${r.good === 'poker' ? 'good' : ''}>${r.poker}</td>
              <td>${r.bj}</td>
            </tr>`)}
          </tbody>
        </table>
      </div>
      <p class="hint">${C.note}</p>
    </div>`;
  }

  function Inicio({ go }) {
    const [deal, setDeal] = useState(0);
    const mano = useMemo(() => ['As', 'Ks'].map(E.parseCard), []);
    const board = useMemo(() => ['Qs', '7h', 'Ts', '2d', 'Js'].map(E.parseCard), []);
    useEffect(() => {
      const ts = [setTimeout(() => setDeal(1), 240), setTimeout(() => setDeal(2), 950), setTimeout(() => setDeal(3), 1650)];
      return () => ts.forEach(clearTimeout);
    }, []);
    const sparks = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
      left: (i * 7 + (i % 3) * 4) % 96 + 2, size: 2 + (i % 3), dur: 7 + (i % 5) * 1.6, delay: -(i * 1.3) })), []);
    const nums = [525, 1326, 2598960];
    const stats = t('hero.stats');

    return html`<section class="sec hero" id="inicio" style=${{ paddingTop: 'clamp(30px,5vw,56px)' }}>
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-arc"></div>
        ${sparks.map((s, i) => html`<span key=${i} class="spark" style=${{ left: s.left + '%', bottom: '12%',
          width: s.size + 'px', height: s.size + 'px', animationDuration: s.dur + 's', animationDelay: s.delay + 's' }}></span>`)}
      </div>
      <div class="shell" style=${{ position: 'relative', display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
        <div class="hero-grid">
          <div style=${{ display: 'grid', gap: '24px' }}>
            <${Reveal}><span class="pill pill--gold">${t('hero.pill')}</span><//>
            <${Reveal} delay=${60}><h1 class="hero-h">${t('hero.title1')}<br /><em>${t('hero.title2')}</em></h1><//>
            <${Reveal} delay=${120}><p class="lede" style=${{ maxWidth: '48ch' }}>${t('hero.lede')}</p><//>
            <${Reveal} delay=${180}>
              <div style=${{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button class="btn btn-gold" onClick=${() => { sound.play('chip'); go('historia'); }}>
                  ${t('hero.cta1')} <${U.Icon} name='arrowR' size=${15} /></button>
                <button class="btn btn-ghost" onClick=${() => go('probabilidad')}>${t('hero.cta2')}</button>
              </div>
            <//>
            <${Reveal} delay=${240} className="hero-stats">
              ${stats.map((s, i) => html`<div key=${i} class="hero-stat">
                <div class="stat-n"><${Counter} to=${nums[i]} /></div>
                <div style=${{ fontSize: '.82rem', color: 'var(--ink-2)', marginTop: '4px' }}>${s.label}</div>
                <div class="hint" style=${{ fontSize: '.72rem' }}>${s.note}</div>
              </div>`)}
            <//>
          </div>

          <div class="hero-table" role="img" aria-label=${t('hero.tableAria')}>
            <div class="felt-oval" aria-hidden="true"></div>
            <div style=${{ position: 'relative', display: 'grid', gap: '20px', justifyItems: 'center', padding: '34px 10px' }}>
              <div class="card-row" style=${{ justifyContent: 'center', minHeight: '86px' }}>
                ${deal >= 2 && board.slice(0, deal >= 3 ? 5 : 3).map((c, i) =>
                  html`<${PlayingCard} key=${c} card=${c} width=${deal >= 3 ? 54 : 62} dealIndex=${i} />`)}
              </div>
              <div style=${{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                ${[1, 5, 25].map((v, i) => html`<${Chip} key=${v} value=${v} size=${38}
                   color=${['var(--ink-4)', 'var(--bad)', 'var(--felt-2)'][i]} />`)}
              </div>
              <div class="card-row" style=${{ justifyContent: 'center', minHeight: '90px' }}>
                ${deal >= 1 ? mano.map((c, i) => html`<${PlayingCard} key=${c} card=${c} width=${66} dealIndex=${i} />`)
                            : [0, 1].map(i => html`<${PlayingCard} key=${i} faceDown=${true} width=${66} />`)}
              </div>
              ${deal >= 3 && html`<span class="pill pill--neon pill--live" style=${{ position: 'absolute', bottom: '-6px', right: 0 }}>
                ${L().HAND_NAMES.royal}</span>`}
            </div>
          </div>
        </div>
        <${Reveal}><${U.CitaHero} id="F05" go=${go} /><//>
        <${Reveal}><${KeyCarousel} /><//>
        <${Reveal} delay=${80}><${CompareTable} /><//>
        <${Reveal}>
          <p class="cita-lead">${t('ent.lead')}</p>
          <${U.Cita} id="F01" />
        <//>
      </div>
    </section>`;
  }

  /* ==========================================================================
     2 · HISTORIA
     ========================================================================= */
  function LiveYears() {
    const [y, setY] = useState(0);
    useEffect(() => {
      const base = new Date('1500-01-01T00:00:00Z').getTime();
      const tick = () => setY((Date.now() - base) / 31557600000);
      tick();
      const id = setInterval(tick, 80);
      return () => clearInterval(id);
    }, []);
    return html`<div class="tile" style=${{ display: 'flex', gap: '14px', alignItems: 'baseline', flexWrap: 'wrap' }}>
      <span class="mono" style=${{ fontSize: 'clamp(1.3rem,3.4vw,1.9rem)', color: 'var(--gold)' }}>${I.num(y, 6)}</span>
      <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${t('historia.live')}</span>
    </div>`;
  }

  function TimelineItem({ item, open, onToggle }) {
    const body = useRef(null);
    const [h, setH] = useState(0);
    useEffect(() => { setH(open && body.current ? body.current.scrollHeight : 0); }, [open, item]);
    return html`<${Reveal} className=${'tl-item ' + (open ? 'is-open' : '')}>
      <span class="tl-dot" aria-hidden="true"></span>
      <button class="tl-btn" onClick=${() => { onToggle(); sound.play('card'); }} aria-expanded=${open}>
        <span class="tl-year mono">${item.year}</span>
        <span style=${{ display: 'grid', gap: '5px', flex: 1 }}>
          <span style=${{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' }}>
            <span style=${{ color: "var(--gold)" }}><${U.Icon} name=${item.icon} size=${18} /></span>
            <strong style=${{ fontFamily: 'var(--f-display)', fontSize: '1.06rem' }}>${item.title}</strong>
            <span class="pill">${item.era}</span>
          </span>
          <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${item.summary}</span>
        </span>
        <span aria-hidden="true" style=${{ color: 'var(--gold)', transition: 'transform .3s',
          transform: open ? "rotate(45deg)" : "none" }}><${U.Icon} name="plus" size=${16} /></span>
      </button>
      <div class="tl-body" style=${{ height: h + 'px' }} aria-hidden=${!open}>
        <div class="tl-body-in" ref=${body}>
          ${item.detail.map((p, i) => html`<p key=${i} style=${{ color: 'var(--ink-2)', maxWidth: 'var(--read)' }}>
            <${RichText} text=${p} /></p>`)}
          <div class="tile" style=${{ borderLeft: '3px solid var(--gold)' }}>
            <span class="eyebrow" style=${{ marginBottom: '6px' }}>${t('historia.gave')}</span>
            <span style=${{ color: 'var(--ink)' }}>${item.legacy}</span>
          </div>
        </div>
      </div>
    <//>`;
  }

  function Historia() {
    const [open, setOpen] = useState('1900s');
    return html`<section class="sec sec--felt" id="historia">
      <div class="shell" style=${{ position: 'relative' }}>
        <${SectionHead} n="02" eyebrow=${t('historia.eyebrow')} title=${t('historia.title')} lede=${t('historia.lede')} />
        <div style=${{ display: 'grid', gap: '22px' }}>
          <${Reveal}><${LiveYears} /><//>
          <div class="tl">
            ${L().HISTORY.map(it => html`<${TimelineItem} key=${it.year} item=${it}
              open=${open === it.year} onToggle=${() => setOpen(open === it.year ? null : it.year)} />`)}
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ==========================================================================
     3 · CÓMO SE JUEGA
     ========================================================================= */
  function TableSeats() {
    const [sel, setSel] = useState('BTN');
    const P = L().POSITIONS;
    const p = P.find(x => x.k === sel);
    const seats = P.map((pos, i) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      return { ...pos, x: 50 + Math.cos(a) * 39, y: 50 + Math.sin(a) * 33 };
    });
    return html`<div class="grid" style=${{ gridTemplateColumns: 'minmax(0,1fr)', gap: '18px' }}>
      <div style=${{ position: 'relative', aspectRatio: '16/9', minHeight: '230px' }}>
        <div class="felt-oval" style=${{ inset: '8% 4%' }} aria-hidden="true"></div>
        ${seats.map(s => html`<button key=${s.k} onClick=${() => { setSel(s.k); sound.play('chip'); }}
          aria-pressed=${sel === s.k} title=${s.name}
          style=${{ position: 'absolute', left: s.x + '%', top: s.y + '%', transform: 'translate(-50%,-50%)',
            background: sel === s.k ? 'linear-gradient(135deg,var(--gold-soft),var(--gold))' : 'var(--surface)',
            color: sel === s.k ? '#0A0E27' : 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: '999px',
            padding: '7px 13px', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: '.76rem',
            fontWeight: sel === s.k ? 700 : 400, boxShadow: sel === s.k ? 'var(--e-gold)' : 'var(--e1)', zIndex: 2 }}>${s.k}</button>`)}
        <div style=${{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: '5px' }} aria-hidden="true">
          ${['Qs', '7h', 'Ts'].map(c => html`<${PlayingCard} key=${c} card=${E.parseCard(c)} width=${34} />`)}
        </div>
      </div>
      <div class="tile" style=${{ display: 'grid', gap: '10px' }}>
        <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <strong style=${{ fontFamily: 'var(--f-display)', fontSize: '1.05rem' }}>${p.name}</strong>
          <span class="pill pill--gold">${t('reglas.opens', { pct: I.pct(p.open, 0) })}</span>
        </div>
        <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${p.text}</p>
      </div>
    </div>`;
  }

  function VariantSim({ v }) {
    const [step, setStep] = useState(0);
    const [deck, setDeck] = useState(() => E.shuffle(E.fullDeck()));
    const [showRank, setShowRank] = useState(false);
    useEffect(() => { setStep(0); setDeck(E.shuffle(E.fullDeck())); }, [v.id]);

    const hero = deck.slice(0, v.hole);
    const vill = deck.slice(v.hole, v.hole * 2);
    const boardCount = v.steps.slice(0, step + 1).reduce((n, s) => n + (typeof s.deal === 'number' ? s.deal : 0), 0);
    const board = deck.slice(v.hole * 2, v.hole * 2 + boardCount);
    const isStud = v.board === 0;
    const studExtra = isStud ? Math.max(0, step) : 0;
    const heroFull = isStud ? deck.slice(0, v.hole + studExtra) : hero;
    const made = v.id === 'nlhe' && board.length >= 3 ? E.describe(E.evaluate7([...hero.slice(0, 2), ...board])) : null;
    const cur = v.steps[step];

    const next = () => {
      if (step >= v.steps.length - 1) { setStep(0); setDeck(E.shuffle(E.fullDeck())); sound.play('shuffle'); return; }
      setStep(step + 1); sound.play('card');
    };

    return html`<div class="grid" style=${{ gap: '20px' }}>
      <div class="panel" style=${{ display: 'grid', gap: '20px' }}>
        <div style=${{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style=${{ flex: '1 1 260px', display: 'grid', gap: '6px' }}>
            <div style=${{ display: 'flex', gap: '9px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style=${{ fontSize: '1.2rem' }}>${v.name}</h2><span class="pill">${v.tag}</span>
            </div>
            <p style=${{ color: 'var(--ink-2)', fontSize: '1rem', maxWidth: '54ch' }}><${RichText} text=${v.blurb} /></p>
          </div>
          <div class="tile" style=${{ flex: '1 1 230px' }}>
            <span class="eyebrow" style=${{ marginBottom: '6px' }}>${t('reglas.rule')}</span>
            <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${v.use}</span>
          </div>
        </div>

        <div style=${{ background: 'linear-gradient(180deg,var(--felt-deep),var(--felt))', border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)', padding: 'clamp(16px,3vw,26px)', display: 'grid', gap: '18px', justifyItems: 'center' }}>
          <div style=${{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span class="pill" style=${{ background: 'rgba(0,0,0,.25)' }}>${t('reglas.rival')}</span>
            ${(isStud ? deck.slice(20, 20 + v.hole + studExtra) : vill).map((c, i) =>
              html`<${PlayingCard} key=${'v' + c} card=${c} width=${40} faceDown=${isStud ? i < 2 : true} />`)}
          </div>
          <div class="card-row" style=${{ justifyContent: 'center', minHeight: '74px' }}>
            ${isStud ? html`<span class="hint">${t('reglas.noBoard')}</span>`
              : (board.length ? board.map((c, i) => html`<${PlayingCard} key=${'b' + c} card=${c} width=${52} dealIndex=${i} />`)
                              : [0, 1, 2].map(i => html`<${PlayingCard} key=${i} empty=${true} width=${52} />`))}
          </div>
          <div style=${{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span class="pill pill--gold" style=${{ background: 'rgba(0,0,0,.25)' }}>${t('reglas.you')}</span>
            ${heroFull.map((c, i) => html`<${PlayingCard} key=${'h' + c} card=${c} width=${46} dealIndex=${i} />`)}
          </div>
          ${made && html`<span class="pill pill--neon">${t('reglas.handNow', { hand: made })}</span>`}
        </div>

        <div style=${{ display: 'grid', gap: '14px' }}>
          <div style=${{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            ${v.steps.map((s, i) => html`<button key=${s.k} onClick=${() => setStep(i)} class="pill" aria-current=${i === step}
              style=${{ cursor: 'pointer', borderColor: i <= step ? 'var(--gold)' : 'var(--line)',
                color: i === step ? 'var(--gold)' : i < step ? 'var(--ink-2)' : 'var(--ink-4)' }}>${s.name}</button>`)}
          </div>
          <div class="tile" style=${{ minHeight: '78px' }}>
            <div style=${{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
              <strong style=${{ fontFamily: 'var(--f-display)' }}>${cur.name}</strong>
              <span class="hint mono">${step + 1}/${v.steps.length}</span>
            </div>
            <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}><${RichText} text=${cur.text} /></p>
          </div>
          <div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button class="btn btn-gold btn-sm" onClick=${next}>
              ${step >= v.steps.length - 1 ? t('reglas.again') : t('reglas.next', { name: v.steps[step + 1].name })}</button>
            <button class="btn btn-ghost btn-sm" onClick=${() => setShowRank(true)}>${t('reglas.ranking')}</button>
          </div>
          <div style=${{ display: 'grid', gap: '7px' }}>
            ${v.tips.map((x, i) => html`<div key=${i} style=${{ display: 'flex', gap: '9px', fontSize: '1rem', color: 'var(--ink-2)' }}>
              <span style=${{ color: 'var(--gold)' }} aria-hidden="true">▸</span><span><${RichText} text=${x} /></span></div>`)}
          </div>
        </div>
      </div>

      <${Modal} open=${showRank} onClose=${() => setShowRank(false)} wide=${true}
        title=${t('reglas.rankingTitle')} sub=${t('reglas.rankingSub')}>
        <div style=${{ display: 'grid', gap: '8px' }}>
          ${L().RANKINGS.map(r => html`<div key=${r.n} class="tile" style=${{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span class="mono" style=${{ color: 'var(--gold)', width: '22px' }}>${r.n}</span>
            <div style=${{ flex: '1 1 150px' }}>
              <div style=${{ fontFamily: 'var(--f-display)', fontWeight: 600 }}>${r.name}</div>
              <div class="hint">${r.desc}</div>
            </div>
            <div class="card-row" style=${{ gap: '3px' }}>
              ${r.cards.split(' ').map(c => html`<${PlayingCard} key=${c} card=${E.parseCard(c)} width=${30} />`)}
            </div>
            <span class="hint mono" style=${{ minWidth: '116px', textAlign: 'right' }}>${r.odds}</span>
          </div>`)}
        </div>
      <//>
    </div>`;
  }

  function Reglas() {
    const [tab, setTab] = useState('nlhe');
    const v = L().VARIANTS.find(x => x.id === tab) || L().VARIANTS[0];
    return html`<section class="sec" id="reglas">
      <div class="shell">
        <${SectionHead} n="03" eyebrow=${t('reglas.eyebrow')} title=${t('reglas.title')} lede=${t('reglas.lede')} />
        <div style=${{ display: 'grid', gap: '22px' }}>
          <${Reveal}>
            <${Tabs} items=${L().VARIANTS.map(x => ({ id: x.id, name: x.name }))} value=${tab} onChange=${setTab} label="Variants" />
          <//>
          <${Reveal} key=${tab}><${VariantSim} v=${v} /><//>
          <${Reveal} className="panel">
            <div style=${{ display: 'grid', gap: '18px' }}>
              <div>
                <span class="eyebrow" style=${{ marginBottom: '8px' }}>${t('reglas.tableEyebrow')}</span>
                <h2 style=${{ fontSize: '1.15rem', marginBottom: '6px' }}>${t('reglas.tableTitle')}</h2>
                <p style=${{ color: 'var(--ink-2)', fontSize: '1rem', maxWidth: 'var(--read)' }}>${t('reglas.tableLede')}</p>
              </div>
              <${TableSeats} />
              <hr class="divider" />
              <div>
                <span class="eyebrow" style=${{ marginBottom: '10px' }}>${t('reglas.actions')}</span>
                <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '10px' }}>
                  ${L().ACTIONS.map(a => html`<div key=${a.k} class="tile">
                    <div style=${{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                      <strong style=${{ fontFamily: 'var(--f-display)' }}>${a.k}</strong><span class="hint">${a.es}</span>
                    </div>
                    <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${a.text}</p>
                  </div>`)}
                </div>
              </div>
            </div>
          <//>
        </div>
      </div>
    </section>`;
  }

  /* ==========================================================================
     4 · HABILIDADES
     ========================================================================= */
  function Habilidades() {
    const SK = L().SKILLS;
    const [prog, setProg] = useState(() => {
      /* Progrés: emmagatzematge opcional, filtrat per PM_CONSENT. */
      return PM_CONSENT.store.get('pm-skills', null) || Object.fromEntries(SK.map(s => [s.id, s.base]));
    });
    const [sel, setSel] = useState(null);
    const [just, setJust] = useState(null);
    useEffect(() => { PM_CONSENT.store.set('pm-skills', prog); }, [prog]);

    const levels = t('habilidades.levels');
    const advance = id => {
      const v = Math.min(100, (prog[id] || 0) + 25);
      setProg({ ...prog, [id]: v });
      if (v === 100) { setJust(id); sound.play('ding'); toast(t('habilidades.toastDone', { name: SK.find(s => s.id === id).name }), 'ok'); setTimeout(() => setJust(null), 700); }
      else sound.play('chip');
    };
    const total = Math.round(Object.values(prog).reduce((a, b) => a + b, 0) / SK.length);
    const s = sel && SK.find(x => x.id === sel);

    return html`<section class="sec" id="habilidades">
      <div class="shell">
        <${SectionHead} n="05" eyebrow=${t('habilidades.eyebrow')} title=${t('habilidades.title')} lede=${t('habilidades.lede')} />
        <div style=${{ display: 'grid', gap: '20px' }}>
          <${Reveal} className="panel panel--quiet">
            <div style=${{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style=${{ flex: '1 1 240px' }}>
                <div style=${{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span class="eyebrow">${t('habilidades.progress')}</span>
                  <${Stat} value=${total} display=${total + '%'} tone=${total >= 60 ? 'pos' : total >= 25 ? 'warn' : 'neutral'} arrow=${false} />
                </div>
                <div class="bar-track"><div class="bar-fill" style=${{ width: total + '%',
                  background: 'linear-gradient(90deg,var(--gold),var(--neon))' }}></div></div>
              </div>
              <button class="btn btn-ghost btn-sm" onClick=${() => { setProg(Object.fromEntries(SK.map(x => [x.id, 0]))); toast(t('habilidades.toastReset')); }}>
                ${t('habilidades.reset')}</button>
            </div>
          <//>
          <div class="tree">
            ${SK.map((sk, i) => html`<${Reveal} key=${sk.id} delay=${i * 55}>
              <div class=${'node ' + (prog[sk.id] >= 100 ? 'done ' : '') + (just === sk.id ? 'unlocked' : '')}
                   role="button" tabIndex="0" onClick=${() => setSel(sk.id)}
                   onKeyDown=${e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(sk.id))}
                   aria-label=${t('habilidades.open', { name: sk.name })}>
                <div style=${{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span class="node-ico"><${U.Icon} name=${sk.icon} size=${20} /></span>
                  <div><div style=${{ fontFamily: 'var(--f-display)', fontWeight: 600 }}>${sk.name}</div>
                    <div class="hint">${levels[sk.lvl - 1]}</div></div>
                </div>
                <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}><${RichText} text=${sk.short} /></p>
                <div>
                  <div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', marginBottom: '5px' }}>
                    <span class="hint">${t('habilidades.difficulty')} ${'●'.repeat(sk.lvl)}${'○'.repeat(4 - sk.lvl)}</span>
                    <span class="mono" style=${{ color: prog[sk.id] >= 100 ? 'var(--good)' : 'var(--ink-2)' }}>${prog[sk.id] || 0}%</span>
                  </div>
                  <div class="bar-track" style=${{ height: '6px' }}>
                    <div class="bar-fill" style=${{ width: (prog[sk.id] || 0) + '%',
                      background: prog[sk.id] >= 100 ? 'var(--good)' : 'var(--gold)' }}></div>
                  </div>
                </div>
              </div>
            <//>`)}
          </div>
        </div>
      </div>

      <${Modal} open=${!!sel} onClose=${() => setSel(null)} title=${s ? s.name : ''}
        sub=${s ? t('habilidades.level', { level: levels[s.lvl - 1] }) : ''}>
        ${s && html`<${React.Fragment}>
          <p style=${{ color: 'var(--ink-2)' }}><${RichText} text=${s.body} /></p>
          ${({ gto: 'F10', bankroll: 'F03' })[s.id] &&
            html`<${U.Cita} id=${({ gto: 'F10', bankroll: 'F03' })[s.id]} compacta=${true} />`}
          <div class="tile">
            <span class="eyebrow" style=${{ marginBottom: '10px' }}>${t('habilidades.exercises')}</span>
            <div style=${{ display: 'grid', gap: '9px' }}>
              ${s.drills.map((d, i) => html`<div key=${i} style=${{ display: 'flex', gap: '10px', fontSize: '1rem' }}>
                <span class="mono" style=${{ color: 'var(--gold)' }}>${i + 1}</span>
                <span style=${{ color: 'var(--ink-2)' }}><${RichText} text=${d} /></span></div>`)}
            </div>
          </div>
          <div class="tile" style=${{ borderLeft: '3px solid var(--bad)' }}>
            <span class="eyebrow" style=${{ color: 'var(--bad)', marginBottom: '6px' }}>${t('habilidades.mistake')}</span>
            <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${s.pitfall}</span>
          </div>
          <div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button class="btn btn-gold btn-sm" onClick=${() => advance(s.id)} disabled=${prog[s.id] >= 100}>
              ${prog[s.id] >= 100 ? t('habilidades.done') : t('habilidades.mark')}</button>
            <button class="btn btn-ghost btn-sm" onClick=${() => setSel(null)}>${t('common.close')}</button>
          </div>
        <//>`}
      <//>
    </section>`;
  }

  return { Inicio, Historia, Reglas, Habilidades };
})();
