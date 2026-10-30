/* ============================================================================
   POKERMIND · Simulador de Texas Hold'em (interfaz)
   El estado del juego vive en un objeto mutable (holdem.js); esta capa lo
   dibuja y provoca los pasos. Así no hay clonados profundos por acción.
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useReducer, useMemo, useCallback } = React;
  const U = PM_UI, E = PM, I = PM_I18N, G = PM_GAME;
  const { html, Modal, SectionHead, PlayingCard, Stat, StatBox, Reveal, toast, sound, DealLoader } = U;
  const t = (k, v) => I.t(k, v);

  /* Les estadístiques són emmagatzematge opcional: passen per PM_CONSENT, que
     no escriu res si la persona no ho ha acceptat a l'avís de privacitat. */
  const STORE = 'pm-sim-stats';
  const blank = () => ({ hands: 0, won: 0, showdowns: 0, showdownsWon: 0, vpip: 0, biggest: 0, netChips: 0 });
  const loadStats = () => PM_CONSENT.store.get(STORE, blank()) || blank();
  const saveStats = s => PM_CONSENT.store.set(STORE, s);

  /* Nombres de los rivales: neutros y reconocibles en los tres idiomas. */
  const BOTS = ['Nora', 'Dimitri', 'Sofia', 'Kenji', 'Mireia', 'Lars', 'Amara'];

  /* --- Asiento -------------------------------------------------------------- */
  function Seat({ g, p, pos, isActive, isWinner, reveal, thinking }) {
    const showCards = p.human || reveal;
    const tag = G.positionOf(g, p.id);
    return html`<div class=${'seat' + (p.human ? ' is-hero' : '') + (p.folded ? ' is-folded' : '') + (isActive ? ' is-active' : '') + (isWinner ? ' is-winner' : '')}
      style=${pos ? { left: pos.x + "%", top: pos.y + "%" } : null}>
      ${p.bet > 0 && html`<div class="seat-bet"><i aria-hidden="true"></i>${I.num(p.bet)}</div>`}
      <div class="seat-cards">
        ${p.cards.length ? p.cards.map((c, i) => html`<${PlayingCard} key=${'c' + i + c} card=${c}
            faceDown=${!showCards} width=${p.human ? 56 : 36} dealIndex=${i} />`)
          : [0, 1].map(i => html`<${PlayingCard} key=${i} empty=${true} width=${p.human ? 56 : 36} />`)}
      </div>
      <div class="seat-box">
        <div style=${{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span class="seat-name">${p.human && p.name !== t('sim.table.you') ? p.name + ' · ' + t('sim.table.you') : p.name}</span>
          ${p.id === g.button && html`<span class="dealer-btn" style=${{ marginLeft: "auto" }} title="Dealer">D</span>`}
        </div>
        <div style=${{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <span class="seat-stack">${p.allIn ? t('sim.table.allin') : I.num(p.stack)}</span>
          <span class="seat-tag" style=${{ marginLeft: 'auto', color: tag === 'BTN' ? 'var(--gold)' : 'var(--ink-3)' }}>${tag}</span>
        </div>
      </div>
      ${thinking ? html`<span class="seat-act"><span class="thinking"><i></i><i></i><i></i></span> ${t('sim.table.thinking')}</span>`
        : p.lastAction && html`<span class=${'seat-act a-' + p.lastAction}>${t('sim.logT.' + p.lastAction)}</span>`}
    </div>`;
  }

  /* --- Mesa ----------------------------------------------------------------- */
  function Table({ g, thinkingId, reveal }) {
    const live = g.players;
    const n = live.length;
    const narrow = U.useMedia("(max-width: 768px)");
    const seats = live.map((p, i) => {
      const a = (90 + (i * 360) / n) * Math.PI / 180;
      return { p, x: E.clamp(50 + Math.cos(a) * 39, 14, 86), y: E.clamp(50 + Math.sin(a) * 27, 16, 67) };
    });
    const winners = (g.result && g.result.winners.map(w => w.id)) || [];
    return html`<div class=${"tablewrap" + (narrow ? " is-stack" : "")}>
      <div class="tcenter">
        <span class="street-tag">${t('sim.table.street.' + (g.street || 'preflop'))}${g.phase === 'done' ? ' · ' + t('sim.table.showdown') : ''}</span>
        <div class="card-row" style=${{ justifyContent: 'center', minHeight: '78px' }}>
          ${g.board.length ? g.board.map((c, i) => html`<${PlayingCard} key=${'b' + c} card=${c} width=${60} dealIndex=${i} />`)
            : [0, 1, 2].map(i => html`<${PlayingCard} key=${i} empty=${true} width=${60} />`)}
        </div>
        <div class="pot">
          <span class="pot-label">${t('sim.table.pot')}</span>
          <span class="pot-value">${I.num(G.potTotal(g))}</span>
        </div>
      </div>
      ${(narrow ? seats.slice(1).concat(seats.slice(0, 1)) : seats).map(s => html`<${Seat} key=${s.p.id} g=${g} p=${s.p} pos=${narrow ? null : s} reveal=${reveal}
        isActive=${g.toAct === s.p.id && g.phase === 'betting'} isWinner=${winners.includes(s.p.id)}
        thinking=${thinkingId === s.p.id} />`)}
    </div>`;
  }

  /* --- Panel de acciones ----------------------------------------------------- */
  function ActionBar({ g, onAct }) {
    const lg = G.legal(g);
    const [mode, setMode] = useState(null);          /* null | 'bet' | 'raise' */
    const [amt, setAmt] = useState(0);
    useEffect(() => { setMode(null); }, [g.toAct, g.street, g.hand]);
    if (!lg) return null;
    const pot = G.potTotal(g);
    const open = () => {
      const m = lg.canCheck ? 'bet' : 'raise';
      setMode(m);
      setAmt(E.clamp(Math.round((pot * 0.66 + lg.callAmount) / g.bb) * g.bb, lg.minTo, lg.maxTo));
    };
    const quick = frac => setAmt(E.clamp(Math.round((pot * frac + lg.callAmount) / g.bb) * g.bb, lg.minTo, lg.maxTo));

    /* Cabecera común: de quién es el turno y cuánto cuesta seguir. */
    const head = html`<div class="actbar-head">
      <span class="actbar-turn">${t('sim.table.yourTurn')}</span>
      <span class="pill">${t('sim.table.street.' + g.street)}</span>
      ${lg.callAmount > 0
        ? html`<span class="tocall">${t('sim.table.toCall')} <b>${I.num(lg.callAmount)}</b></span>`
        : html`<span class="tocall">${t('sim.table.pot')} <b>${I.num(pot)}</b></span>`}
    </div>`;

    if (mode) {
      return html`<div class="actbar">
        ${head}
        <div class="sizerow">
          <span class="field-label" style=${{ marginBottom: 0 }}>${t('sim.act.amount')}</span>
          <input class="amount-in" type="number" value=${amt} min=${lg.minTo} max=${lg.maxTo} step=${g.bb}
            onInput=${e => setAmt(E.clamp(+e.target.value || lg.minTo, lg.minTo, lg.maxTo))} aria-label=${t('sim.act.amount')} />
          <button class="sizebtn" onClick=${() => setAmt(lg.minTo)}>${t('sim.act.min')}</button>
          <button class="sizebtn" onClick=${() => quick(0.5)}>${t('sim.act.half')}</button>
          <button class="sizebtn" onClick=${() => quick(0.75)}>${t('sim.act.threeq')}</button>
          <button class="sizebtn" onClick=${() => quick(1)}>${t('sim.act.pot')}</button>
          <button class="sizebtn" onClick=${() => setAmt(lg.maxTo)}>${t('sim.act.max')}</button>
        </div>
        <input type="range" min=${lg.minTo} max=${lg.maxTo} step=${g.bb} value=${amt}
          aria-label=${t('sim.act.amount')} onInput=${e => setAmt(+e.target.value)} />
        <div class="actrow" style=${{ gridTemplateColumns: '1fr 2fr' }}>
          <button class="actbtn" onClick=${() => setMode(null)}>${t('sim.act.back')}</button>
          <button class="actbtn b-raise" onClick=${() => { onAct(amt >= lg.maxTo ? 'allin' : mode, amt); setMode(null); }}>
            ${amt >= lg.maxTo ? t('sim.act.allin', { n: '' }).trim() : mode === 'bet' ? t('sim.act.bet') : t('sim.act.raise')}
            <small>${I.num(amt)}</small></button>
        </div>
      </div>`;
    }

    /* Tres acciones, una por columna, con el importe siempre visible. */
    return html`<div class="actbar">
      ${head}
      <div class="actrow">
        <button class="actbtn b-fold" onClick=${() => onAct('fold')} title=${t('sim.tip.fold')}>
          ${t('sim.act.fold')}</button>
        ${lg.canCheck
          ? html`<button class="actbtn b-check" onClick=${() => onAct('check')} title=${t('sim.tip.check')}>
              ${t('sim.act.check')}</button>`
          : html`<button class="actbtn b-call" disabled=${!lg.canCall} onClick=${() => onAct('call')} title=${t('sim.tip.call')}>
              ${t('sim.act.call', { n: '' }).replace(/\s+$/, '')}<small>${I.num(lg.callAmount)}</small></button>`}
        ${(lg.canBet || lg.canRaise)
          ? html`<button class="actbtn b-raise" onClick=${open} title=${lg.canCheck ? t('sim.tip.bet') : t('sim.tip.raise')}>
              ${lg.canCheck ? t('sim.act.bet') : t('sim.act.raise')}<small>${t('sim.act.min')} ${I.num(lg.minTo)}</small></button>`
          : html`<button class="actbtn b-allin" onClick=${() => onAct('allin')} title=${t('sim.tip.allin')}>
              ALL-IN<small>${I.num(lg.maxTo)}</small></button>`}
      </div>
      <div class="sizerow" style=${{ justifyContent: 'space-between' }}>
        <span class="hint">${t('sim.table.blindsAre', { sb: I.num(g.sb), bb: I.num(g.bb) })} · ${t('sim.table.hand', { n: g.hand })}</span>
        ${(lg.canBet || lg.canRaise) && lg.maxTo > lg.minTo && html`<button class="sizebtn" onClick=${() => onAct('allin')}>
          ALL-IN ${I.num(lg.maxTo)}</button>`}
      </div>
    </div>`;
  }

  /* --- Ayuda didáctica -------------------------------------------------------- */
  function HelpPanel({ g, hero }) {
    const [eq, setEq] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => { setEq(null); }, [g.street, g.hand]);
    const lg = G.legal(g);
    const opponents = Math.max(1, g.players.filter(p => !p.folded && !p.out).length - 1);
    const pot = G.potTotal(g);
    const toCall = lg ? lg.callAmount : 0;
    const need = toCall > 0 ? toCall / (pot + toCall) : 0;

    const compute = () => {
      setBusy(true);
      setTimeout(() => {                       /* fuera del hilo de pintado para que se vea el estado */
        setEq(G.quickEquity(hero.cards, g.board, opponents, 2500));
        setBusy(false); sound.play('chip');
      }, 20);
    };

    /* Rango recomendado desde la posición del jugador */
    const posKey = G.positionOf(g, hero.id);
    const posData = I.L.POSITIONS.find(x => x.k === posKey) || I.L.POSITIONS[1];
    const range = useMemo(() => E.rangeForPct(posData.open), [posData.open]);
    const handKey = useMemo(() => {
      if (hero.cards.length < 2) return null;
      const r1 = E.rankOf(hero.cards[0]), r2 = E.rankOf(hero.cards[1]);
      const hi = Math.max(r1, r2), lo = Math.min(r1, r2);
      const s = E.suitOf(hero.cards[0]) === E.suitOf(hero.cards[1]);
      return hi === lo ? E.R_CHAR[hi] + E.R_CHAR[lo] : E.R_CHAR[hi] + E.R_CHAR[lo] + (s ? 's' : 'o');
    }, [hero.cards.join()]);
    const inR = handKey && range.has(handKey);

    return html`<div class="panel" style=${{ display: 'grid', gap: '14px' }}>
      <h2 style=${{ fontSize: '1.05rem' }}>${t('sim.help.title')}</h2>

      ${toCall > 0 && html`<div class="tile" style=${{ display: 'grid', gap: '7px' }}>
        <span class="eyebrow">${t('sim.help.potOdds')}</span>
        <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>
          ${t('sim.help.potOddsText', { call: I.num(toCall), pot: I.num(pot), need: I.pct(need) })}</span>
      </div>`}

      <div class="tile" style=${{ display: 'grid', gap: '9px' }}>
        <span class="eyebrow">${t('sim.help.equity')}</span>
        ${eq == null
          ? (busy
              ? html`<${DealLoader} label=${t('sim.help.calcing')} size=${22} />`
              : html`<button class="btn btn-ghost btn-sm" onClick=${compute} style=${{ justifySelf: 'start' }}>
                  ${t('sim.help.calc')}</button>`)
          : html`<${React.Fragment}>
              <${Stat} display=${I.pct(eq)} tone=${eq >= Math.max(need, 0.4) ? 'pos' : 'neg'} arrow=${false} />
              <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('sim.help.equityText', { eq: I.pct(eq), n: opponents })}</span>
              ${toCall > 0 && html`<span style=${{ fontSize: '1rem', color: eq >= need ? 'var(--good)' : 'var(--bad)' }}>
                ${eq >= need ? t('sim.help.verdictOk') : t('sim.help.verdictNo')}</span>`}
            <//>`}
      </div>

      ${g.street === 'preflop' && handKey && html`<div class="tile" style=${{ display: 'grid', gap: '7px' }}>
        <span class="eyebrow">${t('sim.help.range', { pos: posKey })}</span>
        <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>
          ${t('sim.help.rangeText', { pct: I.pct(posData.open, 0), hand: handKey, inr: inR ? t('sim.help.inRange') : t('sim.help.outRange') })}</span>
        <span class=${'pill ' + (inR ? 'pill--neon' : '')} style=${{ justifySelf: 'start' }}>${handKey}</span>
      </div>`}
    </div>`;
  }

  /* --- Historial de la mano ---------------------------------------------------- */
  function LogPanel({ g }) {
    const box = useRef(null);
    const lines = g.history.filter(h => h.hand === g.hand);
    useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [lines.length]);
    let street = null;
    return html`<div class="panel" style=${{ display: 'grid', gap: '10px' }}>
      <h2 style=${{ fontSize: '1.05rem' }}>${t('sim.logT.title')}</h2>
      <div class="loglist" ref=${box}>
        ${lines.length === 0 && html`<span class="hint">${t('sim.logT.empty')}</span>`}
        ${lines.map((h, i) => {
          const head = h.street !== street ? (street = h.street) : null;
          const p = g.players[h.playerId];
          return html`<${React.Fragment} key=${i}>
            ${head && html`<div class="logstreet">${t('sim.table.street.' + head)}</div>`}
            <div class="logline">
              <span class="who">${p.human ? t('sim.table.you') : p.name}</span>
              <span class="what">${t('sim.logT.' + h.action)}</span>
              ${h.amount > 0 && html`<span class="amt">${I.num(h.amount)}</span>`}
            </div>
          <//>`;
        })}
      </div>
    </div>`;
  }

  /* --- Resultado y análisis ----------------------------------------------------- */
  function ResultPanel({ g, onNext, onNew, preEq }) {
    const r = g.result;
    if (!r) return null;
    const hero = g.players.find(p => p.human);
    const net = hero ? hero.won - hero.committed : 0;
    const cls = net > 0 ? 'win' : net < 0 ? 'lose' : '';
    const nameOf = id => (g.players[id].human ? t('sim.table.you') : g.players[id].name);
    return html`<div class=${'resultbar ' + cls}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style=${{ fontFamily: 'var(--f-display)', fontSize: '1.1rem' }}>${t('sim.res.title')}</strong>
        <${Stat} value=${net} display=${net > 0 ? t('sim.res.youWon', { amount: I.num(net) })
          : net < 0 ? t('sim.res.youLost', { amount: I.num(Math.abs(net)) }) : t('sim.res.youFlat')} />
        <div style=${{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button class="btn btn-gold btn-sm" onClick=${onNext}>${t('sim.res.next')}</button>
          <button class="btn btn-ghost btn-sm" onClick=${onNew}>${t('sim.res.newGame')}</button>
        </div>
      </div>
      <div style=${{ display: 'grid', gap: '6px' }}>
        ${r.winners.map(w => html`<div key=${w.id} style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>
          ${w.hand != null ? t('sim.res.winsWith', { name: nameOf(w.id), amount: I.num(w.amount), hand: I.handName(w.hand) })
                           : t('sim.res.wins', { name: nameOf(w.id), amount: I.num(w.amount) })}</div>`)}
        ${r.type === 'fold' && html`<span class="hint">${t('sim.res.noShowdown')}</span>`}
      </div>
      ${r.shown.length > 1 && html`<div style=${{ display: 'grid', gap: '2px' }}>
        <span class="eyebrow" style=${{ marginTop: '6px' }}>${t('sim.res.analysis')}</span>
        ${r.shown.sort((a, b) => b.score - a.score).map(s => html`<div key=${s.id} class="showhand">
          <span style=${{ minWidth: '90px', fontWeight: 600 }}>${nameOf(s.id)}</span>
          <div class="card-row" style=${{ gap: '3px' }}>
            ${s.cards.map(c => html`<${PlayingCard} key=${c} card=${c} width=${28} />`)}
          </div>
          <span class="mono" style=${{ marginLeft: 'auto', color: 'var(--ink-2)', fontSize: '1rem' }}>${I.handName(s.score)}</span>
        </div>`)}
      </div>`}
      ${preEq != null && html`<span class="hint">${t('sim.res.eqAt', { street: t('sim.table.street.preflop'), eq: I.pct(preEq) })}</span>`}
    </div>`;
  }

  /* --- Estadísticas ------------------------------------------------------------- */
  function StatsPanel({ stats, onReset }) {
    const wr = stats.hands ? stats.won / stats.hands : 0;
    const sd = stats.showdowns ? stats.showdownsWon / stats.showdowns : 0;
    return html`<div class="panel" style=${{ display: 'grid', gap: '12px' }}>
      <div style=${{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.05rem' }}>${t('sim.stats.title')}</h2>
        <button class="btn btn-ghost btn-sm" style=${{ marginLeft: 'auto' }} onClick=${onReset}>${t('sim.stats.reset')}</button>
      </div>
      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
        <${StatBox} label=${t('sim.stats.hands')} display=${I.num(stats.hands)} tone="neutral" />
        <${StatBox} label=${t('sim.stats.winrate')} display=${I.pct(wr, 0)}
          tone=${stats.hands < 5 ? 'neutral' : wr >= 0.35 ? 'pos' : wr >= 0.2 ? 'warn' : 'neg'} />
        <${StatBox} label=${t('sim.stats.showdown')} display=${stats.showdowns ? I.pct(sd, 0) : '—'}
          tone=${stats.showdowns < 3 ? 'neutral' : sd >= 0.5 ? 'pos' : 'neg'} />
        <${StatBox} label=${t('sim.stats.net')} value=${stats.netChips} decimals=${0} />
        <${StatBox} label=${t('sim.stats.biggest')} display=${I.num(stats.biggest)} tone="neutral" />
      </div>
    </div>`;
  }

  /* --- Configuración inicial ------------------------------------------------------ */
  function Setup({ cfg, setCfg, onStart }) {
    const set = (k, v) => setCfg({ ...cfg, [k]: v });
    const styles = t('sim.styles');
    return html`<div class="panel" style=${{ display: 'grid', gap: '20px' }}>
      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <div>
          <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${t('sim.setup.players')}</span>
            <span class="slider-val">${cfg.players}</span></div>
          <input type="range" min="2" max="8" step="1" value=${cfg.players}
            aria-label=${t('sim.setup.players')} onInput=${e => set('players', +e.target.value)} />
        </div>
        <div>
          <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${t('sim.setup.stack')}</span>
            <span class="slider-val">${I.num(cfg.stack)}</span></div>
          <input type="range" min="500" max="10000" step="500" value=${cfg.stack}
            aria-label=${t('sim.setup.stack')} onInput=${e => set('stack', +e.target.value)} />
        </div>
        <div>
          <span class="field-label">${t('sim.setup.blinds')}</span>
          <div style=${{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            ${[[5, 10], [10, 20], [25, 50], [50, 100]].map(([s, b]) => html`<button key=${b} class="chipfilter"
              aria-pressed=${cfg.bb === b} onClick=${() => setCfg({ ...cfg, sb: s, bb: b })}>${s}/${b}</button>`)}
          </div>
        </div>
        <div>
          <label class="field-label" htmlFor="simname">${t('sim.setup.name')}</label>
          <input id="simname" type="text" value=${cfg.name} maxLength="16" onInput=${e => set('name', e.target.value)} />
        </div>
        <div>
          <span class="field-label">${t('sim.setup.difficulty')}</span>
          <div style=${{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            ${['easy', 'medium', 'hard'].map(d => html`<button key=${d} class="chipfilter" aria-pressed=${cfg.diff === d}
              onClick=${() => set('diff', d)}>${t('sim.setup.' + d)}</button>`)}
          </div>
        </div>
        <div style=${{ display: 'grid', gap: '8px', alignContent: 'start' }}>
          <label style=${{ display: 'flex', gap: '9px', alignItems: 'center', fontSize: '1rem', color: 'var(--ink-2)' }}>
            <input type="checkbox" checked=${cfg.practice} style=${{ width: 'auto' }}
              onChange=${e => set('practice', e.target.checked)} />${t('sim.setup.practice')}</label>
          <label style=${{ display: 'flex', gap: '9px', alignItems: 'center', fontSize: '1rem', color: 'var(--ink-2)' }}>
            <input type="checkbox" checked=${cfg.autoplay} style=${{ width: 'auto' }}
              onChange=${e => set('autoplay', e.target.checked)} />${t('sim.setup.autoplay')}</label>
        </div>
      </div>
      <div class="tile">
        <span class="eyebrow" style=${{ marginBottom: '8px' }}>${t('sim.setup.rivals')}</span>
        <div style=${{ display: 'grid', gap: '6px' }}>
          ${Array.from({ length: cfg.players - 1 }, (_, i) => html`<div key=${i}
            style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', fontSize: '1rem' }}>
            <span style=${{ minWidth: '80px', color: 'var(--ink-2)' }}>${BOTS[i]}</span>
            <div style=${{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              ${['tag', 'lag', 'nit', 'random'].map(s => html`<button key=${s} class="chipfilter"
                aria-pressed=${(cfg.styles[i] || 'tag') === s}
                onClick=${() => { const st = cfg.styles.slice(); st[i] = s; setCfg({ ...cfg, styles: st }); }}>${styles[s]}</button>`)}
            </div>
          </div>`)}
        </div>
      </div>
      <p class="hint">${t('sim.setup.practiceNote')}</p>
      <button class="btn btn-gold" style=${{ justifySelf: 'start' }} onClick=${onStart}>${t('sim.setup.start')} <span aria-hidden="true">→</span></button>
    </div>`;
  }

  /* --- Pestaña completa ------------------------------------------------------------ */
  function Simulador() {
    const [, force] = useReducer(x => x + 1, 0);
    const game = useRef(null);
    const [cfg, setCfg] = useState({ players: 4, stack: 2000, sb: 10, bb: 20, name: 'Tú',
      diff: 'medium', practice: true, autoplay: false, styles: ['tag', 'lag', 'nit', 'random', 'tag', 'lag', 'nit'] });
    const [stats, setStats] = useState(loadStats);
    const [thinking, setThinking] = useState(null);
    const [preEq, setPreEq] = useState(null);

    useEffect(() => { setCfg(c => ({ ...c, name: t('sim.table.you') })); }, [I.code]);

    const newGame = () => {
      const names = [cfg.name || t('sim.table.you'), ...BOTS.slice(0, cfg.players - 1)];
      const g = G.createGame({ names, stack: cfg.stack, sb: cfg.sb, bb: cfg.bb,
        styles: [null, ...cfg.styles.slice(0, cfg.players - 1)], stats: { ...stats } });
      game.current = g;
      deal(g);
    };

    const deal = g => {
      if (cfg.practice) {                       /* recompra automática en modo práctica */
        g.players.forEach(p => { if (p.stack <= 0) { p.stack = cfg.stack; p.out = false; } });
      }
      G.startHand(g);
      setPreEq(null);
      sound.play('shuffle');
      const hero = g.players.find(p => p.human);
      if (hero && hero.cards.length === 2) {
        const opps = g.players.filter(p => !p.out && !p.human).length;
        setTimeout(() => setPreEq(G.quickEquity(hero.cards, [], Math.max(1, opps), 1200)), 30);
      }
      force();
    };

    /* Bucle de la IA: una acción por render, con pausa para que se pueda seguir. */
    useEffect(() => {
      const g = game.current;
      if (!g || g.phase !== 'betting') { setThinking(null); return; }
      if (G.isHumanTurn(g)) { setThinking(null); return; }
      const who = g.toAct;
      setThinking(who);
      const id = setTimeout(() => {
        if (!game.current || game.current.phase !== 'betting' || game.current.toAct !== who) return;
        const d = G.aiDecide(g, cfg.diff);
        if (d) {
          G.act(g, d.action, d.amount);
          sound.play(d.action === 'fold' ? 'card' : 'chip');
        }
        setThinking(null);
        force();
      }, 620 + Math.random() * 520);
      return () => clearTimeout(id);
    });

    /* Fin de mano: guardar estadísticas y, si procede, repartir la siguiente. */
    useEffect(() => {
      const g = game.current;
      if (!g || g.phase !== 'done') return;
      setStats({ ...g.stats }); saveStats(g.stats);
      sound.play(g.result && g.result.winners.some(w => g.players[w.id].human) ? 'ding' : 'card');
      if (!cfg.autoplay) return;
      const id = setTimeout(() => deal(g), 3600);
      return () => clearTimeout(id);
    }, [game.current && game.current.phase, game.current && game.current.hand]);

    const onAct = (action, amount) => {
      const g = game.current;
      if (!g || !G.isHumanTurn(g)) return;
      G.act(g, action, amount);
      sound.play(action === 'fold' ? 'card' : 'chip');
      force();
    };

    const g = game.current;
    const hero = g && g.players.find(p => p.human);
    const humanTurn = g && G.isHumanTurn(g);
    const reveal = g && g.phase === 'done' && g.result && g.result.type === 'showdown';
    const heroHand = g && hero && !hero.folded && g.board.length >= 3
      ? I.handName(E.evaluate7([...hero.cards, ...g.board])) : null;

    return html`<section class="sec" id="simulador">
      <div class="shell">
        <${SectionHead} n="04" eyebrow=${t('sim.setup.eyebrow')} title=${t('sim.setup.title')} lede=${g ? null : t('sim.setup.lede')} />
        ${!g ? html`<${Reveal}><${Setup} cfg=${cfg} setCfg=${setCfg} onStart=${newGame} /><//>`
          : html`<div style=${{ display: 'grid', gap: '18px' }}>
              <${Table} g=${g} thinkingId=${thinking} reveal=${reveal} />

              ${g.phase === 'done'
                ? html`<${ResultPanel} g=${g} preEq=${preEq} onNext=${() => deal(g)}
                    onNew=${() => { game.current = null; force(); }} />`
                : humanTurn
                  ? html`<${ActionBar} g=${g} onAct=${onAct} />`
                  : html`<div class="actbar"><p class="hint" style=${{ textAlign: 'center', padding: '14px 0' }}>
                      ${t('sim.table.waiting')}</p></div>`}

              ${heroHand && html`<span class="pill pill--neon" style=${{ justifySelf: 'start' }}>
                ${t('sim.table.yourHand', { hand: heroHand })}</span>`}

              <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', alignItems: 'start' }}>
                ${hero && !hero.folded && g.phase === 'betting' && html`<${HelpPanel} g=${g} hero=${hero} />`}
                <${LogPanel} g=${g} />
                <${StatsPanel} stats=${stats} onReset=${() => {
                  const empty = { hands: 0, won: 0, showdowns: 0, showdownsWon: 0, vpip: 0, biggest: 0, netChips: 0 };
                  setStats(empty); saveStats(empty); if (game.current) game.current.stats = { ...empty };
                  toast(t('sim.stats.reset'), 'ok');
                }} />
              </div>
            </div>`}
      </div>
    </section>`;
  }

  window.PM_SEC.SimPoker = Simulador;
})();
