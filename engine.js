/* ============================================================================
   POKERMIND · Motor de cálculo
   Evaluador de 7 cartas, equity por Monte Carlo, pot odds y varianza.
   Sin dependencias: todo se calcula en el navegador.
   ========================================================================== */
window.PM = (function () {
  'use strict';

  const RANKS  = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  const R_CHAR = { 2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'T',11:'J',12:'Q',13:'K',14:'A' };
  const CHAR_R = Object.fromEntries(Object.entries(R_CHAR).map(([k,v]) => [v, +k]));
  const SUITS  = ['s','h','d','c'];                    // picas, corazones, diamantes, tréboles
  const SUIT_GLYPH = { s:'♠', h:'♥', d:'♦', c:'♣' };
  const SUIT_NAME  = { s:'picas', h:'corazones', d:'diamantes', c:'tréboles' };

  /* Una carta es un entero 0..51 -> rank = 2 + (i >> 2), suit = i & 3.
     Trabajar con enteros hace el Monte Carlo unas 4x más rápido que con objetos. */
  const card  = (rank, suit) => ((rank - 2) << 2) | suit;
  const rankOf = c => 2 + (c >> 2);
  const suitOf = c => c & 3;
  const cardStr = c => R_CHAR[rankOf(c)] + SUITS[suitOf(c)];
  const isRed   = c => suitOf(c) === 1 || suitOf(c) === 2;

  function parseCard(str) {                            // "As" -> entero
    if (!str || str.length < 2) return null;
    const r = CHAR_R[str[0].toUpperCase()], s = SUITS.indexOf(str[1].toLowerCase());
    return (r == null || s < 0) ? null : card(r, s);
  }
  const fullDeck = () => Array.from({ length: 52 }, (_, i) => i);

  /* --- Evaluador de 5 entre 7 ---------------------------------------------
     Devuelve un entero comparable: categoría * 15^5 + desempates en base 15. */
  /* Las categorías se numeran 0-8; el nombre visible lo pone PM_I18N. */
  const P = [759375, 50625, 3375, 225, 15, 1];          // 15^5 … 15^0

  function straightHigh(mask) {                         // mask de rangos -> carta alta o 0
    if (mask & (1 << 14)) mask |= 2;                    // as bajo para A-2-3-4-5
    for (let hi = 14; hi >= 5; hi--) {
      if (((mask >> (hi - 4)) & 0b11111) === 0b11111) return hi;
    }
    return 0;
  }

  function evaluate7(cards) {
    const rc = new Uint8Array(15), sc = new Uint8Array(4), sMask = new Int32Array(4);
    let mask = 0;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i], r = rankOf(c), s = suitOf(c);
      rc[r]++; sc[s]++; sMask[s] |= 1 << r; mask |= 1 << r;
    }
    /* Color y escalera de color */
    for (let s = 0; s < 4; s++) {
      if (sc[s] >= 5) {
        const sf = straightHigh(sMask[s]);
        if (sf) return 8 * P[0] + sf * P[1];
        const top = [];
        for (let r = 14; r >= 2 && top.length < 5; r--) if (sMask[s] & (1 << r)) top.push(r);
        return 5 * P[0] + top[0]*P[1] + top[1]*P[2] + top[2]*P[3] + top[3]*P[4] + top[4]*P[5];
      }
    }
    /* Agrupación por repeticiones */
    let quad = 0, trips = [], pairs = [];
    for (let r = 14; r >= 2; r--) {
      if (rc[r] === 4) quad = r;
      else if (rc[r] === 3) trips.push(r);
      else if (rc[r] === 2) pairs.push(r);
    }
    const kickers = (exclude, n) => {
      const out = [];
      for (let r = 14; r >= 2 && out.length < n; r--) if (rc[r] && !exclude.includes(r)) out.push(r);
      return out;
    };
    if (quad) { const k = kickers([quad], 1); return 7*P[0] + quad*P[1] + k[0]*P[2]; }
    if (trips.length >= 2) return 6*P[0] + trips[0]*P[1] + trips[1]*P[2];
    if (trips.length === 1 && pairs.length) return 6*P[0] + trips[0]*P[1] + pairs[0]*P[2];
    const st = straightHigh(mask);
    if (st) return 4*P[0] + st*P[1];
    if (trips.length === 1) { const k = kickers([trips[0]], 2); return 3*P[0] + trips[0]*P[1] + k[0]*P[2] + k[1]*P[3]; }
    if (pairs.length >= 2) { const k = kickers([pairs[0], pairs[1]], 1); return 2*P[0] + pairs[0]*P[1] + pairs[1]*P[2] + k[0]*P[3]; }
    if (pairs.length === 1) { const k = kickers([pairs[0]], 3); return 1*P[0] + pairs[0]*P[1] + k[0]*P[2] + k[1]*P[3] + k[2]*P[4]; }
    const k = kickers([], 5);
    return 0*P[0] + k[0]*P[1] + k[1]*P[2] + k[2]*P[3] + k[3]*P[4] + k[4]*P[5];
  }

  const categoryOf = score => Math.floor(score / P[0]);

  /* El nombre legible de la mano lo pone el módulo de idiomas. */
  const describe = score => window.PM_I18N.handName(score);

  /* --- Monte Carlo de equity -----------------------------------------------
     hands: [[c,c], …] (Texas Hold'em) · board: [] … 5 cartas
     Se ejecuta por bloques para no bloquear el hilo principal. */
  function equityRunner(hands, board, iters, onTick, onDone) {
    const nP = hands.length;
    const win = new Float64Array(nP), tie = new Float64Array(nP);
    const dead = new Set([...board, ...hands.flat()]);
    const deck = fullDeck().filter(c => !dead.has(c));
    const need = 5 - board.length;
    const seven = new Array(7);
    let done = 0, cancelled = false;

    function block(n) {
      const pool = deck.slice();
      for (let it = 0; it < n; it++) {
        /* Fisher-Yates parcial: solo barajamos las cartas que necesitamos */
        for (let i = 0; i < need; i++) {
          const j = i + ((Math.random() * (pool.length - i)) | 0);
          const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
        }
        let best = -1, bestCount = 0;
        const scores = new Array(nP);
        for (let p = 0; p < nP; p++) {
          seven[0] = hands[p][0]; seven[1] = hands[p][1];
          for (let b = 0; b < board.length; b++) seven[2 + b] = board[b];
          for (let b = 0; b < need; b++) seven[2 + board.length + b] = pool[b];
          const sc = evaluate7(seven);
          scores[p] = sc;
          if (sc > best) { best = sc; bestCount = 1; } else if (sc === best) bestCount++;
        }
        for (let p = 0; p < nP; p++) {
          if (scores[p] === best) { if (bestCount === 1) win[p]++; else tie[p] += 1 / bestCount; }
        }
      }
      done += n;
    }

    function result() {
      return hands.map((_, p) => ({
        win: win[p] / done, tie: tie[p] / done,
        equity: (win[p] + tie[p]) / done, lose: 1 - (win[p] + tie[p]) / done
      }));
    }

    function step() {
      if (cancelled) return;
      block(Math.min(2500, iters - done));
      if (done >= iters) { onDone && onDone(result(), done); return; }
      onTick && onTick(done / iters, result());
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return { cancel() { cancelled = true; } };
  }

  /* --- Odds de proyecto ---------------------------------------------------- */
  /* unseen: 47 tras el flop (52 - 2 propias - 3 del tablero), 46 tras el turn. */
  function outsOdds(outs, toCome, unseen) {
    unseen = unseen || (toCome === 2 ? 47 : 46);
    if (toCome === 2) return 1 - ((unseen - outs) / unseen) * ((unseen - 1 - outs) / (unseen - 1));
    return outs / unseen;
  }
  /* Equity mínima que hace rentable pagar: call / (bote + apuesta + call) */
  const requiredEquity = (toCall, pot) => toCall / (pot + toCall);
  const potOddsRatio   = (toCall, pot) => pot / toCall;

  /* --- Manos iniciales: combinatoria y rangos ------------------------------ */
  const comboCount = h => h.length === 2 ? 6 : (h.endsWith('s') ? 4 : 12);   // pareja / suited / offsuit
  const HAND_RANK = (() => {
    const m = {};
    window.PM_CORE.HAND_ORDER.forEach((h, i) => { m[h] = i; });
    return m;
  })();
  const TOTAL_COMBOS = 1326;

  /* Devuelve el conjunto de manos que entran en el X% superior de combinaciones. */
  function rangeForPct(pct) {
    const target = TOTAL_COMBOS * Math.max(0, Math.min(1, pct));
    const set = new Set();
    let acc = 0;
    for (const h of window.PM_CORE.HAND_ORDER) {
      if (acc >= target) break;
      set.add(h); acc += comboCount(h);
    }
    return set;
  }
  function handLabel(i, j) {                 // celda (fila, col) de la matriz 13x13
    const order = 'AKQJT98765432';
    const a = order[i], b = order[j];
    if (i === j) return a + b;
    return i < j ? a + b + 's' : b + a + 'o';
  }

  /* --- Varianza y bankroll -------------------------------------------------- */
  function gauss() {                                    // Box-Muller
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  /* Simula trayectorias de bankroll en bloques de 100 manos. */
  function simulate(winrate, stdev, hands, trials, startBB) {
    const blocks = Math.max(1, Math.round(hands / 100));
    const paths = [];
    let busted = 0;
    for (let t = 0; t < trials; t++) {
      let bb = startBB; const path = [bb]; let dead = false;
      for (let b = 0; b < blocks; b++) {
        bb += winrate + stdev * gauss();
        if (bb <= 0 && !dead) { dead = true; busted++; bb = 0; }
        path.push(bb);
      }
      paths.push(path);
    }
    return { paths, bustRate: busted / trials, blocks };
  }
  /* Riesgo de ruina analítico (aproximación de difusión). */
  function riskOfRuin(winrate, stdev, bankrollBB) {
    if (winrate <= 0) return 1;
    return Math.min(1, Math.exp(-2 * winrate * bankrollBB / (stdev * stdev)));
  }

  /* --- Utilidades ----------------------------------------------------------- */
  const pct = (x, d) => (x * 100).toFixed(d == null ? 1 : d) + '%';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  return { RANKS, R_CHAR, SUITS, SUIT_GLYPH, SUIT_NAME, card, rankOf, suitOf, cardStr, isRed, parseCard,
           fullDeck, evaluate7, describe, categoryOf, equityRunner, outsOdds,
           requiredEquity, potOddsRatio, comboCount, HAND_RANK, rangeForPct, handLabel,
           simulate, riskOfRuin, pct, clamp, shuffle };
})();
