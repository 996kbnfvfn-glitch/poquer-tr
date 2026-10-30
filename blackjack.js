/* ============================================================================
   POKERMIND · Motor de blackjack
   Regles de casino estàndard: sabata de 6 baralles, el crupier es planta amb
   17 (també amb 17 tou), blackjack paga 3:2, es pot doblar i obrir parelles.
   Inclou l'estratègia bàsica completa, que és el que permet ensenyar que,
   fins i tot jugant perfecte, la casa manté el seu avantatge.
   ========================================================================== */
window.PM_BJ = (function () {
  'use strict';
  const E = PM;

  const DECKS = 6;
  /* Valor d'una carta: les figures valen 10 i l'as val 11 fins que passa de 21. */
  const cardValue = c => {
    const r = E.rankOf(c);
    return r === 14 ? 11 : r > 10 ? 10 : r;
  };

  function handValue(cards) {
    let total = 0, aces = 0;
    for (const c of cards) { const v = cardValue(c); total += v; if (v === 11) aces++; }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0, bust: total > 21 };
  }
  const isBlackjack = h => h.cards.length === 2 && !h.fromSplit && handValue(h.cards).total === 21;

  function newShoe() {
    let shoe = [];
    for (let d = 0; d < DECKS; d++) shoe = shoe.concat(E.fullDeck());
    return E.shuffle(shoe);
  }

  function createGame(opts) {
    const o = opts || {};
    return {
      shoe: newShoe(), dealt: 0, cut: Math.floor(52 * DECKS * 0.75),
      bankroll: o.bankroll || 1000, baseBet: o.bet || 25,
      hands: [], active: 0, dealer: { cards: [] }, insurance: 0,
      phase: 'bet', result: null, shuffled: false,
      stats: o.stats || { hands: 0, won: 0, lost: 0, push: 0, bj: 0, net: 0, correct: 0, decisions: 0 }
    };
  }

  const draw = g => {
    if (g.dealt >= g.cut) { g.shoe = newShoe(); g.dealt = 0; g.shuffled = true; }
    g.dealt++;
    return g.shoe.pop();
  };

  /* --- Repartiment ---------------------------------------------------------- */
  function deal(g, bet) {
    const b = Math.max(1, Math.min(bet || g.baseBet, g.bankroll));
    g.baseBet = b;
    g.bankroll -= b;
    g.shuffled = false;
    g.insurance = 0;
    g.result = null;
    g.hands = [{ cards: [draw(g), draw(g)], bet: b, done: false, doubled: false, fromSplit: false, payout: 0, outcome: null }];
    g.dealer = { cards: [draw(g), draw(g)] };
    g.active = 0;
    g.stats.hands++;

    const up = g.dealer.cards[0];
    /* El crupier mira la carta tapada quan ensenya as o carta de 10. */
    if (E.rankOf(up) === 14) { g.phase = 'insurance'; return g; }
    if (cardValue(up) === 10 && handValue(g.dealer.cards).total === 21) { return finish(g); }
    if (isBlackjack(g.hands[0])) return finish(g);
    g.phase = 'player';
    return g;
  }

  function insurance(g, take) {
    if (g.phase !== 'insurance') return g;
    if (take) {
      const cost = Math.min(Math.floor(g.hands[0].bet / 2), g.bankroll);
      g.insurance = cost; g.bankroll -= cost;
    }
    if (handValue(g.dealer.cards).total === 21) return finish(g);
    if (isBlackjack(g.hands[0])) return finish(g);
    g.phase = 'player';
    return g;
  }

  /* --- Accions legals -------------------------------------------------------- */
  function legal(g) {
    if (g.phase !== 'player') return null;
    const h = g.hands[g.active];
    if (!h) return null;
    const v = handValue(h.cards);
    const first = h.cards.length === 2;
    const pair = first && cardValue(h.cards[0]) === cardValue(h.cards[1]);
    return {
      hand: h, value: v,
      canHit: !v.bust && v.total < 21,
      canStand: true,
      canDouble: first && g.bankroll >= h.bet && !v.bust,
      canSplit: pair && g.hands.length < 4 && g.bankroll >= h.bet,
      canInsure: false
    };
  }

  function nextHand(g) {
    let i = g.active + 1;
    while (i < g.hands.length && g.hands[i].done) i++;
    if (i < g.hands.length) { g.active = i; return g; }
    return dealerTurn(g);
  }

  function act(g, action) {
    const lg = legal(g);
    if (!lg) return g;
    const h = lg.hand;

    if (action === 'hit') {
      h.cards.push(draw(g));
      const v = handValue(h.cards);
      if (v.bust || v.total === 21) { h.done = true; return nextHand(g); }
      return g;
    }
    if (action === 'stand') { h.done = true; return nextHand(g); }
    if (action === 'double' && lg.canDouble) {
      g.bankroll -= h.bet; h.bet *= 2; h.doubled = true;
      h.cards.push(draw(g)); h.done = true;
      return nextHand(g);
    }
    if (action === 'split' && lg.canSplit) {
      const moved = h.cards.pop();
      g.bankroll -= h.bet;
      const nh = { cards: [moved, draw(g)], bet: h.bet, done: false, doubled: false, fromSplit: true, payout: 0, outcome: null };
      h.cards.push(draw(g));
      h.fromSplit = true;
      g.hands.splice(g.active + 1, 0, nh);
      /* Amb parella d'asos només es reparteix una carta a cada mà. */
      if (cardValue(moved) === 11) {
        h.done = true; nh.done = true;
        return nextHand(g);
      }
      return g;
    }
    return g;
  }

  /* --- Torn del crupier ------------------------------------------------------ */
  function dealerTurn(g) {
    g.phase = 'dealer';
    const anyAlive = g.hands.some(h => !handValue(h.cards).bust);
    if (anyAlive) {
      /* Es planta amb 17 o més, també amb 17 tou (regla S17). */
      while (handValue(g.dealer.cards).total < 17) g.dealer.cards.push(draw(g));
    }
    return finish(g);
  }

  /* --- Liquidació ------------------------------------------------------------ */
  function finish(g) {
    const d = handValue(g.dealer.cards);
    const dealerBJ = g.dealer.cards.length === 2 && d.total === 21;

    if (g.insurance > 0) {
      /* L'assegurança paga 2:1 quan el crupier té blackjack. */
      if (dealerBJ) { g.bankroll += g.insurance * 3; }
      g.insuranceWon = dealerBJ;
    }

    let net = 0;
    g.hands.forEach(h => {
      const v = handValue(h.cards);
      const bj = isBlackjack(h);
      if (v.bust) { h.outcome = 'lose'; h.payout = 0; }
      else if (bj && !dealerBJ) { h.outcome = 'blackjack'; h.payout = h.bet + h.bet * 1.5; }
      else if (dealerBJ && !bj) { h.outcome = 'lose'; h.payout = 0; }
      else if (dealerBJ && bj) { h.outcome = 'push'; h.payout = h.bet; }
      else if (d.bust) { h.outcome = 'win'; h.payout = h.bet * 2; }
      else if (v.total > d.total) { h.outcome = 'win'; h.payout = h.bet * 2; }
      else if (v.total < d.total) { h.outcome = 'lose'; h.payout = 0; }
      else { h.outcome = 'push'; h.payout = h.bet; }

      g.bankroll += h.payout;
      net += h.payout - h.bet;
      if (h.outcome === 'win') g.stats.won++;
      else if (h.outcome === 'blackjack') { g.stats.won++; g.stats.bj++; }
      else if (h.outcome === 'push') g.stats.push++;
      else g.stats.lost++;
    });
    net -= g.insurance;
    if (g.insurance > 0 && dealerBJ) net += g.insurance * 2;
    g.stats.net += net;
    g.result = { net, dealerBJ, dealerTotal: d.total, dealerBust: d.bust };
    g.phase = 'done';
    return g;
  }

  /* --- Estratègia bàsica -----------------------------------------------------
     Taula completa per a 6 baralles amb el crupier plantant-se amb 17 tou.
     Retorna 'H' demanar, 'S' plantar-se, 'D' doblar, 'P' obrir parella.      */
  function basicStrategy(cards, dealerUp, canDouble, canSplit) {
    const up = cardValue(dealerUp);              /* 2..11, on 11 és l'as */
    const v = handValue(cards);
    const pair = cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1]);

    if (pair && canSplit) {
      const p = cardValue(cards[0]);
      if (p === 11) return 'P';                                   /* asos: sempre */
      if (p === 10) return 'S';                                   /* dieces: mai */
      if (p === 9) return (up === 7 || up === 10 || up === 11) ? 'S' : 'P';
      if (p === 8) return 'P';
      if (p === 7) return up <= 7 ? 'P' : 'H';
      if (p === 6) return up <= 6 ? 'P' : 'H';
      if (p === 5) return (up <= 9 && canDouble) ? 'D' : 'H';      /* es juga com un 10 */
      if (p === 4) return (up === 5 || up === 6) ? 'P' : 'H';
      if (p === 3 || p === 2) return up <= 7 ? 'P' : 'H';
    }

    if (v.soft) {                                                  /* mans amb as flexible */
      const other = v.total - 11;
      if (v.total >= 19) return 'S';
      if (v.total === 18) {
        if (up >= 3 && up <= 6 && canDouble) return 'D';
        if (up === 2 || up === 7 || up === 8) return 'S';
        return 'H';
      }
      if (other === 6) return (up >= 3 && up <= 6 && canDouble) ? 'D' : 'H';   /* A-6 */
      if (other === 5 || other === 4) return (up >= 4 && up <= 6 && canDouble) ? 'D' : 'H';
      return (up >= 5 && up <= 6 && canDouble) ? 'D' : 'H';        /* A-2 i A-3 */
    }

    if (v.total >= 17) return 'S';
    if (v.total >= 13) return up <= 6 ? 'S' : 'H';
    if (v.total === 12) return (up >= 4 && up <= 6) ? 'S' : 'H';
    if (v.total === 11) return (canDouble && up <= 10) ? 'D' : 'H';
    if (v.total === 10) return (canDouble && up <= 9) ? 'D' : 'H';
    if (v.total === 9) return (canDouble && up >= 3 && up <= 6) ? 'D' : 'H';
    return 'H';
  }

  const ACTION_OF = { H: 'hit', S: 'stand', D: 'double', P: 'split' };
  function advice(g) {
    const lg = legal(g);
    if (!lg) return null;
    const code = basicStrategy(lg.hand.cards, g.dealer.cards[0], lg.canDouble, lg.canSplit);
    return { code, action: ACTION_OF[code] };
  }

  /* --- Simulació llarga amb estratègia bàsica ---------------------------------
     Juga n mans seguint la taula al peu de la lletra. Serveix per ensenyar que
     el resultat esperat continua sent negatiu: aquest és l'avantatge de la casa. */
  function simulateBasic(n, bet) {
    const g = createGame({ bankroll: 1e9, bet: bet });
    const path = [0];
    const step = Math.max(1, Math.floor(n / 120));
    const start = g.bankroll;
    let wagered = 0;
    for (let i = 0; i < n; i++) {
      const before = g.bankroll;
      deal(g, bet);
      wagered += bet;
      if (g.phase === 'insurance') insurance(g, false);            /* mai s'assegura */
      let guard = 0;
      while (g.phase === 'player' && guard++ < 40) {
        const a = advice(g);
        const lg = legal(g);
        let action = a ? a.action : 'stand';
        if (action === 'double' && !lg.canDouble) action = 'hit';
        if (action === 'split' && !lg.canSplit) action = 'hit';
        if (action === 'double') wagered += g.hands[g.active].bet;
        if (action === 'split') wagered += g.hands[g.active].bet;
        act(g, action);
      }
      if (i % step === 0) path.push(g.bankroll - start);
    }
    path.push(g.bankroll - start);
    const net = g.bankroll - start;
    return { path, net, hands: n, wagered, edge: wagered > 0 ? -net / wagered : 0, stats: g.stats };
  }

  return { DECKS, createGame, deal, insurance, legal, act, advice, basicStrategy,
           handValue, cardValue, isBlackjack, simulateBasic };
})();
