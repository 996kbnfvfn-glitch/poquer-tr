/* ============================================================================
   POKERMIND · Entrevista
   ----------------------------------------------------------------------------
   Tres peces:
     1. Player · un sol <audio preload="none"> compartit per tota l'aplicació.
        Viu fora de React (en un contenidor amagat del body) i es trasllada a
        la pàgina de l'entrevista quan cal ensenyar-ne els controls natius.
     2. Cita · <figure>/<blockquote>/<figcaption> amb botó d'escolta que
        reprodueix NOMÉS el tram de la resposta i s'atura al segon final.
     3. Entrevista · la pàgina sencera: qui és J., àudio, capítols i frases.
   ========================================================================== */
(function () {
  'use strict';
  const { useState, useEffect, useRef, useCallback } = React;
  const U = PM_UI, I = PM_I18N, D = PM_ENTREVISTA;
  const { html, Reveal, SectionHead } = U;
  const t = (k, v) => I.t(k, v);

  const mmss = s => {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  /* ========================================================================
     1 · REPRODUCTOR COMPARTIT
     ====================================================================== */
  const Player = (function () {
    let el = null, amagat = null, fins = null, activa = null, carregant = false, error = false;
    const subs = new Set();
    const avisa = () => subs.forEach(fn => { try { fn(); } catch (e) {} });

    function node() {
      if (el) return el;
      el = document.createElement('audio');
      el.preload = 'none';                      /* no es baixa res fins que el demanen */
      el.src = D.AUDIO;
      el.controls = false;
      amagat = document.createElement('div');
      amagat.style.display = 'none';
      document.body.appendChild(amagat);
      amagat.appendChild(el);

      el.addEventListener('timeupdate', () => {
        /* El tram s'atura sol al segon final de la resposta. */
        if (fins != null && el.currentTime >= fins) { el.pause(); fins = null; activa = null; }
        avisa();
      });
      /* Si qui mou la barra és la persona (controls natius), el tram deixa de
         manar: si no, l'àudio se li aturaria sol en un punt que no ha demanat. */
      el.addEventListener('seeking', () => {
        if (nostre) { nostre = false; return; }
        fins = null; activa = null; avisa();
      });
      el.addEventListener('play', () => { carregant = false; error = false; avisa(); });
      el.addEventListener('pause', avisa);
      el.addEventListener('ended', () => { fins = null; activa = null; avisa(); });
      el.addEventListener('error', () => { error = true; carregant = false; activa = null; avisa(); });
      el.addEventListener('loadedmetadata', avisa);
      return el;
    }

    /* Amb preload="none" el fitxer encara no té metadades el primer cop, i fins
       que no n'hi ha no es pot moure el cap de lectura. Però si s'espera a
       loadedmetadata per cridar play(), es perd el gest de l'usuari i el
       navegador bloqueja la reproducció. Per això es fa al revés: play() surt
       de seguida dins del clic, en silenci, i quan arriben les metadades se
       salta al segon demanat i es treu el silenci. Així no se sent mai el
       principi de l'àudio. */
    let nostre = false;                      /* distingeix el nostre salt del de l'usuari */

    function obre(a, segons) {
      if (a.readyState >= 1) {
        nostre = true;
        try { a.currentTime = segons; } catch (e) {}
        return;
      }
      carregant = true;
      a.muted = true;
      const meta = () => {
        a.removeEventListener('loadedmetadata', meta);
        nostre = true;
        try { a.currentTime = segons; } catch (e) {}
      };
      const saltat = () => {
        a.removeEventListener('seeked', saltat);
        a.muted = false; carregant = false; avisa();
      };
      a.addEventListener('loadedmetadata', meta);
      a.addEventListener('seeked', saltat);
    }

    function arrenca(a) {
      const p = a.play();
      if (p && p.catch) p.catch(() => {
        error = true; activa = null; fins = null; carregant = false; a.muted = false; avisa();
      });
    }

    return {
      node,
      get activa() { return activa; },
      get carregant() { return carregant; },
      get error() { return error; },
      get temps() { return el ? el.currentTime : 0; },
      get sonant() { return !!(el && !el.paused && !el.ended); },
      get nostreSalt() { return nostre; },
      marcaSalt(v) { nostre = v; },

      /* Reprodueix el tram d'una frase. Si ja sonava la mateixa, s'atura. */
      tram(id, inici, final) {
        if (activa === id) { this.atura(); return; }
        const a = node();
        error = false; fins = final; activa = id;
        obre(a, inici);
        arrenca(a);                            /* síncron dins del gest de l'usuari */
        avisa();
      },

      /* Salta a un minut. `reprodueix` false només mou el cap de lectura, que és
         el que cal quan s'entra amb #entrevista/480. */
      ves(segons, reprodueix) {
        const a = node();
        fins = null; activa = null; error = false;
        if (!reprodueix && a.readyState < 1) {
          /* Sense gest de l'usuari no es pot ni carregar en silenci: es demana
             només les metadades i, quan hi siguin, es deixa el cap preparat. */
          carregant = true;
          const meta = () => {
            a.removeEventListener('loadedmetadata', meta);
            nostre = true;
            try { a.currentTime = segons; } catch (e) {}
            carregant = false; avisa();
          };
          a.addEventListener('loadedmetadata', meta);
          a.preload = 'metadata';
          a.load();
          avisa();
          return;
        }
        obre(a, segons);
        if (reprodueix) arrenca(a);
        avisa();
      },

      atura() { if (el) { el.pause(); el.muted = false; } fins = null; activa = null; carregant = false; avisa(); },

      /* Trasllada l'element a la pàgina de l'entrevista i li posa els controls
         natius; en sortir-ne, torna al contenidor amagat. React no toca aquest
         node, així que el trasllat és segur. */
      mostra(contenidor) {
        const a = node();
        a.controls = true;
        a.className = 'ent-audio';
        contenidor.appendChild(a);
        avisa();
      },
      amaga() {
        if (!el || !amagat) return;
        el.controls = false;
        el.className = '';
        amagat.appendChild(el);
      },

      subscriu(fn) { subs.add(fn); return () => subs.delete(fn); }
    };
  })();

  /* Re-renderitza el component cada vegada que canvia l'estat del reproductor. */
  function usePlayer() {
    const [, torna] = useState(0);
    useEffect(() => Player.subscriu(() => torna(n => n + 1)), []);
    return Player;
  }

  /* ========================================================================
     2 · COMPONENT DE CITA
     ====================================================================== */
  function Cita({ id, compacta }) {
    const f = D.perId(id);
    const P = usePlayer();
    if (!f) return null;

    const sonant = P.activa === f.id && P.sonant;
    const carregant = P.activa === f.id && P.carregant;
    const min = mmss(f.inici);
    const trad = I.code !== 'ca' ? (f.trad && f.trad[I.code]) : null;
    const etiqueta = t('ent.cite.trad');

    const botó = html`<button type="button"
      class=${'cita-play' + (sonant ? ' is-on' : '')}
      onClick=${() => P.tram(f.id, f.inici, f.final)}
      aria-label=${sonant ? t('ent.cite.ariaStop') : t('ent.cite.ariaPlay', { t: min })}>
      <${U.Icon} name=${sonant ? 'stop' : 'play'} size=${13} />
      <span>${sonant ? t('ent.cite.stop') : t('ent.cite.play')}</span>
      <span class="cita-min mono">${min}</span>
      ${carregant && html`<${U.Spinner} />`}
    </button>`;

    const context = html`<a class="cita-ctx" href=${'#entrevista/' + f.inici}
      aria-label=${t('ent.cite.ariaContext', { t: min })}>${t('ent.cite.context')}</a>`;

    return html`<figure class=${'cita' + (compacta ? ' cita--mini' : '')}>
      <blockquote lang="ca" class="cita-q">
        <span class="cita-mark" aria-hidden="true">«</span>${f.text}<span class="cita-mark" aria-hidden="true">»</span>
      </blockquote>
      ${trad && html`<p class="cita-trad" lang=${I.code}>
        <span class="cita-tradl">${etiqueta}</span>${trad}</p>`}
      <figcaption class="cita-cap">
        <span class="cita-who">
          <span aria-hidden="true">—</span> ${t('ent.cite.author')}${' '}
          <a class="cita-pseudo" href="#entrevista">(${t('ent.cite.pseudo')})</a>
        </span>
        <span class="cita-acts">${botó}${context}</span>
      </figcaption>
    </figure>`;
  }

  /* ========================================================================
     3 · PÀGINA DE L'ENTREVISTA
     ====================================================================== */
  /* Llegeix el segon de l'adreça: #entrevista/480 */
  const segonsDeLaRuta = () => {
    const m = /^#entrevista\/(\d+)/.exec(location.hash || '');
    return m ? parseInt(m[1], 10) : null;
  };

  function Capitols() {
    const P = usePlayer();
    const ara = P.temps;
    /* Capítol actiu: l'últim que ja ha començat. */
    let actiu = -1;
    D.CAPITOLS.forEach((c, i) => { if (ara >= c.inici) actiu = i; });
    if (!P.sonant && ara === 0) actiu = -1;

    const blocs = [];
    D.CAPITOLS.forEach((c, i) => {
      let b = blocs.find(x => x.id === c.bloc);
      if (!b) { b = { id: c.bloc, items: [] }; blocs.push(b); }
      b.items.push({ c, i });
    });

    return html`<div class="ent-caps">
      <div class="ent-h">
        <h2>${t('ent.chapters')}</h2>
        <p class="hint">${t('ent.chaptersHint')}</p>
      </div>
      ${blocs.map(b => html`<div key=${b.id} class="ent-bloc">
        <div class="ent-blocl">${t('ent.blocs')[b.id]}</div>
        <ul class="ent-caplist">
          ${b.items.map(({ c, i }) => html`<li key=${c.inici}>
            <button type="button" class=${'ent-cap' + (actiu === i ? ' is-on' : '')}
              aria-current=${actiu === i ? 'true' : undefined}
              onClick=${() => P.ves(c.inici, true)}>
              <span class="ent-capt mono">${c.minut}</span>
              <span class="ent-capn">${c.titol[I.code] || c.titol.ca}</span>
              ${actiu === i && html`<span class="ent-capnow">${t('ent.nowPlaying')}</span>`}
            </button></li>`)}
        </ul>
      </div>`)}
    </div>`;
  }

  function Entrevista() {
    const P = usePlayer();
    const caixa = useRef(null);

    /* L'element d'àudio compartit es trasllada aquí mentre la pestanya és oberta. */
    useEffect(() => {
      if (caixa.current) Player.mostra(caixa.current);
      return () => Player.amaga();
    }, []);

    /* #entrevista/480 → el cap de lectura hi salta, però no sona fins que
       l'usuari prem play. També respon si es torna a clicar un enllaç igual. */
    useEffect(() => {
      const aplica = () => { const s = segonsDeLaRuta(); if (s != null) Player.ves(s, false); };
      aplica();
      window.addEventListener('hashchange', aplica);
      return () => window.removeEventListener('hashchange', aplica);
    }, []);

    const fitxa = t('ent.fitxa');
    const destacades = D.destacades();
    const resta = D.EIXOS.map(e => ({ eix: e, items: D.perEix(e).filter(f => !f.destacada) }))
                         .filter(g => g.items.length);

    return html`<section class="sec" id="entrevista">
      <div class="shell">
        <${SectionHead} n="11" eyebrow=${t('ent.eyebrow')} title=${t('ent.title')} lede=${t('ent.lede')} />

        <${Reveal} className="ent-intro">
          <div class="ent-fitxa">
            <span class="ent-ava" aria-hidden="true"><${U.Icon} name="mic" size=${20} /></span>
            <div class="ent-chips">
              ${[fitxa.age, fitxa.years, fitxa.game, fitxa.stakes, fitxa.study]
                .map((x, i) => html`<span key=${i} class="ent-chip">${x}</span>`)}
            </div>
          </div>
          <div class="ent-cols">
            <div><h2>${t('ent.who')}</h2><p>${t('ent.whoText')}</p></div>
            <div><h2>${t('ent.anon')}</h2><p>${t('ent.anonText')}</p></div>
            <div><h2>${t('ent.rel')}</h2><p>${t('ent.relText')}</p></div>
          </div>
        <//>

        <${Reveal} className="ent-player">
          <div class="ent-h">
            <h2>${t('ent.player')}</h2>
            <p class="hint">${t('ent.playerHint')}</p>
          </div>
          <div ref=${caixa} class="ent-audiobox"></div>
          ${P.error && html`<p class="ent-err" role="alert">${t('ent.err')}</p>`}
        <//>

        <${Reveal}><${Capitols} /><//>

        <${Reveal} className="ent-quotes">
          <div class="ent-h">
            <h2>${t('ent.quotes')}</h2>
            <p class="hint">${t('ent.quotesHint')}</p>
          </div>

          <div class="ent-feat">
            <div class="ent-featl"><${U.Icon} name="quote" size=${14} />${t('ent.featured')}</div>
            ${destacades.map(f => html`<${Cita} key=${f.id} id=${f.id} />`)}
          </div>

          ${resta.map(g => html`<div key=${g.eix} class="ent-grup">
            <h3 class="ent-grupl">${t('ent.eixos')[g.eix]}</h3>
            ${g.items.map(f => html`<${Cita} key=${f.id} id=${f.id} compacta=${true} />`)}
          </div>`)}
        <//>
      </div>
    </section>`;
  }

  /* Portada: un sol element destacat. Va sota el hero, no el desplaça. */
  function CitaHero({ id, go }) {
    return html`<div class="cita-hero">
      <span class="cita-hero-ico" aria-hidden="true"><${U.Icon} name="mic" size=${17} /></span>
      <div class="cita-hero-in">
        <${Cita} id=${id} compacta=${true} />
      </div>
      <button class="btn btn-ghost btn-sm cita-hero-cta" type="button"
        onClick=${() => go && go('entrevista')}>
        <${U.Icon} name="headphones" size=${15} />${t('ent.heroCta')}</button>
    </div>`;
  }

  window.PM_ENT_UI = { Player, Cita, CitaHero, Entrevista, mmss };
  PM_UI.CitaHero = CitaHero;
  PM_UI.Cita = Cita;
  PM_SEC.Entrevista = Entrevista;
})();
