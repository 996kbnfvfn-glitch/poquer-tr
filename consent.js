/* ============================================================================
   POKERMIND · Consentiment d'emmagatzematge
   ----------------------------------------------------------------------------
   Aquesta web NO fa servir cookies, ni analítica, ni píxels de seguiment.
   L'únic emmagatzematge és localStorage, i es divideix en dos grups:

   ESSENCIAL (art. 22.2 LSSI: exempt de consentiment)
     pm-lang     · idioma triat per la persona
     pm-theme    · tema clar/fosc triat per la persona
     pm-consent  · la decisió presa en aquest mateix avís

   OPCIONAL (es demana consentiment abans de desar res)
     pm-skills     · progrés de l'arbre d'habilitats
     pm-sim-stats  · estadístiques del simulador de pòquer
     pm-bj-stats   · estadístiques del simulador de blackjack

   El banner és funcional de veritat: si es rebutja, `store.set()` no escriu
   cap clau opcional i les que ja hi havia s'esborren. No és un banner decoratiu.
   ========================================================================== */
window.PM_CONSENT = (function () {
  'use strict';

  const KEY = 'pm-consent';
  const VERSION = 1;
  const OPTIONAL = ['pm-skills', 'pm-sim-stats', 'pm-bj-stats'];

  /* localStorage pot llançar excepció (mode privat, quota, política del navegador). */
  const raw = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  let state = (function () {
    try {
      const s = JSON.parse(raw.get(KEY) || 'null');
      if (s && s.v === VERSION && typeof s.prefs === 'boolean') return s;
    } catch (e) {}
    return null;                               /* encara no s'ha decidit res */
  })();

  const subs = new Set();
  const emit = () => subs.forEach(fn => { try { fn(state); } catch (e) {} });

  function persist(prefs) {
    state = { v: VERSION, prefs: !!prefs, ts: new Date().toISOString() };
    raw.set(KEY, JSON.stringify(state));
    if (!prefs) purge();                       /* revocar implica esborrar */
    emit();
  }

  function purge() { OPTIONAL.forEach(raw.del); }

  return {
    OPTIONAL,
    /* ¿ja s'ha respost l'avís? */
    decided: () => state !== null,
    /* ¿es pot desar aquesta categoria? */
    allows(cat) { return cat === 'essential' ? true : !!(state && state.prefs); },
    get prefs() { return !!(state && state.prefs); },
    get decision() { return state; },

    acceptAll() { persist(true); },
    rejectAll() { persist(false); },
    save(prefs) { persist(prefs); },
    /* Reobrir l'avís: esborra la decisió però no les dades ja desades. */
    reset() { raw.del(KEY); state = null; emit(); },
    purge,

    /* Accés a localStorage que respecta la decisió.
       Les claus opcionals es llegeixen i s'escriuen només amb consentiment. */
    store: {
      get(k, fallback) {
        if (OPTIONAL.indexOf(k) !== -1 && !(state && state.prefs)) return fallback;
        const v = raw.get(k);
        if (v == null) return fallback;
        try { return JSON.parse(v); } catch (e) { return fallback; }
      },
      set(k, value) {
        if (OPTIONAL.indexOf(k) !== -1 && !(state && state.prefs)) return false;
        return raw.set(k, JSON.stringify(value));
      },
      raw
    },

    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
  };
})();
