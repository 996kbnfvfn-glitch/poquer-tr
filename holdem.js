/* ============================================================================
   POKERMIND · Motor de Texas Hold'em
   Máquina de estados de una mano completa: ciegas, rondas de apuestas,
   subidas mínimas, all-in con botes paralelos, showdown y reparto.
   El estado es un objeto mutable: la interfaz lo lee y pide pasos.
   ========================================================================== */
window.PM_GAME = (function () {
  'use strict';
  const E = PM;

  const STREETS = ['preflop', 'flop', 'turn', 'river'];
  const STYLES = ['tag', 'lag', 'nit', 'random'];

  /* --- Creación ------------------------------------------------------------- */
  function createGame(opts) {
    const o = opts || {};
    const names = o.names || ['Tú', 'IA 1', 'IA 2'];
    const stack = o.stack || 2000;
    return {
      players: names.map((n, i) => ({
        id: i, name: n, human: i === 0 && o.human !== false,
        style: i === 0 && o.human !== false ? null : (o.styles && o.styles[i]) || STYLES[i % 3],
        stack: stack, cards: [], bet: 0, committed: 0, folded: false, allIn: false,
        acted: false, raiseSeen: 0, lastAction: null, out: false, won: 0
      })),
      sb: o.sb || 10, bb: o.bb || 20,
      button: -1, phase: 'idle', street: null,
      board: [], deck: [], pot: 0, currentBet: 0, lastRaise: 0, raiseCount: 0,
      toAct: -1, history: [], hand: 0, result: null, pots: [],
      stats: o.stats || { hands: 0, won: 0, showdowns: 0, showdownsWon: 0, vpip: 0, biggest: 0, netChips: 0 }
    };
  }

  const active = g => g.players.filter(p => !p.folded && !p.out);
  const canAct = g => g.players.filter(p => !p.folded && !p.allIn && !p.out && p.stack > 0);
  const nextIdx = (g, from) => {
    for (let k = 1; k <= g.players.length; k++) {
      const i = (from + k) % g.players.length;
      const p = g.players[i];
      if (!p.folded && !p.allIn && !p.out) return i;
    }
    return -1;
  };
  const potTotal = g => g.pot + g.players.reduce((a, p) => a + p.bet, 0);

  function log(g, playerId, action, amount, street) {
    g.history.push({ hand: g.hand, street: street || g.street, playerId, action, amount: amount || 0 });
  }

  /* --- Inicio de mano -------------------------------------------------------- */
  function startHand(g) {
    /* Quien se queda sin fichas deja de recibir cartas (salvo recompra en modo práctica). */
    g.players.forEach(p => { if (p.stack <= 0) p.out = true; });
    if (g.players.filter(p => !p.out).length < 2) { g.phase = 'over'; return g; }

    g.hand++;
    g.deck = E.shuffle(E.fullDeck());
    g.board = []; g.pot = 0; g.currentBet = 0; g.raiseCount = 0; g.result = null; g.pots = [];
    g.history = g.history.filter(h => h.hand > g.hand - 2);     /* solo la mano previa y la actual */
    g.players.forEach(p => {
      p.cards = []; p.bet = 0; p.committed = 0; p.folded = !!p.out; p.allIn = false;
      p.acted = false; p.raiseSeen = 0; p.lastAction = null; p.won = 0;
    });

    /* Botón: avanza al siguiente jugador con fichas */
    let b = g.button;
    do { b = (b + 1) % g.players.length; } while (g.players[b].out);
    g.button = b;

    const live = g.players.filter(p => !p.out);
    const heads = live.length === 2;
    /* En heads-up el botón es la ciega pequeña y habla primero preflop. */
    const sbIdx = heads ? g.button : nextSeat(g, g.button);
    const bbIdx = heads ? nextSeat(g, g.button) : nextSeat(g, sbIdx);
    g.sbIdx = sbIdx; g.bbIdx = bbIdx;

    postBlind(g, sbIdx, g.sb, 'sb');
    postBlind(g, bbIdx, g.bb, 'bb');
    g.currentBet = g.bb; g.lastRaise = g.bb;

    /* Dos cartas a cada jugador */
    live.forEach(p => { p.cards = [g.deck.pop(), g.deck.pop()]; });

    g.street = 'preflop'; g.phase = 'betting';
    g.toAct = heads ? sbIdx : nextIdx(g, bbIdx);
    g.stats.hands++;
    return g;
  }
  function nextSeat(g, from) {
    for (let k = 1; k <= g.players.length; k++) {
      const i = (from + k) % g.players.length;
      if (!g.players[i].out) return i;
    }
    return from;
  }
  function postBlind(g, i, amount, kind) {
    const p = g.players[i];
    const put = Math.min(amount, p.stack);
    p.stack -= put; p.bet += put; p.committed += put;
    if (p.stack === 0) p.allIn = true;
    log(g, p.id, kind, put, 'preflop');
  }

  /* --- Acciones legales ------------------------------------------------------ */
  function legal(g) {
    const p = g.players[g.toAct];
    if (!p || g.phase !== 'betting') return null;
    const toCall = Math.min(g.currentBet - p.bet, p.stack);
    const canCheck = g.currentBet - p.bet <= 0;
    /* Una subida corta por all-in no reabre la apuesta a quien ya actuó. */
    const reopened = !(p.acted && p.raiseSeen === g.raiseCount);
    const maxTo = p.bet + p.stack;
    const minRaiseTo = Math.min(maxTo, g.currentBet + Math.max(g.lastRaise, g.bb));
    return {
      player: p,
      canFold: true,
      canCheck,
      canCall: !canCheck && toCall > 0,
      callAmount: toCall,
      canBet: canCheck && p.stack > 0,
      canRaise: !canCheck && p.stack > toCall && reopened,
      minTo: canCheck ? Math.min(maxTo, g.bb) : minRaiseTo,
      maxTo: maxTo,
      potIfCall: potTotal(g) + toCall,
      stack: p.stack
    };
  }

  /* --- Aplicar una acción ----------------------------------------------------- */
  /* action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin'
     amount: para bet/raise es el total al que se sube (bet-to). */
  function act(g, action, amount) {
    const lg = legal(g);
    if (!lg) return g;
    const p = lg.player;

    if (action === 'fold') {
      p.folded = true; p.lastAction = 'fold'; log(g, p.id, 'fold');
    } else if (action === 'check') {
      if (!lg.canCheck) return g;
      p.lastAction = 'check'; log(g, p.id, 'check');
    } else if (action === 'call') {
      const put = Math.min(lg.callAmount, p.stack);
      p.stack -= put; p.bet += put; p.committed += put;
      if (p.stack === 0) p.allIn = true;
      p.lastAction = 'call'; log(g, p.id, 'call', put);
    } else if (action === 'bet' || action === 'raise' || action === 'allin') {
      let to = action === 'allin' ? lg.maxTo : Math.max(lg.minTo, Math.min(amount || lg.minTo, lg.maxTo));
      const put = to - p.bet;
      p.stack -= put; p.bet = to; p.committed += put;
      if (p.stack === 0) p.allIn = true;
      const increment = to - g.currentBet;
      if (to > g.currentBet) {
        /* Solo una subida completa reabre la ronda y actualiza el mínimo. */
        if (increment >= Math.max(g.lastRaise, g.bb) || p.allIn === false) {
          g.lastRaise = increment;
          g.raiseCount++;
          g.players.forEach(q => { if (q !== p) q.acted = false; });
        }
        g.currentBet = to;
      }
      p.lastAction = action === 'allin' ? 'allin' : (lg.canCheck ? 'bet' : 'raise');
      log(g, p.id, p.lastAction, put);
    }

    p.acted = true;
    p.raiseSeen = g.raiseCount;
    if (p.human && g.street === 'preflop' && ['call', 'bet', 'raise', 'allin'].includes(action)) g.stats.vpip++;
    advance(g);
    return g;
  }

  /* --- Avance de turno / calle ------------------------------------------------ */
  function roundComplete(g) {
    const live = g.players.filter(p => !p.folded && !p.out);
    if (live.length <= 1) return true;
    const actors = live.filter(p => !p.allIn);
    if (actors.length === 0) return true;
    /* Si solo queda uno por hablar y ya cubrió la apuesta, la ronda acabó. */
    return actors.every(p => p.acted && p.bet === g.currentBet);
  }

  function advance(g) {
    const live = g.players.filter(p => !p.folded && !p.out);
    if (live.length === 1) { finish(g); return; }
    if (!roundComplete(g)) {
      const n = nextIdx(g, g.toAct);
      if (n === -1) { nextStreet(g); return; }
      g.toAct = n;
      return;
    }
    nextStreet(g);
  }

  function collectBets(g) {
    g.players.forEach(p => { g.pot += p.bet; p.bet = 0; p.acted = false; p.raiseSeen = 0; });
    g.currentBet = 0; g.lastRaise = g.bb; g.raiseCount = 0;
  }

  function nextStreet(g) {
    collectBets(g);
    const i = STREETS.indexOf(g.street);
    const noMoreBetting = canAct(g).length <= 1;

    if (i >= STREETS.length - 1) { showdown(g); return; }
    g.street = STREETS[i + 1];
    if (g.street === 'flop') { g.deck.pop(); g.board.push(g.deck.pop(), g.deck.pop(), g.deck.pop()); }
    else { g.deck.pop(); g.board.push(g.deck.pop()); }
    g.players.forEach(p => { p.lastAction = null; });

    /* Si ya nadie puede apostar (all-in), se reparten las calles restantes. */
    if (noMoreBetting) { nextStreet(g); return; }
    g.phase = 'betting';
    g.toAct = nextIdx(g, g.button);           /* primero en hablar: a la izquierda del botón */
    if (g.toAct === -1) nextStreet(g);
  }

  /* --- Botes paralelos -------------------------------------------------------- */
  function buildPots(g) {
    const contributors = g.players.filter(p => p.committed > 0);
    const levels = [...new Set(contributors.map(p => p.committed))].sort((a, b) => a - b);
    const pots = [];
    let prev = 0;
    levels.forEach(lv => {
      const slice = contributors.filter(p => p.committed >= lv);
      const amount = (lv - prev) * slice.length;
      const eligible = slice.filter(p => !p.folded).map(p => p.id);
      if (amount > 0) {
        const last = pots[pots.length - 1];
        /* Botes con los mismos aspirantes se fusionan */
        if (last && last.key === eligible.join(',')) last.amount += amount;
        else pots.push({ amount, eligible, key: eligible.join(',') });
      }
      prev = lv;
    });
    return pots;
  }

  function finish(g) {                        /* todos se retiraron menos uno */
    collectBets(g);
    const winner = g.players.find(p => !p.folded && !p.out);
    g.pots = buildPots(g);
    const total = g.pot;
    winner.stack += total; winner.won = total;
    g.result = { type: 'fold', winners: [{ id: winner.id, amount: total, hand: null }], board: g.board.slice(), shown: [] };
    endHand(g, total);
  }

  function showdown(g) {
    g.pots = buildPots(g);
    const shown = g.players.filter(p => !p.folded && !p.out).map(p => ({
      id: p.id, cards: p.cards.slice(), score: E.evaluate7([...p.cards, ...g.board])
    }));
    const winners = [];
    g.pots.forEach(pot => {
      const cands = shown.filter(s => pot.eligible.includes(s.id));
      if (!cands.length) return;
      const best = Math.max(...cands.map(c => c.score));
      const ws = cands.filter(c => c.score === best);
      const share = Math.floor(pot.amount / ws.length);
      let odd = pot.amount - share * ws.length;
      ws.forEach((w, k) => {
        const p = g.players[w.id];
        const amt = share + (k === 0 ? odd : 0);   /* las fichas sueltas van al primero tras el botón */
        p.stack += amt; p.won += amt;
        const prev = winners.find(x => x.id === w.id);
        if (prev) prev.amount += amt; else winners.push({ id: w.id, amount: amt, hand: w.score });
      });
    });
    g.result = { type: 'showdown', winners, board: g.board.slice(), shown };
    g.stats.showdowns++;
    const human = g.players.find(p => p.human);
    if (human && !human.folded && winners.some(w => w.id === human.id)) g.stats.showdownsWon++;
    endHand(g, Math.max(...winners.map(w => w.amount), 0));
  }

  function endHand(g, biggest) {
    g.phase = 'done';
    g.toAct = -1;
    const human = g.players.find(p => p.human);
    if (human) {
      if (g.result.winners.some(w => w.id === human.id)) g.stats.won++;
      g.stats.netChips += human.won - human.committed;
    }
    g.stats.biggest = Math.max(g.stats.biggest, biggest || 0);
  }

  /* --- Monte Carlo síncrono para la IA ---------------------------------------- */
  function quickEquity(cards, board, opponents, iters) {
    const dead = new Set([...cards, ...board]);
    const deck = E.fullDeck().filter(c => !dead.has(c));
    const need = 5 - board.length;
    let winSum = 0;
    const seven = new Array(7);
    for (let it = 0; it < iters; it++) {
      const pool = deck.slice();
      for (let i = 0; i < need + opponents * 2; i++) {
        const j = i + ((Math.random() * (pool.length - i)) | 0);
        const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      const run = pool.slice(0, need);
      seven[0] = cards[0]; seven[1] = cards[1];
      for (let b = 0; b < board.length; b++) seven[2 + b] = board[b];
      for (let b = 0; b < need; b++) seven[2 + board.length + b] = run[b];
      const mine = E.evaluate7(seven);
      let best = mine, ties = 1;
      for (let o = 0; o < opponents; o++) {
        const c1 = pool[need + o * 2], c2 = pool[need + o * 2 + 1];
        seven[0] = c1; seven[1] = c2;
        const sc = E.evaluate7(seven);
        if (sc > best) { best = sc; ties = 1; }
        else if (sc === best && sc !== mine) ties++;
      }
      if (mine === best) winSum += 1 / (mine === best && ties > 1 ? ties : 1);
    }
    return winSum / iters;
  }

  /* Fuerza preflop 0..1 a partir del ranking de las 169 manos. */
  function preflopStrength(cards) {
    const r1 = E.rankOf(cards[0]), r2 = E.rankOf(cards[1]);
    const hi = Math.max(r1, r2), lo = Math.min(r1, r2);
    const suited = E.suitOf(cards[0]) === E.suitOf(cards[1]);
    const ch = r => E.R_CHAR[r];
    const key = hi === lo ? ch(hi) + ch(lo) : ch(hi) + ch(lo) + (suited ? 's' : 'o');
    const rank = E.HAND_RANK[key];
    return rank == null ? 0.2 : 1 - rank / 169;
  }

  /* --- Decisión de la IA ------------------------------------------------------ */
  /* Tres perfiles reales: conservador (nit), estándar-agresivo (tag),
     muy agresivo (lag) y uno aleatorio para romper patrones. */
  const PROFILE = {
    nit:    { open: 0.72, call: 0.52, raise: 0.86, bluff: 0.04, size: 0.55, aggro: 0.5 },
    tag:    { open: 0.58, call: 0.42, raise: 0.72, bluff: 0.14, size: 0.66, aggro: 1.0 },
    lag:    { open: 0.42, call: 0.32, raise: 0.60, bluff: 0.30, size: 0.80, aggro: 1.5 },
    random: { open: 0.50, call: 0.38, raise: 0.70, bluff: 0.22, size: 0.70, aggro: 1.0 }
  };

  function aiDecide(g, difficulty) {
    const lg = legal(g);
    if (!lg) return null;
    const p = lg.player;
    const prof = PROFILE[p.style] || PROFILE.tag;
    const opponents = Math.max(1, active(g).length - 1);
    const potNow = potTotal(g);
    const toCall = lg.callAmount;
    const priceNeeded = toCall > 0 ? toCall / (potNow + toCall) : 0;

    /* Nivel fácil: menos iteraciones y más ruido; difícil: estimación más fina. */
    const iters = difficulty === 'easy' ? 180 : difficulty === 'hard' ? 900 : 420;
    const noise = difficulty === 'easy' ? 0.16 : difficulty === 'hard' ? 0.04 : 0.09;

    let strength;
    if (g.street === 'preflop') {
      strength = preflopStrength(p.cards) * 0.75 + quickEquity(p.cards, g.board, opponents, 140) * 0.25;
    } else {
      strength = quickEquity(p.cards, g.board, opponents, iters);
    }
    if (p.style === 'random') strength = strength * 0.5 + Math.random() * 0.5;
    strength += (Math.random() - 0.5) * noise;
    strength = E.clamp(strength, 0, 1);

    /* Ajuste por número de rivales: con más gente hace falta más mano. */
    const need = prof.call + (opponents - 1) * 0.05;
    const raiseAt = prof.raise - (prof.aggro - 1) * 0.05;
    const bluffing = Math.random() < prof.bluff && g.street !== 'preflop';

    const sizeTo = frac => {
      const target = Math.round((g.currentBet + (potNow + toCall) * frac * prof.size) / g.bb) * g.bb;
      return E.clamp(Math.max(target, lg.minTo), lg.minTo, lg.maxTo);
    };

    if (lg.canCheck) {
      /* Sin apuesta delante: apostar por valor, semi-farol o pasar. */
      if (strength > raiseAt || (bluffing && strength > 0.25)) {
        if (lg.canBet) return { action: 'bet', amount: sizeTo(strength > 0.9 ? 0.75 : 0.55) };
      }
      return { action: 'check' };
    }

    /* Hay que pagar: comparar fuerza con el precio del bote. */
    if (strength > raiseAt && lg.canRaise) return { action: 'raise', amount: sizeTo(0.8) };
    if (bluffing && lg.canRaise && strength < 0.35 && toCall < p.stack * 0.25)
      return { action: 'raise', amount: sizeTo(0.7) };
    if (strength >= Math.max(priceNeeded + 0.02, need * (g.street === 'preflop' ? 1 : 0.8))) {
      if (toCall >= p.stack) return { action: 'allin' };
      return { action: 'call' };
    }
    if (toCall === 0) return { action: 'check' };
    /* Pagar apuestas muy baratas con manos marginales, como haría un humano. */
    if (priceNeeded < 0.12 && strength > 0.25) return { action: 'call' };
    return { action: 'fold' };
  }

  /* --- Utilidades para la interfaz -------------------------------------------- */
  const isHumanTurn = g => g.phase === 'betting' && g.toAct >= 0 && g.players[g.toAct].human;
  const positionOf = (g, i) => {
    if (i === g.button) return 'BTN';
    if (i === g.sbIdx) return 'SB';
    if (i === g.bbIdx) return 'BB';
    const live = g.players.filter(p => !p.out).length;
    let steps = 0, k = g.bbIdx;
    while (k !== i && steps < 10) { k = nextSeat(g, k); steps++; }
    if (steps === 1) return 'UTG';
    if (live > 5 && steps === live - 3) return 'CO';
    return 'MP';
  };

  return { createGame, startHand, legal, act, aiDecide, isHumanTurn, potTotal, positionOf,
           quickEquity, preflopStrength, STYLES, STREETS };
})();
