/* ============================================================================
   POKERMIND · Simulador de blackjack (interfície) i selector de joc
   Els dos simuladors viuen a la mateixa pestanya però no es barregen:
   cada joc té la seva taula, les seves regles i el seu panell.
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useReducer, useMemo } = React;
  const U = PM_UI, E = PM, I = PM_I18N, B = PM_BJ;
  const { html, SectionHead, PlayingCard, Stat, StatBox, Reveal, toast, sound, LoadBar } = U;
  const t = (k, v) => I.t(k, v);
  const STORE = 'pm-bj-stats';
  const empty = () => ({ hands: 0, won: 0, lost: 0, push: 0, bj: 0, net: 0, correct: 0, decisions: 0 });
  /* Emmagatzematge opcional: vegeu consent.js. */
  const load = () => PM_CONSENT.store.get(STORE, null) || empty();
  const save = s => PM_CONSENT.store.set(STORE, s);

  /* --- Una mà sobre el tapet ------------------------------------------------- */
  function BJHand({ cards, label, hidden, active, tag, badge, small }) {
    const shown = hidden ? cards.slice(0, 1) : cards;
    const v = B.handValue(shown);
    return html`<div style=${{ display: 'grid', gap: '7px', justifyItems: 'center' }}>
      <div class="card-row" style=${{ justifyContent: 'center' }}>
        ${cards.map((c, i) => html`<${PlayingCard} key=${'c' + i + c} card=${c} width=${small ? 42 : 54}
          faceDown=${hidden && i === 1} dealIndex=${i} />`)}
      </div>
      <div class=${'seat-box' + (active ? ' is-active' : '')} style=${{ width: 'auto', minWidth: '120px', textAlign: 'center' }}>
        <div style=${{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <span class="seat-name">${label}</span>
          ${tag && html`<span class="seat-tag" style=${{ color: 'var(--gold)' }}>${tag}</span>`}
        </div>
        <div style=${{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <span class="seat-stack">${hidden ? v.total + ' + ?' : (v.bust ? t('bj.table.bust') : v.total + (v.soft && !v.bust ? ' · ' + t('bj.table.soft') : ''))}</span>
          ${badge && html`<span class="seat-act a-allin">${badge}</span>`}
        </div>
      </div>
    </div>`;
  }

  /* --- Simulació llarga: la corba que baixa --------------------------------- */
  function LongRun() {
    const [res, setRes] = useState(null);
    const [busy, setBusy] = useState(false);
    const [n, setN] = useState(10000);
    const run = () => {
      setBusy(true);
      setTimeout(() => { setRes(B.simulateBasic(n, 25)); setBusy(false); sound.play('ding'); }, 30);
    };
    const W = 640, H = 220, m = { t: 16, r: 16, b: 26, l: 62 };
    let chart = null;
    if (res) {
      const max = Math.max(0, ...res.path), min = Math.min(0, ...res.path);
      const sx = i => m.l + (i / (res.path.length - 1)) * (W - m.l - m.r);
      const sy = v => m.t + (1 - (v - min) / Math.max(1, max - min)) * (H - m.t - m.b);
      chart = html`<div class="scroll-x">
        <svg viewBox=${`0 0 ${W} ${H}`} width="100%" style=${{ minWidth: '420px' }} role="img"
          aria-label=${t('bj.long.verdict')}>
          ${[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const v = min + p * (max - min);
            return html`<g key=${i}>
              <line class="chart-grid" x1=${m.l} x2=${W - m.r} y1=${sy(v)} y2=${sy(v)} />
              <text class="chart-txt" x=${m.l - 8} y=${sy(v) + 3} text-anchor="end">${I.num(Math.round(v))}</text></g>`;
          })}
          <line x1=${m.l} x2=${W - m.r} y1=${sy(0)} y2=${sy(0)} stroke="var(--ink-4)" stroke-width="1.5" stroke-dasharray="4 4"/>
          <path fill="none" stroke=${res.net >= 0 ? 'var(--good)' : 'var(--bad)'} stroke-width="2.5"
            d=${res.path.map((v, k) => (k ? 'L' : 'M') + sx(k).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ')} />
          <circle cx=${sx(res.path.length - 1)} cy=${sy(res.net)} r="4" fill=${res.net >= 0 ? 'var(--good)' : 'var(--bad)'}
            stroke="var(--surface)" stroke-width="2"/>
          <text class="chart-txt" x=${m.l} y=${H - 8}>0</text>
          <text class="chart-txt" x=${W - m.r} y=${H - 8} text-anchor="end">${t('bj.long.handsN', { n: I.num(res.hands) })}</text>
        </svg>
      </div>`;
    }
    return html`<div class="panel" style=${{ display: 'grid', gap: '16px' }}>
      <div>
        <h2 style=${{ fontSize: '1.15rem', marginBottom: '5px' }}>${t('bj.long.title')}</h2>
        <p class="hint" style=${{ maxWidth: 'var(--read)' }}>${t('bj.long.lede')}</p>
      </div>
      <div style=${{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        ${[1000, 10000, 50000].map(x => html`<button key=${x} class="chipfilter" aria-pressed=${n === x}
          onClick=${() => setN(x)}>${I.num(x)}</button>`)}
        <button class="btn btn-gold btn-sm" onClick=${run} disabled=${busy}>
          ${busy ? t('bj.long.running') : t('bj.long.run', { n: I.num(n) })}</button>
      </div>
      ${busy && html`<${LoadBar} label=${t('bj.long.title')} />`}
      ${chart}
      ${res && html`<${React.Fragment}>
        <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))' }}>
          <${StatBox} label=${t('bj.long.net')} value=${res.net} decimals=${0} />
          <${StatBox} label=${t('bj.long.edge')} display=${'−' + I.pct(res.edge, 2)} tone="neg" />
          <${StatBox} label=${t('bj.long.wagered')} display=${I.num(res.wagered)} tone="neutral" />
        </div>
        <div class="tile" style=${{ borderLeft: '3px solid var(--bad)' }}>
          <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('bj.long.verdict')}</p>
        </div>
        <div class="tile" style=${{ borderLeft: '3px solid var(--good)' }}>
          <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('bj.long.compare')}</p>
        </div>
      <//>`}
    </div>`;
  }

  /* --- Simulador jugable ------------------------------------------------------ */
  function BlackjackSim() {
    const [, force] = useReducer(x => x + 1, 0);
    const game = useRef(null);
    const [cfg, setCfg] = useState({ bankroll: 1000, bet: 25 });
    const [stats, setStats] = useState(load);
    const [hint, setHint] = useState(null);
    const [lastCheck, setLastCheck] = useState(null);

    const start = () => {
      game.current = B.createGame({ bankroll: cfg.bankroll, bet: cfg.bet, stats: { ...stats } });
      deal();
    };
    const deal = () => {
      const g = game.current;
      if (!g) return;
      if (g.bankroll < cfg.bet) g.bankroll = cfg.bankroll;      /* recompra per poder seguir practicant */
      B.deal(g, cfg.bet);
      setHint(null); setLastCheck(null);
      sound.play('card');
      if (g.phase === 'done') endHand();
      force();
    };
    const endHand = () => {
      const g = game.current;
      setStats({ ...g.stats }); save(g.stats);
      sound.play(g.result && g.result.net > 0 ? 'ding' : 'chip');
    };
    const doAct = action => {
      const g = game.current;
      const a = B.advice(g);
      if (a) {                                   /* es compta si la jugada coincideix amb la taula */
        g.stats.decisions++;
        const ok = a.action === action;
        if (ok) g.stats.correct++;
        setLastCheck({ ok, code: a.code });
      }
      B.act(g, action);
      setHint(null);
      sound.play(action === 'stand' ? 'chip' : 'card');
      if (g.phase === 'done') endHand();
      force();
    };
    const doInsurance = take => {
      const g = game.current;
      B.insurance(g, take);
      if (g.phase === 'done') endHand();
      force();
    };

    const g = game.current;
    const lg = g ? B.legal(g) : null;
    const dealerHidden = g ? (g.phase === 'player' || g.phase === 'insurance') : false;
    const acc = stats.decisions ? stats.correct / stats.decisions : 0;

    return html`<section class="sec" id="blackjack">
      <div class="shell">
        <${SectionHead} n="04" eyebrow=${t('bj.eyebrow')} title=${t('bj.title')} lede=${g ? null : t('bj.lede')} />

        ${!g ? html`<${Reveal}><div class="panel" style=${{ display: 'grid', gap: '18px' }}>
          <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <div>
              <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${t('bj.setup.bankroll')}</span>
                <span class="slider-val">${I.num(cfg.bankroll)}</span></div>
              <input type="range" min="200" max="5000" step="100" value=${cfg.bankroll}
                aria-label=${t('bj.setup.bankroll')} onInput=${e => setCfg({ ...cfg, bankroll: +e.target.value })} />
            </div>
            <div>
              <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${t('bj.setup.bet')}</span>
                <span class="slider-val">${I.num(cfg.bet)}</span></div>
              <input type="range" min="5" max="200" step="5" value=${cfg.bet}
                aria-label=${t('bj.setup.bet')} onInput=${e => setCfg({ ...cfg, bet: +e.target.value })} />
            </div>
          </div>
          <div class="tile">
            <span class="eyebrow" style=${{ marginBottom: '8px' }}>${t('bj.setup.rules')}</span>
            <div style=${{ display: 'grid', gap: '6px' }}>
              ${t('bj.setup.rulesList').map((r, i) => html`<div key=${i} style=${{ display: 'flex', gap: '9px', fontSize: '1rem', color: 'var(--ink-2)' }}>
                <span style=${{ color: 'var(--gold)' }} aria-hidden="true">▸</span>${r}</div>`)}
            </div>
          </div>
          <button class="btn btn-gold" style=${{ justifySelf: 'start' }} onClick=${start}>${t('bj.setup.start')} <${U.Icon} name='arrowR' size=${15} /></button>
        </div><//>`
        : html`<div style=${{ display: 'grid', gap: '18px' }}>
          <div class="tablewrap tablewrap--bj">
            <div style=${{ position: 'relative', display: 'grid', gap: 'clamp(18px,4vw,34px)', justifyItems: 'center' }}>
              <${BJHand} cards=${g.dealer.cards} label=${t('bj.table.dealer')} hidden=${dealerHidden}
                badge=${!dealerHidden && g.dealer.cards.length === 2 && B.handValue(g.dealer.cards).total === 21 ? t('bj.table.bj') : null} />
              <div style=${{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
                ${g.hands.map((h, k) => html`<${BJHand} key=${k} cards=${h.cards}
                  label=${g.hands.length > 1 ? t('bj.table.hand', { n: k + 1 }) : t('bj.table.you')}
                  active=${g.phase === 'player' && g.active === k}
                  tag=${t('bj.table.bet') + ' ' + I.num(h.bet)}
                  badge=${B.isBlackjack(h) ? t('bj.table.bj') : (h.outcome === 'win' || h.outcome === 'blackjack') ? '+' + I.num(h.payout - h.bet)
                    : h.outcome === 'lose' ? '−' + I.num(h.bet) : h.outcome === 'push' ? '=' : null} />`)}
              </div>
            </div>
          </div>

          ${g.phase === 'insurance' && html`<div class="actbar">
            <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${t('bj.act.insureQ')}</p>
            <div class="actrow">
              <button class="actbtn b-check" onClick=${() => doInsurance(true)}>${t('bj.act.insureYes')}</button>
              <button class="actbtn b-raise" onClick=${() => doInsurance(false)}>${t('bj.act.insureNo')}</button>
            </div>
          </div>`}

          ${g.phase === 'player' && lg && html`<div class="actbar">
            <div class="actrow actrow--bj">
              <button class="actbtn b-check" disabled=${!lg.canHit} onClick=${() => doAct('hit')}>${t('bj.act.hit')}</button>
              <button class="actbtn b-fold" onClick=${() => doAct('stand')}>${t('bj.act.stand')}</button>
              <button class="actbtn b-raise" disabled=${!lg.canDouble} onClick=${() => doAct('double')}>${t('bj.act.double')}</button>
              <button class="actbtn b-allin" disabled=${!lg.canSplit} onClick=${() => doAct('split')}>${t('bj.act.split')}</button>
            </div>
            <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button class="btn btn-ghost btn-sm" onClick=${() => setHint(B.advice(g))}>${t('bj.hint.ask')}</button>
              ${hint && html`<span class="pill pill--neon">${t('bj.hint.says', { what: t('bj.hint.' + hint.code) })}</span>`}
              <span class="hint" style=${{ marginLeft: 'auto' }}>${t('bj.act.bet', { n: I.num(cfg.bet) })} · ${t('bj.table.bankroll')} ${I.num(g.bankroll)}</span>
            </div>
          </div>`}

          ${g.phase === 'done' && g.result && html`<div class=${'resultbar ' + (g.result.net > 0 ? 'win' : g.result.net < 0 ? 'lose' : '')}>
            <div style=${{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong style=${{ fontFamily: 'var(--f-display)', fontSize: '1.05rem' }}>${t('bj.res.title')}</strong>
              <${Stat} value=${g.result.net} decimals=${0}
                display=${g.result.net > 0 ? t('bj.res.win', { n: I.num(g.result.net) })
                  : g.result.net < 0 ? t('bj.res.lose', { n: I.num(Math.abs(g.result.net)) }) : t('bj.res.push')} />
              <span class="hint">${g.result.dealerBust ? t('bj.res.dealerBust') : t('bj.res.dealerHas', { n: g.result.dealerTotal })}</span>
              <button class="btn btn-gold btn-sm" style=${{ marginLeft: 'auto' }} onClick=${deal}>${t('bj.act.again')}</button>
            </div>
            ${lastCheck && html`<span class="hint" style=${{ color: lastCheck.ok ? 'var(--good)' : 'var(--warn)' }}>
              ${lastCheck.ok ? t('bj.hint.ok') : t('bj.hint.no', { what: t('bj.hint.' + lastCheck.code) })}</span>`}
            ${g.shuffled && html`<span class="hint">${t('bj.table.shuffled')}</span>`}
          </div>`}

          <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', alignItems: 'start' }}>
            <div class="panel" style=${{ display: 'grid', gap: '12px' }}>
              <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <h2 style=${{ fontSize: '1.05rem' }}>${t('bj.stats.title')}</h2>
                <button class="btn btn-ghost btn-sm" style=${{ marginLeft: 'auto' }}
                  onClick=${() => { const e2 = empty(); setStats(e2); save(e2); if (game.current) game.current.stats = { ...e2 }; toast(t('bj.stats.reset'), 'ok'); }}>
                  ${t('bj.stats.reset')}</button>
              </div>
              <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '10px' }}>
                <${StatBox} label=${t('bj.stats.played')} display=${I.num(stats.hands)} tone="neutral" />
                <${StatBox} label=${t('bj.stats.net')} value=${stats.net} decimals=${0} />
                <${StatBox} label=${t('bj.stats.acc')} display=${stats.decisions ? I.pct(acc, 0) : '—'}
                  tone=${stats.decisions < 5 ? 'neutral' : acc >= 0.9 ? 'pos' : acc >= 0.7 ? 'warn' : 'neg'} />
              </div>
              <div style=${{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '1rem', color: 'var(--ink-2)' }}>
                <span>${t('bj.stats.won')}: <b class="mono" style=${{ color: 'var(--good)' }}>${stats.won}</b></span>
                <span>${t('bj.stats.lost')}: <b class="mono" style=${{ color: 'var(--bad)' }}>${stats.lost}</b></span>
                <span>${t('bj.stats.push')}: <b class="mono">${stats.push}</b></span>
                <span>${t('bj.stats.bj')}: <b class="mono" style=${{ color: 'var(--gold)' }}>${stats.bj}</b></span>
              </div>
            </div>
            <div class="panel" style=${{ display: 'grid', gap: '10px' }}>
              <h2 style=${{ fontSize: '1.05rem' }}>${t('bj.hint.title')}</h2>
              <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('bj.hint.note')}</p>
            </div>
          </div>

          <${LongRun} />
        </div>`}
      </div>
    </section>`;
  }

  /* --- Selector: dos jocs, cap barreja ---------------------------------------- */
  function GamePicker({ game, setGame }) {
    const opt = (id, name, desc, icon) => html`<button class="gamepick-opt"
      onClick=${() => { setGame(id); sound.play('chip'); }} aria-pressed=${game === id}>
      <span class="gp-ico"><${U.Icon} name=${icon} size=${18} /></span>
      <span><span class="gp-name">${name}</span><span class="gp-desc">${desc}</span></span>
    </button>`;
    return html`<div class="shell" style=${{ paddingTop: 'var(--sp-5)' }}>
      <div class="gamepick">
        <span class="gamepick-title">${t('bj.pickTitle')}</span>
        ${opt('poker', t('bj.pokerName'), t('bj.pokerDesc'), 'spade')}
        ${opt('bj', t('bj.bjName'), t('bj.bjDesc'), 'cards')}
      </div>
    </div>`;
  }

  /* La pestanya "Simulador" mostra el selector i, a sota, el joc triat. */
  function Simulador({ go }) {
    const [game, setGame] = useState('poker');
    return html`<${React.Fragment}>
      <${GamePicker} game=${game} setGame=${setGame} />
      ${game === 'poker' ? html`<${PM_SEC.SimPoker} go=${go} key="poker" />`
                         : html`<${BlackjackSim} key="bj" />`}
    <//>`;
  }

  window.PM_SEC.Simulador = Simulador;
  window.PM_SEC.Blackjack = BlackjackSim;
})();
