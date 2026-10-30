/* ============================================================================
   POKERMIND · Pestañas (2/2): Mental · Psicología · Probabilidad ·
   Recursos · Casos · Vocabulario · Footer
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useMemo } = React;
  const U = PM_UI, E = PM, I = PM_I18N;
  const { html, Reveal, Modal, Tabs, SectionHead, PlayingCard, BarRow, Donut, Legend, Spinner, LoadBar, DealLoader,
          RichText, Stat, StatBox, toast, sound } = U;
  const t = (k, v) => I.t(k, v);
  const L = () => I.L;

  /* ==========================================================================
     5 · JUEGO MENTAL
     ========================================================================= */
  function Mental() {
    const M = L().MENTAL;
    const [order, setOrder] = useState(M.map(m => m.id));
    const [drag, setDrag] = useState(null);
    const [over, setOver] = useState(null);
    const [tilted, setTilted] = useState(true);
    useEffect(() => { setOrder(M.map(m => m.id)); }, [I.code]);

    const move = (from, to) => {
      if (from == null || from === to) return;
      const next = order.slice();
      next.splice(to, 0, next.splice(from, 1)[0]);
      setOrder(next); sound.play('chip');
    };
    const byId = id => M.find(m => m.id === id);
    const rows = t('mental.rows');
    /* Mismo jugador en dos estados: el color marca a favor (verde) o en contra (rojo). */
    const COMPARE = {
      on:  { vals: ['47%', '9%', '4 h 20 min', '−12 bb/100'], tones: ['neg', 'neg', 'neg', 'neg'], note: t('mental.tiltNote') },
      off: { vals: ['23%', '31%', '90 min', '+4,5 bb/100'],   tones: ['pos', 'pos', 'pos', 'pos'], note: t('mental.calmNote') }
    };
    const c = tilted ? COMPARE.on : COMPARE.off;

    return html`<section class="sec sec--felt" id="mental">
      <div class="shell" style=${{ position: 'relative' }}>
        <${SectionHead} n="06" eyebrow=${t('mental.eyebrow')} title=${t('mental.title')} lede=${t('mental.lede')} />
        <div class="grid" style=${{ gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', alignItems: 'start' }}>
          <${Reveal} className="dnd">
            ${order.map((id, i) => {
              const m = byId(id);
              if (!m) return null;
              return html`<div key=${id} class=${'dnd-item ' + (drag === i ? 'drag ' : '') + (over === i ? 'over' : '')}
                draggable="true" onDragStart=${() => setDrag(i)} onDragEnd=${() => { setDrag(null); setOver(null); }}
                onDragOver=${e => { e.preventDefault(); setOver(i); }}
                onDrop=${e => { e.preventDefault(); move(drag, i); setOver(null); }}>
                <span class="dnd-rank mono">${i + 1}</span>
                <span class="node-ico" style=${{ width: "30px", height: "30px", borderRadius: "9px" }}><${U.Icon} name=${m.icon} size=${17} /></span>
                <div style=${{ flex: 1, display: 'grid', gap: '6px' }}>
                  <strong style=${{ fontFamily: 'var(--f-display)' }}>${m.name}</strong>
                  <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${m.claim}</span>
                  <div class="dnd-tips">
                    ${m.tips.map((x, k) => html`<div key=${k} style=${{ display: 'flex', gap: '8px' }}>
                      <span aria-hidden="true" style=${{ color: 'var(--gold)' }}>▸</span><span><${RichText} text=${x} /></span></div>`)}
                  </div>
                </div>
                <div style=${{ display: 'grid', gap: '3px' }}>
                  <button class="icon-btn" style=${{ width: '28px', height: '24px' }} aria-label=${t('mental.up', { name: m.name })}
                    onClick=${() => move(i, Math.max(0, i - 1))}>▲</button>
                  <button class="icon-btn" style=${{ width: '28px', height: '24px' }} aria-label=${t('mental.down', { name: m.name })}
                    onClick=${() => move(i, Math.min(order.length - 1, i + 1))}>▼</button>
                </div>
              </div>`;
            })}
            <p class="hint">${t('mental.hint')}</p>
          <//>

          <${Reveal} delay=${100} className="panel">
            <div style=${{ display: 'grid', gap: '16px' }}>
              <div>
                <span class="eyebrow" style=${{ marginBottom: '8px' }}>${t('mental.ba')}</span>
                <h2 style=${{ fontSize: '1.1rem' }}>${t('mental.baTitle')}</h2>
              </div>
              <div class="tabs" style=${{ width: '100%' }}>
                <button aria-selected=${tilted} onClick=${() => setTilted(true)} style=${{ flex: 1 }}>${t('mental.tilt')}</button>
                <button aria-selected=${!tilted} onClick=${() => setTilted(false)} style=${{ flex: 1 }}>${t('mental.calm')}</button>
              </div>
              <div style=${{ display: 'grid', gap: '11px' }}>
                ${rows.map((k, i) => html`<div key=${k} style=${{ display: 'flex', justifyContent: 'space-between', gap: '12px',
                  padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${k}</span>
                  <${Stat} display=${c.vals[i]} tone=${c.tones[i]} />
                </div>`)}
              </div>
              <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${c.note}</p>
              <div class="tile" style=${{ borderLeft: '3px solid var(--gold)' }}>
                <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('mental.disclaimer')}</span>
              </div>
            </div>
          <//>
        </div>
        <${Reveal}><${U.Cita} id="F04" /><//>
      </div>
    </section>`;
  }

  /* ==========================================================================
     6 · PSICOLOGÍA
     ========================================================================= */
  function TellScene({ cue, playing }) {
    const anim = { shake: 'pm-shake .22s linear infinite', freeze: 'none', snap: 'pm-snap 1.1s ease-in-out infinite',
                   tank: 'pm-tank 3.4s ease-in-out infinite', glance: 'pm-glance 2.2s ease-in-out infinite',
                   talk: 'pm-talk .5s ease-in-out infinite' }[cue];
    return html`<div style=${{ position: 'relative', background: 'linear-gradient(180deg,var(--felt-deep),var(--felt))',
      border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '22px', display: 'grid',
      placeItems: 'center', minHeight: '210px', overflow: 'hidden' }}>
      <svg viewBox="0 0 220 150" width="100%" style=${{ maxWidth: '300px' }} role="img" aria-label=${t('psico.tells.aria')}>
        <ellipse cx="110" cy="132" rx="104" ry="16" fill="var(--felt-deep)" opacity="0.85"/>
        <path d="M62 128 q48 -46 96 0 z" fill="var(--surface)" stroke="var(--line)"/>
        <circle cx="110" cy="58" r="26" fill="var(--surface)" stroke="var(--line)"/>
        <g style=${{ animation: playing && cue === 'glance' ? anim : 'none', transformOrigin: '110px 56px' }}>
          <circle cx="101" cy="55" r="3.1" fill="var(--ink-2)"/><circle cx="119" cy="55" r="3.1" fill="var(--ink-2)"/>
        </g>
        <ellipse cx="110" cy="72" rx=${cue === 'talk' ? 7 : 8} ry=${cue === 'talk' ? 4 : 1.6} fill="var(--ink-3)"
          style=${{ animation: playing && cue === 'talk' ? anim : 'none', transformOrigin: '110px 72px' }}/>
        <g style=${{ animation: playing && (cue === 'shake' || cue === 'snap' || cue === 'tank') ? anim : 'none', transformOrigin: '110px 110px' }}>
          <rect x="78" y="100" width="26" height="13" rx="6" fill="var(--surface-raised)" stroke="var(--line)"/>
          <rect x="116" y="100" width="26" height="13" rx="6" fill="var(--surface-raised)" stroke="var(--line)"/>
          <circle cx="110" cy="106" r="9" fill="var(--gold)" opacity="0.92"/>
          <circle cx="110" cy="106" r="4.6" fill="var(--felt-deep)"/>
        </g>
      </svg>
      ${playing && html`<span class="pill pill--neon pill--live" style=${{ position: 'absolute', top: '12px', right: '12px' }}>
        ${t('psico.tells.observing')}</span>`}
    </div>`;
  }

  function TellTrainer() {
    const T = L().TELLS;
    const [i, setI] = useState(0);
    const [answer, setAnswer] = useState(null);
    const [score, setScore] = useState({ ok: 0, n: 0 });
    const tl = T[i % T.length];
    const done = answer !== null;
    const choose = k => {
      if (done) return;
      const ok = k === tl.correct;
      setAnswer(k); setScore(s => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
      sound.play(ok ? 'ding' : 'err');
    };
    return html`<div class="panel" style=${{ display: 'grid', gap: '18px' }}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.15rem' }}>${t('psico.tells.title')}</h2>
        <span class="pill">${t('psico.tells.scene', { n: i + 1, total: T.length })}</span>
        <span style=${{ marginLeft: 'auto' }}>
          <${Stat} display=${t('psico.tells.hits', { ok: score.ok, n: score.n })}
            tone=${score.n === 0 ? 'neutral' : score.ok / score.n >= 0.6 ? 'pos' : 'neg'} arrow=${false} />
        </span>
      </div>
      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        <${TellScene} cue=${tl.cue} playing=${!done} />
        <div style=${{ display: 'grid', gap: '13px', alignContent: 'start' }}>
          <p style=${{ color: 'var(--ink-2)' }}>${tl.scene}</p>
          <strong style=${{ fontFamily: 'var(--f-display)' }}>${tl.q}</strong>
          <div style=${{ display: 'grid', gap: '7px' }}>
            ${tl.options.map((o, k) => {
              const isC = k === tl.correct, picked = answer === k;
              const bg = !done ? 'var(--surface-raised)' : isC ? 'color-mix(in srgb,var(--good) 22%,transparent)'
                       : picked ? 'color-mix(in srgb,var(--bad) 20%,transparent)' : 'var(--surface-raised)';
              const bc = !done ? 'var(--line)' : isC ? 'var(--good)' : picked ? 'var(--bad)' : 'var(--line)';
              return html`<button key=${k} onClick=${() => choose(k)} disabled=${done}
                style=${{ textAlign: 'left', background: bg, border: '1px solid ' + bc, borderRadius: 'var(--r-sm)',
                  padding: '11px 13px', cursor: done ? 'default' : 'pointer', color: 'var(--ink)', fontSize: '1rem',
                  display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span class="mono" style=${{ color: 'var(--ink-3)' }}>${'ABCD'[k]}</span>${o}
                ${done && isC && html`<span style=${{ marginLeft: 'auto', color: 'var(--good)' }} aria-hidden="true">✓</span>`}
              </button>`;
            })}
          </div>
          ${done && html`<div class="tile" style=${{ borderLeft: '3px solid var(--gold)', display: 'grid', gap: '8px' }}>
            <strong style=${{ fontSize: '1rem' }}>${tl.meaning}</strong>
            <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${tl.science}</p>
            <button class="btn btn-gold btn-sm" style=${{ justifySelf: 'start' }}
              onClick=${() => { setAnswer(null); setI((i + 1) % T.length); }}>${t('psico.tells.next')}</button>
          </div>`}
          ${!done && html`<p class="hint">${t('psico.tells.hint')}</p>`}
        </div>
      </div>
      <p class="hint">${t('psico.tells.disclaimer')}</p>
    </div>`;
  }

  function Biases() {
    const [open, setOpen] = useState(null);
    const B = L().BIASES;
    return html`<div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(235px,1fr))' }}>
      ${B.map((b, i) => html`<${Reveal} key=${b.id} delay=${i * 60}>
        <button class="node" style=${{ width: '100%' }} onClick=${() => setOpen(b.id)}>
          <span class="node-ico"><${U.Icon} name=${b.icon} size=${20} /></span>
          <strong style=${{ fontFamily: 'var(--f-display)' }}>${b.name}</strong>
          <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${b.def}</span>
          <span class="hint" style=${{ color: 'var(--gold)' }}>${t('psico.bias.see')}</span>
        </button>
      <//>`)}
      ${B.map(b => html`<${Modal} key=${'m' + b.id} open=${open === b.id} onClose=${() => setOpen(null)}
        title=${b.name} sub=${t('psico.bias.sub')}>
        <p style=${{ color: 'var(--ink-2)' }}>${b.def}</p>
        <div class="tile" style=${{ borderLeft: '3px solid var(--bad)' }}>
          <span class="eyebrow" style=${{ color: 'var(--bad)', marginBottom: '6px' }}>${t('psico.bias.table')}</span>
          <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${b.example}</span>
        </div>
        <div class="tile" style=${{ borderLeft: '3px solid var(--good)' }}>
          <span class="eyebrow" style=${{ color: 'var(--good)', marginBottom: '6px' }}>${t('psico.bias.fix')}</span>
          <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}><${RichText} text=${b.fix} /></span>
        </div>
      <//>`)}
    </div>`;
  }

  function ProfileMatrix() {
    const [x, setX] = useState(70);
    const [y, setY] = useState(72);
    const A = L().ARCHETYPES;
    const key = x > 78 && y > 78 ? 'maniac' : x >= 50 ? (y >= 50 ? 'lag' : 'fish') : (y >= 50 ? 'tag' : 'nit');
    const a = A[key];
    const quads = [{ k: 'nit', pos: { left: 0, top: '50%' } }, { k: 'tag', pos: { left: 0, top: 0 } },
                   { k: 'fish', pos: { left: '50%', top: '50%' } }, { k: 'lag', pos: { left: '50%', top: 0 } }];
    return html`<div class="panel grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', alignItems: 'start' }}>
      <div style=${{ display: 'grid', gap: '14px' }}>
        <h2 style=${{ fontSize: '1.15rem' }}>${t('psico.prof.title')}</h2>
        <div class="quad">
          ${quads.map(q => {
            const shown = q.k === 'lag' && key === 'maniac' ? 'maniac' : q.k;
            return html`<div key=${q.k} class=${'quad-cell ' + (key === shown ? 'on' : '')} style=${q.pos}>
              <${U.Icon} name=${A[shown].icon} size=${20} />
              <b>${A[shown].name}</b></div>`;
          })}
          <div class="quad-axis" style=${{ left: '50%', top: 0, bottom: 0, width: '1px' }}></div>
          <div class="quad-axis" style=${{ top: '50%', left: 0, right: 0, height: '1px' }}></div>
          <div class="quad-dot" style=${{ left: x + '%', top: (100 - y) + '%' }} aria-hidden="true"></div>
        </div>
        <div style=${{ display: 'flex', justifyContent: 'space-between' }} class="hint">
          <span>← ${t('psico.prof.tight')}</span><span>${t('psico.prof.loose')} →</span></div>
        <div>
          <div class="slider-row"><label class="field-label" for="sx">${t('psico.prof.hands')}</label>
            <span class="slider-val">${x < 50 ? t('psico.prof.tight') : t('psico.prof.loose')} · VPIP ≈ ${Math.round(10 + x * 0.5)}%</span></div>
          <input id="sx" type="range" min="0" max="100" value=${x} onInput=${e => setX(+e.target.value)} />
        </div>
        <div>
          <div class="slider-row"><label class="field-label" for="sy">${t('psico.prof.how')}</label>
            <span class="slider-val">${y < 50 ? t('psico.prof.passive') : t('psico.prof.aggressive')} · ${t('psico.prof.aggression')} ${(y / 25).toFixed(1)}</span></div>
          <input id="sy" type="range" min="0" max="100" value=${y} onInput=${e => setY(+e.target.value)} />
        </div>
      </div>
      <div style=${{ display: 'grid', gap: '13px' }}>
        <div style=${{ display: 'flex', gap: '11px', alignItems: 'center' }}>
          <span class="node-ico"><${U.Icon} name=${a.icon} size=${20} /></span>
          <div><div style=${{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', fontWeight: 700 }}>${a.name}</div>
            <div class="hint">${a.sub} · VPIP/PFR ${a.vpip}</div></div>
        </div>
        <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${a.profile}</p>
        <div class="tile" style=${{ display: 'grid', gap: '9px' }}>
          <span class="eyebrow">${t('psico.prof.counter')}</span>
          ${a.counter.map((cx, i) => html`<div key=${i} style=${{ display: 'flex', gap: '9px', fontSize: '1rem', color: 'var(--ink-2)' }}>
            <span style=${{ color: 'var(--gold)' }} aria-hidden="true">▸</span>${cx}</div>`)}
        </div>
      </div>
    </div>`;
  }

  function BankrollLab() {
    const [wr, setWr] = useState(3);
    const [sd, setSd] = useState(90);
    const [hands, setHands] = useState(50000);
    const [br, setBr] = useState(1000);
    const [seed, setSeed] = useState(0);
    const sim = useMemo(() => E.simulate(wr, sd, hands, 12, br), [wr, sd, hands, br, seed]);
    const ror = E.riskOfRuin(wr, sd, br);
    const busts = sim.paths.filter(p => p.some(v => v <= 0)).length;

    const W = 640, H = 260, m = { t: 18, r: 16, b: 30, l: 56 };
    const all = sim.paths.flat();
    const maxY = Math.max(br * 1.6, ...all), minY = Math.min(0, ...all);
    const sx = i => m.l + (i / sim.blocks) * (W - m.l - m.r);
    const sy = v => m.t + (1 - (v - minY) / (maxY - minY)) * (H - m.t - m.b);
    const mean = Array.from({ length: sim.blocks + 1 }, (_, i) => br + wr * i);
    const endMean = mean[sim.blocks];

    return html`<div class="panel" style=${{ display: 'grid', gap: '18px' }}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.15rem' }}>${t('psico.bank.title')}</h2>
        <span class="hint">${t('psico.bank.sub')}</span>
      </div>
      <div class="scroll-x">
        <svg viewBox=${`0 0 ${W} ${H}`} width="100%" style=${{ minWidth: '420px' }} role="img"
          aria-label=${t('psico.bank.aria', { wr: wr, sd: sd, ror: I.pct(ror) })}>
          ${Array.from({ length: 5 }, (_, i) => {
            const v = minY + (i / 4) * (maxY - minY);
            return html`<g key=${i}>
              <line class="chart-grid" x1=${m.l} x2=${W - m.r} y1=${sy(v)} y2=${sy(v)} />
              <text class="chart-txt" x=${m.l - 8} y=${sy(v) + 3} text-anchor="end">${Math.round(v)}</text></g>`;
          })}
          <line x1=${m.l} x2=${W - m.r} y1=${sy(0)} y2=${sy(0)} stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="4 4"/>
          <text class="chart-txt" x=${W - m.r} y=${sy(0) - 6} text-anchor="end" fill="var(--bad)">${t('psico.bank.ruin')}</text>
          ${sim.paths.map((p, i) => html`<path key=${i} fill="none" stroke="var(--s2)" stroke-width="1.5" opacity="0.42"
            d=${p.map((v, k) => (k ? 'L' : 'M') + sx(k).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ')} />`)}
          <path fill="none" stroke=${wr >= 0 ? 'var(--good)' : 'var(--bad)'} stroke-width="2.5"
            d=${mean.map((v, k) => (k ? 'L' : 'M') + sx(k).toFixed(1) + ' ' + sy(v).toFixed(1)).join(' ')} />
          <circle cx=${sx(sim.blocks)} cy=${sy(endMean)} r="4" fill=${wr >= 0 ? 'var(--good)' : 'var(--bad)'} stroke="var(--surface)" stroke-width="2"/>
          <text class="chart-txt-em" x=${sx(sim.blocks)} y=${sy(endMean) - 10} text-anchor="end">
            ${t('psico.bank.expected', { n: Math.round(endMean) })}</text>
          <text class="chart-txt" x=${m.l} y=${H - 9}>0</text>
          <text class="chart-txt" x=${W - m.r} y=${H - 9} text-anchor="end">${t('psico.bank.handsAxis', { n: I.num(hands) })}</text>
          <text class="chart-txt" x="4" y="10">bb</text>
        </svg>
      </div>
      <${Legend} items=${[{ label: t('psico.bank.legendPaths'), color: 'var(--s2)' },
                          { label: t('psico.bank.legendMean'), color: wr >= 0 ? 'var(--good)' : 'var(--bad)' },
                          { label: t('psico.bank.legendRuin'), color: 'var(--bad)' }]} />

      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
        ${[[t('psico.bank.wr'), wr, setWr, -2, 10, 0.5, true], [t('psico.bank.sd'), sd, setSd, 60, 130, 5, false],
           [t('psico.bank.hands'), hands, setHands, 10000, 200000, 10000, false], [t('psico.bank.br'), br, setBr, 200, 4000, 100, false]]
          .map(([label, val, set, min, max, step, signed]) => html`<div key=${label}>
            <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${label}</span>
              ${signed ? html`<${Stat} value=${val} decimals=${1} />`
                       : html`<span class="slider-val">${I.num(val)}</span>`}</div>
            <input type="range" min=${min} max=${max} step=${step} value=${val} aria-label=${label} onInput=${e => set(+e.target.value)} />
          </div>`)}
      </div>

      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))' }}>
        <${StatBox} label=${t('psico.bank.ror')} display=${I.pct(ror)} note=${t('psico.bank.rorNote')}
          tone=${U.toneByThreshold(ror, 0.05, 0.15)} />
        <${StatBox} label=${t('psico.bank.buyins')} display=${I.num(br / 100, 1)} note=${t('psico.bank.buyinsNote')}
          tone=${br / 100 >= 30 ? 'pos' : br / 100 >= 15 ? 'warn' : 'neg'} />
        <${StatBox} label=${t('psico.bank.busts')} display=${busts + '/12'} note=${t('psico.bank.bustsNote')}
          tone=${busts === 0 ? 'pos' : busts <= 2 ? 'warn' : 'neg'} />
      </div>
      <div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button class="btn btn-ghost btn-sm" onClick=${() => { setSeed(s => s + 1); sound.play('shuffle'); }}>${t('psico.bank.resim')}</button>
        <p class="hint" style=${{ flex: '1 1 240px' }}>${t('psico.bank.note')}</p>
      </div>
      <${U.Cita} id="F09" compacta=${true} />
    </div>`;
  }

  function Psicologia() {
    return html`<section class="sec" id="psicologia">
      <div class="shell">
        <${SectionHead} n="07" eyebrow=${t('psico.eyebrow')} title=${t('psico.title')} lede=${t('psico.lede')} />
        <div style=${{ display: 'grid', gap: '26px' }}>
          <${Reveal}><${TellTrainer} /><//>
          <div>
            <h2 style=${{ fontSize: '1.15rem', marginBottom: '14px' }}>${t('psico.bias.title')}</h2>
            <${Biases} />
          </div>
          <${Reveal}><${ProfileMatrix} /><//>
          <${Reveal}><${BankrollLab} /><//>
        </div>
      </div>
    </section>`;
  }

  /* ==========================================================================
     7 · PROBABILIDAD
     ========================================================================= */
  function CardPicker({ used, onPick }) {
    return html`<div style=${{ display: 'grid', gap: '5px' }}>
      ${E.SUITS.map(s => html`<div key=${s} style=${{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        ${[14,13,12,11,10,9,8,7,6,5,4,3,2].map(r => {
          const c = E.card(r, E.SUITS.indexOf(s));
          const off = used.includes(c);
          return html`<button key=${c} disabled=${off} onClick=${() => onPick(c)}
            aria-label=${E.R_CHAR[r] + ' ' + U.suitName(s)}
            style=${{ width: '30px', height: '38px', borderRadius: '4px', cursor: off ? 'default' : 'pointer',
              border: '1px solid var(--line)', background: off ? 'var(--surface-overlay)' : 'var(--card-face)',
              color: off ? 'var(--ink-4)' : (s === 'h' || s === 'd' ? 'var(--suit-red)' : 'var(--card-ink)'),
              opacity: off ? .35 : 1, fontFamily: 'var(--f-mono)', fontSize: '.68rem', fontWeight: 700,
              display: 'grid', placeItems: 'center', lineHeight: 1.1, padding: 0 }}>
            ${E.R_CHAR[r]}<span style=${{ fontSize: '.8em' }}>${E.SUIT_GLYPH[s]}</span></button>`;
        })}
      </div>`)}
    </div>`;
  }

  function EquityCalculator() {
    const [hero, setHero] = useState(() => ['Ah', 'Kh'].map(E.parseCard));
    const [vill, setVill] = useState(() => ['Qs', 'Qd'].map(E.parseCard));
    const [board, setBoard] = useState(() => ['Jh', 'Ts', '3c'].map(E.parseCard));
    const [slot, setSlot] = useState({ who: 'board', i: 3 });
    const [res, setRes] = useState(null);
    const [prog, setProg] = useState(1);
    const runner = useRef(null);
    const ITERS = 25000;
    const used = [...hero, ...vill, ...board].filter(c => c != null);

    useEffect(() => {
      if (hero.filter(c => c != null).length < 2 || vill.filter(c => c != null).length < 2) { setRes(null); return; }
      runner.current && runner.current.cancel();
      setProg(0);
      runner.current = E.equityRunner([hero, vill], board.filter(c => c != null), ITERS,
        (p, r) => { setProg(p); setRes(r); }, r => { setProg(1); setRes(r); });
      return () => runner.current && runner.current.cancel();
    }, [hero.join(), vill.join(), board.join()]);

    const place = c => {
      const { who, i } = slot;
      const set = { hero: setHero, vill: setVill, board: setBoard }[who];
      const arr = { hero, vill, board }[who].slice();
      arr[i] = c; set(arr); sound.play('card');
      const seq = [...hero.map((_, k) => ({ who: 'hero', i: k })), ...vill.map((_, k) => ({ who: 'vill', i: k })),
                   ...[0,1,2,3,4].map(k => ({ who: 'board', i: k }))];
      const cur = { hero, vill, board };
      const at = seq.findIndex(s => s.who === who && s.i === i);
      const nextFree = seq.slice(at + 1).find(s => cur[s.who][s.i] == null);
      if (nextFree) setSlot(nextFree);
    };
    const clearSlot = (who, i) => {
      const set = { hero: setHero, vill: setVill, board: setBoard }[who];
      const arr = { hero, vill, board }[who].slice(); arr[i] = null; set(arr); setSlot({ who, i });
    };
    const randomize = () => {
      const d = E.shuffle(E.fullDeck());
      setHero(d.slice(0, 2)); setVill(d.slice(2, 4)); setBoard([...d.slice(4, 7), null, null]); sound.play('shuffle');
    };

    /* Renderizado directo (no como componente) para no remontar en cada tick. */
    const Slots = ({ who, label, cards, n, accent }) => html`<div style=${{ display: 'grid', gap: '8px' }}>
      <span class="eyebrow" style=${{ color: accent }}>${label}</span>
      <div class="card-row">
        ${Array.from({ length: n }, (_, i) => {
          const c = cards[i], active = slot.who === who && slot.i === i;
          return html`<div key=${i} style=${{ outline: active ? '2px solid var(--neon)' : 'none', outlineOffset: '3px', borderRadius: '8px' }}>
            <${PlayingCard} card=${c} empty=${c == null} width=${52} label=${active ? '◉' : '+'}
              onClick=${() => (c == null ? setSlot({ who, i }) : clearSlot(who, i))} />
          </div>`;
        })}
      </div>
    </div>`;

    const heroR = res && res[0], villR = res && res[1];
    const bd = board.filter(c => c != null);
    const madeHero = bd.length >= 3 ? E.describe(E.evaluate7([...hero, ...bd])) : null;
    const madeVill = bd.length >= 3 ? E.describe(E.evaluate7([...vill, ...bd])) : null;

    return html`<div class="panel" style=${{ display: 'grid', gap: '20px' }}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.15rem' }}>${t('prob.calc.title')}</h2>
        ${prog < 1 ? html`<span class="pill pill--neon"><${Spinner} /> ${t('prob.calc.simulating', { n: I.num(ITERS), p: Math.round(prog * 100) })}</span>`
                   : html`<span class="pill pill--gold">${t('prob.calc.simulated', { n: I.num(ITERS) })}</span>`}
        ${prog < 1 && html`<span style=${{ flex: '1 1 120px', minWidth: '90px' }}>
          <${LoadBar} value=${prog} label=${t('prob.calc.title')} /></span>`}
        <div style=${{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button class="btn btn-ghost btn-sm" onClick=${randomize}>${t('prob.calc.random')}</button>
          <button class="btn btn-ghost btn-sm" onClick=${() => { setHero([null,null]); setVill([null,null]);
            setBoard([null,null,null,null,null]); setSlot({ who: 'hero', i: 0 }); setRes(null); }}>${t('prob.calc.clear')}</button>
        </div>
      </div>

      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <div style=${{ display: 'grid', gap: '16px' }}>
          ${Slots({ who: 'hero', label: t('prob.calc.hero'), cards: hero, n: 2, accent: 'var(--gold)' })}
          ${Slots({ who: 'vill', label: t('prob.calc.villain'), cards: vill, n: 2, accent: 'var(--s2)' })}
          ${Slots({ who: 'board', label: t('prob.calc.board'), cards: board, n: 5, accent: 'var(--ink-3)' })}
          <div>
            <span class="eyebrow" style=${{ marginBottom: '8px' }}>${t('prob.calc.pick')}</span>
            <${CardPicker} used=${used} onPick=${place} />
          </div>
        </div>

        <div style=${{ display: 'grid', gap: '16px', alignContent: 'start' }}>
          ${res ? html`<${React.Fragment}>
            <div style=${{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <${Donut} segments=${[{ label: t('prob.calc.win'), value: heroR.win, color: 'var(--good)' },
                                    { label: t('prob.calc.tie'), value: heroR.tie, color: 'var(--ink-4)' },
                                    { label: t('prob.calc.lose'), value: heroR.lose, color: 'var(--bad)' }]}
                center=${html`<div>
                  <div class="stat-n" style=${{ color: heroR.equity >= 0.5 ? 'var(--good)' : 'var(--bad)' }}>${I.pct(heroR.equity)}</div>
                  <div class="hint">${t('prob.calc.equity')}</div></div>`} />
              <div style=${{ display: 'grid', gap: '10px', flex: '1 1 180px', minWidth: '170px' }}>
                <${BarRow} label=${t('prob.calc.win')} value=${heroR.win} color="var(--good)" display=${I.pct(heroR.win)} />
                <${BarRow} label=${t('prob.calc.tie')} value=${heroR.tie} color="var(--ink-4)" display=${I.pct(heroR.tie)} />
                <${BarRow} label=${t('prob.calc.lose')} value=${heroR.lose} color="var(--bad)" display=${I.pct(heroR.lose)} />
              </div>
            </div>
            <div class="tile" style=${{ display: 'grid', gap: '9px' }}>
              <div style=${{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style=${{ color: 'var(--ink-2)' }}>${t('prob.calc.handNow')}</span>
                <span class="mono" style=${{ color: 'var(--gold)' }}>${madeHero || t('prob.calc.noFlop')}</span></div>
              <div style=${{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style=${{ color: 'var(--ink-2)' }}>${t('prob.calc.villainNow')}</span>
                <span class="mono" style=${{ color: 'var(--s2)' }}>${madeVill || t('prob.calc.noFlop')}</span></div>
              <hr class="divider" />
              <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>
                ${heroR.equity >= villR.equity
                  ? t('prob.calc.ahead', { eq: I.pct(heroR.equity), lose: I.pct(heroR.lose) })
                  : t('prob.calc.behind', { eq: I.pct(heroR.equity), ratio: I.num(1 / Math.max(heroR.equity, 0.001) - 1, 1) })}
              </p>
            </div>
          <//>` : html`<div class="tile" style=${{ display: 'grid', gap: '10px', placeItems: 'center', minHeight: '200px', textAlign: 'center' }}>
            <span aria-hidden="true" style=${{ fontSize: '1.8rem' }}>🂠</span>
            <p style=${{ color: 'var(--ink-2)' }}>${t('prob.calc.empty')}</p>
          </div>`}
        </div>
      </div>
    </div>`;
  }

  function PotOdds() {
    const [pot, setPot] = useState(100);
    const [bet, setBet] = useState(50);
    const [outs, setOuts] = useState(9);
    const [street, setStreet] = useState(2);
    const need = E.requiredEquity(bet, pot);
    const have = E.outsOdds(outs, street);
    const ok = have >= need;
    const refs = t('prob.pot.refs');
    const OUTS = [9, 8, 4, 6, 15, 7];
    return html`<div class="panel" style=${{ display: 'grid', gap: '18px' }}>
      <h2 style=${{ fontSize: '1.15rem' }}>${t('prob.pot.title')}</h2>
      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <div style=${{ display: 'grid', gap: '14px' }}>
          ${[[t('prob.pot.pot'), pot, setPot, 10, 500, 10], [t('prob.pot.bet'), bet, setBet, 5, 500, 5],
             [t('prob.pot.outs'), outs, setOuts, 1, 21, 1]].map(([l, v, s, min, max, st]) => html`<div key=${l}>
            <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${l}</span>
              <span class="slider-val">${I.num(v)}</span></div>
            <input type="range" min=${min} max=${max} step=${st} value=${v} aria-label=${l} onInput=${e => s(+e.target.value)} />
          </div>`)}
          <div class="tabs" style=${{ width: '100%' }}>
            <button aria-selected=${street === 2} onClick=${() => setStreet(2)} style=${{ flex: 1 }}>${t('prob.pot.two')}</button>
            <button aria-selected=${street === 1} onClick=${() => setStreet(1)} style=${{ flex: 1 }}>${t('prob.pot.one')}</button>
          </div>
          <div style=${{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            ${refs.map((n, i) => html`<button key=${n} class="pill" style=${{ cursor: 'pointer' }}
              onClick=${() => setOuts(OUTS[i])}>${n} · ${OUTS[i]}</button>`)}
          </div>
        </div>
        <div style=${{ display: 'grid', gap: '14px', alignContent: 'start' }}>
          <${BarRow} label=${t('prob.pot.need')} value=${need} color="var(--s4)" display=${I.pct(need)}
            note=${t('prob.pot.needNote', { bet: I.num(bet), total: I.num(pot + bet * 2), ratio: I.num(E.potOddsRatio(bet, pot), 1) })} />
          <${BarRow} label=${t('prob.pot.have', { outs: outs })} value=${have} display=${I.pct(have)}
            color=${ok ? 'var(--good)' : 'var(--bad)'} note=${street === 2 ? t('prob.pot.rule4') : t('prob.pot.rule2')} />
          <div class="tile" style=${{ borderLeft: '3px solid ' + (ok ? 'var(--good)' : 'var(--bad)') }}>
            <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
              <span style=${{ color: ok ? 'var(--good)' : 'var(--bad)', display: 'grid' }} aria-hidden="true">
                <${U.Icon} name=${ok ? 'check' : 'close'} size=${19} /></span>
              <strong style=${{ fontFamily: 'var(--f-display)', color: ok ? 'var(--good)' : 'var(--bad)' }}>
                ${ok ? t('prob.pot.yes') : t('prob.pot.no')}</strong>
            </div>
            <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>
              ${ok ? t('prob.pot.yesText', { have: I.pct(have), need: I.pct(need) })
                   : t('prob.pot.noText', { have: I.pct(have), need: I.pct(need) })}</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  function RangeMatrix() {
    const [pos, setPos] = useState('BTN');
    const [aggr, setAggr] = useState(1);
    const [hover, setHover] = useState(null);
    const P = L().POSITIONS;
    const p = P.find(x => x.k === pos) || P[0];
    const pctv = E.clamp(p.open * aggr, 0.02, 1);
    const range = useMemo(() => E.rangeForPct(pctv), [pctv]);
    const combos = useMemo(() => [...range].reduce((a, h) => a + E.comboCount(h), 0), [range]);
    const legend = t('prob.matrix.legend');
    const cellColor = h => {
      if (!range.has(h)) return 'var(--surface-overlay)';
      const rk = E.HAND_RANK[h] == null ? 168 : E.HAND_RANK[h];
      if (rk < 15) return 'var(--s1)';
      if (rk < 45) return 'color-mix(in srgb,var(--s1) 72%,var(--surface))';
      if (rk < 90) return 'color-mix(in srgb,var(--s3) 70%,var(--surface))';
      return 'color-mix(in srgb,var(--s2) 55%,var(--surface))';
    };
    return html`<div class="panel" style=${{ display: 'grid', gap: '18px' }}>
      <div style=${{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.15rem' }}>${t('prob.matrix.title')}</h2>
        <span class="hint">${t('prob.matrix.sub')}</span>
      </div>
      <div style=${{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <${Tabs} items=${P.map(x => ({ id: x.k, name: x.k }))} value=${pos} onChange=${setPos} label=${t('prob.matrix.position')} />
        <div style=${{ flex: '1 1 220px', minWidth: '190px' }}>
          <div class="slider-row"><span class="field-label" style=${{ marginBottom: 0 }}>${t('prob.matrix.aggr')}</span>
            <span class="slider-val">${aggr < 0.9 ? t('prob.matrix.conservative') : aggr > 1.15 ? t('prob.matrix.aggressive') : t('prob.matrix.standard')}</span></div>
          <input type="range" min="0.6" max="1.6" step="0.05" value=${aggr} aria-label=${t('prob.matrix.aggr')} onInput=${e => setAggr(+e.target.value)} />
        </div>
        <div class="tile" style=${{ minWidth: '155px' }}>
          <div class="hint">${t('prob.matrix.range')}</div>
          <div class="mono" style=${{ color: 'var(--gold)', fontSize: '1.2rem' }}>${I.pct(pctv, 0)}</div>
          <div class="hint">${t('prob.matrix.combos', { n: combos })}</div>
        </div>
      </div>
      <div class="scroll-x">
        <div class="m169" role="grid" aria-label=${t('prob.matrix.title')}>
          ${Array.from({ length: 13 }, (_, i) => Array.from({ length: 13 }, (_, j) => {
            const h = E.handLabel(i, j), inR = range.has(h);
            return html`<button key=${h} class=${inR ? 'in' : ''} style=${{ background: cellColor(h) }}
              onMouseEnter=${() => setHover(h)} onFocus=${() => setHover(h)} onMouseLeave=${() => setHover(null)}
              aria-label=${h + ': ' + (inR ? t('prob.matrix.inRange', { pos: pos }) : t('prob.matrix.outRange', { pos: pos }))}>${h}</button>`;
          }))}
        </div>
      </div>
      <div class="tile" style=${{ minHeight: '76px' }}>
        ${hover ? html`<div style=${{ display: 'grid', gap: '5px' }}>
          <div style=${{ display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <strong class="mono" style=${{ fontSize: '1.1rem', color: 'var(--gold)' }}>${hover}</strong>
            <span class="pill">${t('prob.matrix.comboCount', { n: E.comboCount(hover) })}</span>
            <span class="pill">${t('prob.matrix.rank', { n: (E.HAND_RANK[hover] == null ? 168 : E.HAND_RANK[hover]) + 1 })}</span>
            <span class=${'pill ' + (range.has(hover) ? 'pill--neon' : '')}>
              ${range.has(hover) ? t('prob.matrix.inRange', { pos: pos }) : t('prob.matrix.outRange', { pos: pos })}</span>
          </div>
          <span class="hint">${hover.length === 2 ? t('prob.matrix.pairNote')
            : hover.endsWith('s') ? t('prob.matrix.suitedNote') : t('prob.matrix.offNote')}</span>
        </div>` : html`<span class="hint">${t('prob.matrix.hoverHint')}</span>`}
      </div>
      <${Legend} items=${[{ label: legend[0], color: 'var(--s1)' },
        { label: legend[1], color: 'color-mix(in srgb,var(--s3) 70%,var(--surface))' },
        { label: legend[2], color: 'color-mix(in srgb,var(--s2) 55%,var(--surface))' },
        { label: legend[3], color: 'var(--surface-overlay)' }]} />
    </div>`;
  }

  function OddsCompare() {
    const rows = t('prob.comp.rows');
    const vals = [0.543, 0.350, 0.315, 0.323, 0.165, 0.118, 0.0045];
    return html`<div class="panel" style=${{ display: 'grid', gap: '16px' }}>
      <div>
        <h2 style=${{ fontSize: '1.15rem', marginBottom: '4px' }}>${t('prob.comp.title')}</h2>
        <p class="hint">${t('prob.comp.sub')}</p>
      </div>
      <div style=${{ display: 'grid', gap: '13px' }}>
        ${rows.map((r, i) => html`<${BarRow} key=${r} label=${r} value=${vals[i]} display=${I.pct(vals[i], vals[i] < 0.01 ? 2 : 1)}
          color=${vals[i] > 0.33 ? 'var(--s1)' : vals[i] > 0.15 ? 'var(--s3)' : 'var(--s2)'} />`)}
      </div>
      <p class="hint">${t('prob.comp.note')}</p>
    </div>`;
  }

  function Probabilidad() {
    return html`<section class="sec sec--felt" id="probabilidad">
      <div class="shell" style=${{ position: 'relative' }}>
        <${SectionHead} n="08" eyebrow=${t('prob.eyebrow')} title=${t('prob.title')} lede=${t('prob.lede')} />
        <div style=${{ display: 'grid', gap: '26px' }}>
          <${Reveal}><${EquityCalculator} /><//>
          <${Reveal}><${PotOdds} /><//>
          <${Reveal}><${U.Cita} id="F07" /><//>
          <${Reveal}><${RangeMatrix} /><//>
          <${Reveal}><${OddsCompare} /><//>
          <${Reveal}><${U.Cita} id="F02" /><//>
        </div>
      </div>
    </section>`;
  }

  /* ==========================================================================
     8 · RECURSOS
     ========================================================================= */
  function SheetContent({ id }) {
    if (id === 'ranges') {
      const range = E.rangeForPct(0.46);
      return html`<div style=${{ display: 'grid', gap: '12px' }}>
        <p style=${{ color: 'var(--ink-2)' }}>${t('rec.sheets.rangesIntro')}</p>
        <div class="scroll-x"><div class="m169">
          ${Array.from({ length: 13 }, (_, i) => Array.from({ length: 13 }, (_, j) => {
            const h = E.handLabel(i, j), inR = range.has(h);
            return html`<button key=${h} class=${inR ? 'in' : ''} style=${{ background: inR ? 'var(--s1)' : 'var(--surface-overlay)' }}>${h}</button>`;
          }))}
        </div></div>
        <div style=${{ display: 'grid', gap: '6px' }}>
          ${L().POSITIONS.map(p => html`<div key=${p.k} style=${{ display: 'flex', justifyContent: 'space-between',
            borderBottom: '1px solid var(--line)', padding: '6px 0', fontSize: '1rem' }}>
            <span><strong class="mono">${p.k}</strong> · ${p.name}</span>
            <span class="mono" style=${{ color: 'var(--gold)' }}>${I.pct(p.open, 0)}</span></div>`)}
        </div>
      </div>`;
    }
    if (id === 'odds') {
      const cols = t('rec.sheets.oddsCols');
      return html`<div style=${{ display: 'grid', gap: '12px' }}>
        <p style=${{ color: 'var(--ink-2)' }}>${t('rec.sheets.oddsIntro')}</p>
        <div class="scroll-x"><table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
          <thead><tr>${cols.map(h => html`<th key=${h} style=${{ textAlign: 'left', padding: '8px',
            borderBottom: '1px solid var(--line)', color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: '.72rem',
            textTransform: 'uppercase', letterSpacing: '.1em' }}>${h}</th>`)}</tr></thead>
          <tbody>${[1,2,3,4,5,6,7,8,9,10,12,15].map(o => {
            const two = E.outsOdds(o, 2), one = E.outsOdds(o, 1), maxBet = (100 * two) / (1 - 2 * two);
            return html`<tr key=${o}>
              <td class="mono" style=${{ padding: '7px 8px', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>${o}</td>
              <td class="mono" style=${{ padding: '7px 8px', borderBottom: '1px solid var(--line)' }}>${I.pct(two)}</td>
              <td class="mono" style=${{ padding: '7px 8px', borderBottom: '1px solid var(--line)' }}>${I.pct(one)}</td>
              <td class="mono" style=${{ padding: '7px 8px', borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                ${two >= 0.5 ? t('rec.sheets.any') : I.num(Math.round(maxBet))}</td></tr>`;
          })}</tbody>
        </table></div>
      </div>`;
    }
    if (id === 'pos') {
      return html`<div style=${{ display: 'grid', gap: '10px' }}>
        ${L().POSITIONS.map(p => html`<div key=${p.k} class="tile">
          <div style=${{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: '4px' }}>
            <strong class="mono" style=${{ color: 'var(--gold)' }}>${p.k}</strong>
            <strong style=${{ fontFamily: 'var(--f-display)' }}>${p.name}</strong>
            <span class="pill" style=${{ marginLeft: 'auto' }}>${t('reglas.opens', { pct: I.pct(p.open, 0) })}</span>
          </div>
          <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${p.text}</p>
        </div>`)}
      </div>`;
    }
    return html`<div style=${{ display: 'grid', gap: '10px' }}>
      ${L().MENTAL.map(m => html`<div key=${m.id} class="tile">
        <strong style=${{ fontFamily: "var(--f-display)", display: "flex", gap: "8px", alignItems: "center" }}><${U.Icon} name=${m.icon} size=${16} />${m.name}</strong>
        <div style=${{ display: 'grid', gap: '5px', marginTop: '7px' }}>
          ${m.tips.map((x, i) => html`<label key=${i} style=${{ display: 'flex', gap: '9px', fontSize: '1rem',
            color: 'var(--ink-2)', alignItems: 'flex-start' }}>
            <input type="checkbox" style=${{ width: 'auto', marginTop: '4px' }} />${U.plain(x)}</label>`)}
        </div>
      </div>`)}
    </div>`;
  }

  function Quiz() {
    const Q = L().QUIZ;
    const [i, setI] = useState(0);
    const [pick, setPick] = useState(null);
    const [ok, setOk] = useState(0);
    const [end, setEnd] = useState(false);
    const q = Q[i % Q.length];
    const restart = () => { setI(0); setPick(null); setOk(0); setEnd(false); };
    useEffect(restart, [I.code]);
    if (end) {
      const p = Math.round((ok / Q.length) * 100);
      return html`<div class="panel" style=${{ display: 'grid', gap: '14px', textAlign: 'center', placeItems: 'center' }}>
        <span class="eyebrow">${t('rec.quiz.result')}</span>
        <${Stat} display=${ok + '/' + Q.length} tone=${p >= 83 ? 'pos' : p >= 50 ? 'warn' : 'neg'} arrow=${false} />
        <p style=${{ color: 'var(--ink-2)', maxWidth: '46ch' }}>${p >= 83 ? t('rec.quiz.v1') : p >= 50 ? t('rec.quiz.v2') : t('rec.quiz.v3')}</p>
        <button class="btn btn-gold btn-sm" onClick=${restart}>${t('rec.quiz.again')}</button>
      </div>`;
    }
    return html`<div class="panel" style=${{ display: 'grid', gap: '14px' }}>
      <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style=${{ fontSize: '1.1rem' }}>${t('rec.quiz.title')}</h2>
        <span class="pill">${i + 1}/${Q.length}</span>
        <span style=${{ marginLeft: 'auto' }}><${Stat} display=${t('rec.quiz.hits', { n: ok })}
          tone=${ok === 0 ? 'neutral' : 'pos'} arrow=${false} /></span>
      </div>
      <div class="bar-track" style=${{ height: '5px' }}>
        <div class="bar-fill" style=${{ width: (i / Q.length) * 100 + '%', background: 'var(--gold)' }}></div></div>
      <strong style=${{ fontFamily: 'var(--f-display)', fontSize: '1.02rem' }}>${q.q}</strong>
      <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '8px' }}>
        ${q.a.map((o, k) => {
          const shown = pick !== null;
          const bg = !shown ? 'var(--surface-raised)' : k === q.c ? 'color-mix(in srgb,var(--good) 22%,transparent)'
                   : k === pick ? 'color-mix(in srgb,var(--bad) 20%,transparent)' : 'var(--surface-raised)';
          return html`<button key=${k} disabled=${shown}
            onClick=${() => { if (pick !== null) return; setPick(k); if (k === q.c) { setOk(ok + 1); sound.play('ding'); } else sound.play('err'); }}
            style=${{ background: bg, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '11px',
              color: 'var(--ink)', cursor: shown ? 'default' : 'pointer', fontSize: '1rem', textAlign: 'left' }}>${o}</button>`;
        })}
      </div>
      ${pick !== null && html`<div class="tile" style=${{ borderLeft: '3px solid ' + (pick === q.c ? 'var(--good)' : 'var(--bad)'),
        display: 'grid', gap: '9px' }}>
        <span style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${q.why}</span>
        <button class="btn btn-gold btn-sm" style=${{ justifySelf: 'start' }}
          onClick=${() => { if (i === Q.length - 1) setEnd(true); else { setPick(null); setI(i + 1); } }}>
          ${i === Q.length - 1 ? t('rec.quiz.see') : t('rec.quiz.next')}</button>
      </div>`}
    </div>`;
  }

  function Recursos() {
    const S = L().SHEETS;
    const [open, setOpen] = useState(null);
    const [counts, setCounts] = useState(() => Object.fromEntries(S.map(s => [s.id, s.downloads])));
    const [busy, setBusy] = useState(null);
    const sheet = open && S.find(s => s.id === open);
    const openSheet = id => {
      setBusy(id);
      setTimeout(() => { setBusy(null); setOpen(id); setCounts(c => ({ ...c, [id]: c[id] + 1 })); sound.play('ding'); }, 480);
    };
    return html`<section class="sec" id="recursos">
      <div class="shell">
        <${SectionHead} n="09" eyebrow=${t('rec.eyebrow')} title=${t('rec.title')} lede=${t('rec.lede')} />
        <div style=${{ display: 'grid', gap: '22px' }}>
          <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
            ${S.map((s, i) => html`<${Reveal} key=${s.id} delay=${i * 60}>
              <div class="node" style=${{ height: '100%' }}>
                <span class="node-ico"><${U.Icon} name=${s.icon} size=${20} /></span>
                <strong style=${{ fontFamily: 'var(--f-display)' }}>${s.name}</strong>
                <span style=${{ fontSize: '1rem', color: 'var(--ink-2)', flex: 1 }}>${s.desc}</span>
                <div style=${{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button class="btn btn-gold btn-sm" onClick=${() => openSheet(s.id)} disabled=${busy === s.id}>
                    ${busy === s.id ? html`<${React.Fragment}><${Spinner} /> ${t('common.loading')}<//>` : t('rec.open')}</button>
                  <span class="hint mono">${t('rec.opens', { n: I.num(counts[s.id]) })}</span>
                </div>
              </div>
            <//>`)}
          </div>
          <${Reveal}><${Quiz} /><//>
        </div>
      </div>
      <${Modal} open=${!!open} onClose=${() => setOpen(null)} wide=${true} title=${sheet ? sheet.name : ''} sub=${t('rec.sheetSub')}>
        ${sheet && html`<${React.Fragment}>
          <${SheetContent} id=${sheet.id} />
          <div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} class="no-print">
            <button class="btn btn-gold btn-sm" onClick=${() => window.print()}>${t('rec.print')}</button>
            <button class="btn btn-ghost btn-sm" onClick=${() => setOpen(null)}>${t('common.close')}</button>
          </div>
        <//>`}
      <//>
    </section>`;
  }

  /* ==========================================================================
     9 · CASOS
     ========================================================================= */
  function Casos() {
    const C = L().CASES;
    const [i, setI] = useState(0);
    const [play, setPlay] = useState(true);
    const n = C.length;
    useEffect(() => {
      if (!play || U.reduceMotion()) return;
      const id = setInterval(() => setI(x => (x + 1) % n), 5600);
      return () => clearInterval(id);
    }, [play, n]);
    return html`<section class="sec" id="casos">
      <div class="shell">
        <${SectionHead} n="10" eyebrow=${t('casos.eyebrow')} title=${t('casos.title')} lede=${t('casos.lede')} />
        <${Reveal} className="panel">
          <div onMouseEnter=${() => setPlay(false)} onMouseLeave=${() => setPlay(true)}
               onFocus=${() => setPlay(false)} onBlur=${() => setPlay(true)}>
            <div class="carousel" aria-live="polite">
              <div class="carousel-track" style=${{ transform: `translateX(-${i * 100}%)` }}>
                ${C.map((c, k) => html`<div key=${c.id} class="slide" aria-hidden=${k !== i}>
                  <div style=${{ display: 'grid', gap: '15px', maxWidth: '66ch' }}>
                    <div class="case-head">
                      <span class="case-av" aria-hidden="true">${c.avatar}</span>
                      <div>
                        <div style=${{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: '1.05rem' }}>${c.name}</div>
                        <div class="hint mono">${c.when}</div>
                      </div>
                      <span class="pill pill--gold" style=${{ marginLeft: 'auto' }}>${c.pillar}</span>
                    </div>
                    <h2 style=${{ fontSize: 'clamp(1.1rem,2.2vw,1.35rem)', lineHeight: 1.3 }}>${c.title}</h2>
                    <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${c.fact}</p>
                    <div class="tile" style=${{ borderLeft: '3px solid var(--neon)' }}>
                      <span class="eyebrow" style=${{ marginBottom: '6px' }}>${t('casos.lesson')}</span>
                      <span style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${c.lesson}</span>
                    </div>
                    <span class="hint">${t('casos.source')}: ${c.source}</span>
                  </div>
                </div>`)}
              </div>
            </div>
            <div style=${{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
              <button class="icon-btn" onClick=${() => setI((i - 1 + n) % n)} aria-label=${t('casos.prev')}><${U.Icon} name='arrowL' size=${16} /></button>
              <button class="icon-btn" onClick=${() => setI((i + 1) % n)} aria-label=${t('casos.next')}><${U.Icon} name='arrowR' size=${16} /></button>
              <div class="dots" style=${{ marginInline: 'auto' }}>
                ${C.map((c, k) => html`<button key=${c.name} aria-current=${k === i}
                  aria-label=${t('casos.goTo', { n: k + 1 })} onClick=${() => setI(k)}></button>`)}
              </div>
              <button class="icon-btn" onClick=${() => setPlay(!play)} aria-pressed=${play}
                aria-label=${play ? t('common.pause') : t('common.play')}><${U.Icon} name=${play ? 'pause' : 'arrowR'} size=${15} /></button>
            </div>
          </div>
        <//>
        <${Reveal}>
          <p class="cita-lead">${t('ent.lead2')}</p>
          <${U.Cita} id="F17" />
        <//>
      </div>
    </section>`;
  }

  /* ==========================================================================
     10 · VOCABULARIO
     ========================================================================= */
  function Vocabulario() {
    const G = L().GLOSSARY;
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('all');
    const [open, setOpen] = useState(G[0] ? G[0].id : null);
    const cats = t('voc.cats');
    const keys = ['basico', 'apuestas', 'mates', 'mental', 'datos'];
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const list = G.filter(g => (cat === 'all' || g.cat === cat) &&
      (!q.trim() || norm(g.term + ' ' + g.short + ' ' + g.def).includes(norm(q.trim()))));

    return html`<section class="sec" id="vocabulario">
      <div class="shell">
        <${SectionHead} n="11" eyebrow=${t('voc.eyebrow')} title=${t('voc.title')} lede=${t('voc.lede')} />
        <div style=${{ display: 'grid', gap: '18px' }}>
          <${Reveal}>
            <div style=${{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style=${{ flex: '1 1 240px' }}>
                <label class="sr-only" htmlFor="vocq">${t('voc.searchLabel')}</label>
                <input id="vocq" type="text" placeholder=${t('voc.search')} value=${q} onInput=${e => setQ(e.target.value)} />
              </div>
              <span class="hint mono">${t('voc.count', { n: list.length })}</span>
            </div>
          <//>
          <${Reveal} delay=${60}>
            <div class="voc-tags">
              <button class="chipfilter" aria-pressed=${cat === 'all'} onClick=${() => setCat('all')}>${t('voc.all')}</button>
              ${keys.map(k => html`<button key=${k} class="chipfilter" aria-pressed=${cat === k} onClick=${() => setCat(k)}>${cats[k]}</button>`)}
            </div>
          <//>
          <div class="voc">
            ${list.length === 0 && html`<p class="hint">${t('voc.none')}</p>`}
            ${list.map(g => html`<div key=${g.id} class="voc-item">
              <button class="voc-head" aria-expanded=${open === g.id} onClick=${() => { setOpen(open === g.id ? null : g.id); sound.play('chip'); }}>
                <span class="voc-term">${g.term}</span>
                <span class="pill">${cats[g.cat]}</span>
                <span class="hint" style=${{ flex: 1, minWidth: '120px' }}>${g.short}</span>
                <span aria-hidden="true" style=${{ color: 'var(--gold)', transition: 'transform .3s',
                  transform: open === g.id ? "rotate(45deg)" : "none" }}><${U.Icon} name="plus" size=${16} /></span>
              </button>
              ${open === g.id && html`<div class="voc-body">
                <p style=${{ color: 'var(--ink-2)', fontSize: '1rem', maxWidth: 'var(--read)' }}>${g.def}</p>
                <div class="voc-ex">
                  <span class="eyebrow" style=${{ marginBottom: '5px' }}>${t('voc.example')}</span>${g.ex}
                </div>
              </div>`}
            </div>`)}
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ==========================================================================
     FOOTER
     ========================================================================= */
  function Footer({ go, onPrivacy }) {
    const [mail, setMail] = useState('');
    const [err, setErr] = useState(null);
    const [sent, setSent] = useState(false);
    const groups = t('footer.groups');
    const submit = e => {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(mail.trim())) { setErr(t('footer.mailError')); sound.play('err'); return; }
      setErr(null); setSent(true); toast(t('footer.mailOk'), 'ok');
    };
    return html`<footer style=${{ borderTop: '1px solid var(--line)', background: 'var(--surface)', paddingTop: '54px' }}>
      <div class="shell" style=${{ display: 'grid', gap: '34px', paddingBottom: '34px' }}>
        <div class="grid" style=${{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '34px' }}>
          <div style=${{ display: 'grid', gap: '14px', maxWidth: '40ch' }}>
            <span class="brand"><span class="pip" aria-hidden="true">♠</span>PokerMind</span>
            <p style=${{ color: 'var(--ink-2)', fontSize: '1rem' }}>${t('footer.about')}</p>
            <form onSubmit=${submit} style=${{ display: 'grid', gap: '9px' }} noValidate>
              <label class="field-label" htmlFor="mail">${t('footer.newsletter')}</label>
              <div style=${{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input id="mail" type="email" placeholder=${t('footer.placeholder')} value=${mail} required
                  aria-invalid=${!!err} aria-describedby=${err ? 'mail-err' : undefined}
                  onInput=${e => { setMail(e.target.value); setErr(null); }} style=${{ flex: '1 1 180px' }} />
                <button class="btn btn-gold btn-sm" type="submit">${sent ? t('footer.subscribed') : t('footer.subscribe')}</button>
              </div>
              ${err && html`<span id="mail-err" role="alert" style=${{ color: 'var(--bad)', fontSize: '.82rem' }}>${err}</span>`}
              <span class="hint" style=${{ fontSize: '.76rem' }}>${t('footer.demo')}</span>
            </form>
          </div>
          ${L().FOOTER_LINKS.map(g => html`<div key=${g.group} style=${{ display: 'grid', gap: '10px', alignContent: 'start' }}>
            <span class="eyebrow">${groups[g.group]}</span>
            ${g.items.map(it => html`<a key=${it.t} href=${it.href || '#' + it.tab}
              target=${it.href ? '_blank' : undefined} rel=${it.href ? 'noopener noreferrer' : undefined}
              onClick=${it.href ? undefined : (e => { e.preventDefault(); go(it.tab); })}
              style=${{ color: 'var(--ink-2)', textDecoration: 'none', fontSize: '1rem' }}>
              ${it.t}${it.href ? html`<span aria-hidden="true" style=${{ opacity: .6 }}> ↗</span>` : ''}</a>`)}
          </div>`)}
        </div>
        <div class="tile" style=${{ borderLeft: '3px solid var(--warn)' }}>
          <strong style=${{ fontFamily: 'var(--f-display)', display: 'block', marginBottom: '5px' }}>${t('footer.responsibleTitle')}</strong>
          <p style=${{ fontSize: '1rem', color: 'var(--ink-2)' }}>${t('footer.responsibleText')}</p>
        </div>
        <div style=${{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center',
          borderTop: '1px solid var(--line)', paddingTop: '20px', fontSize: '.82rem', color: 'var(--ink-3)' }}>
          <span>${t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span style=${{ display: 'flex', gap: '14px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <span>${t('footer.terms')}</span><span>${t('footer.privacy')}</span><span>${t('footer.legal')}</span>
            <button type="button" onClick=${() => onPrivacy && onPrivacy()}
              style=${{ background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit',
                        color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              ${t('consent.open')}</button>
            <span class="mono">+18</span>
          </span>
        </div>
        ${/* Mentre les dades no estiguin posades (van entre claudàtors), el
             bloc d'autoria no es mostra: val més buit que a mitges. */
          String(t('ent.credit.who')).indexOf('[') !== 0 && html`<div class="foot-tr">
          <strong>${t('ent.credit.who')}</strong>
          <span>${t('ent.credit.work')}${String(t('ent.credit.school')).indexOf('[') === 0 ? '' : ' · ' + t('ent.credit.school')}</span>
          ${String(t('ent.credit.year')).indexOf('[') !== 0 && html`<span>${t('ent.credit.year')}</span>`}
        </div>`}
      </div>
    </footer>`;
  }

  Object.assign(window.PM_SEC, { Mental, Psicologia, Probabilidad, Recursos, Casos, Vocabulario, Footer });
})();
