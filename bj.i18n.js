/* ============================================================================
   POKERMIND · Textos del simulador de blackjack (tres idiomes)
   ========================================================================== */
(function () {
  'use strict';
  const C = window.PM_CONTENT;

  const TXT = {
    ca: {
      pickTitle: 'Dos jocs, dues maneres de decidir',
      pickSub: 'Prova’ls per separat i nota la diferència: al pòquer decideixes contra persones; al blackjack, contra unes regles fixes.',
      pokerName: 'Texas Hold’em', pokerDesc: 'Contra la resta de jugadors',
      bjName: 'Blackjack', bjDesc: 'Contra la banca',
      eyebrow: 'Simulador de blackjack', title: 'El joc on la casa sempre té avantatge',
      lede: 'Mateixes cartes, joc completament diferent. Aquí no hi ha rivals a llegir ni faroles: només tu contra unes regles fixes que no canvien mai. Juga unes mans i comprova què es pot decidir realment.',
      setup: { bankroll: 'Fitxes inicials', bet: 'Aposta per mà', start: 'Començar a jugar', rules: 'Regles de la taula',
        rulesList: ['Sabata de 6 baralles', 'El crupier es planta amb 17, també amb 17 tou', 'El blackjack paga 3:2', 'Es pot doblar i obrir parelles'] },
      table: { dealer: 'Crupier', you: 'La teva mà', hand: 'Mà {n}', bankroll: 'Fitxes', bet: 'Aposta',
        soft: 'tou', bust: 'PASSAT', bj: 'BLACKJACK', dealerCard: 'carta tapada', shuffled: 'Sabata barrejada de nou' },
      act: { hit: 'Demanar', stand: 'Plantar-se', double: 'Doblar', split: 'Obrir', deal: 'Repartir',
        again: 'Mà següent', insureQ: 'El crupier ensenya un as. Vols assegurança?', insureYes: 'Assegurar (paga 2:1)',
        insureNo: 'No assegurar', bet: 'Aposta: {n}' },
      res: { win: 'Guanyes {n}', lose: 'Perds {n}', push: 'Empat: recuperes l’aposta', bj: 'Blackjack! Guanyes {n}',
        dealerBust: 'El crupier s’ha passat', dealerHas: 'El crupier té {n}', title: 'Resultat' },
      hint: { title: 'Estratègia bàsica', ask: 'Què diu la taula?', says: 'La taula diu: {what}',
        H: 'demanar carta', S: 'plantar-se', D: 'doblar', P: 'obrir la parella',
        ok: 'Has jugat com diu la taula', no: 'La taula recomanava {what}',
        note: 'L’estratègia bàsica és la jugada matemàticament correcta per a cada combinació. No et fa guanyar: només redueix l’avantatge de la casa al mínim.' },
      stats: { title: 'Les teves mans', played: 'Mans jugades', won: 'Guanyades', lost: 'Perdudes', push: 'Empats',
        bj: 'Blackjacks', net: 'Balanç', acc: 'Encert amb la taula', reset: 'Esborrar' },
      long: { title: 'I si jugues perfecte per sempre?', run: 'Simular {n} mans amb estratègia bàsica', running: 'Simulant…',
        lede: 'Aquesta simulació juga milers de mans seguint la taula al peu de la lletra, sense cap error humà.',
        edge: 'Avantatge de la casa', net: 'Resultat final', wagered: 'Total apostat', handsN: '{n} mans',
        verdict: 'Jugant de manera impecable, el resultat esperat continua sent negatiu. Aquest és el límit del blackjack: es pot jugar bé, però no es pot guanyar a llarg termini.',
        compare: 'Al pòquer, en canvi, l’avantatge no el fixa el casino: el fixa la diferència entre les teves decisions i les dels teus rivals.' }
    },
    es: {
      pickTitle: 'Dos juegos, dos formas de decidir',
      pickSub: 'Pruébalos por separado y nota la diferencia: en el póker decides contra personas; en el blackjack, contra unas reglas fijas.',
      pokerName: 'Texas Hold’em', pokerDesc: 'Contra el resto de jugadores',
      bjName: 'Blackjack', bjDesc: 'Contra la banca',
      eyebrow: 'Simulador de blackjack', title: 'El juego donde la casa siempre tiene ventaja',
      lede: 'Las mismas cartas, un juego completamente distinto. Aquí no hay rivales a los que leer ni faroles: solo tú contra unas reglas fijas que nunca cambian. Juega unas manos y comprueba qué se puede decidir realmente.',
      setup: { bankroll: 'Fichas iniciales', bet: 'Apuesta por mano', start: 'Empezar a jugar', rules: 'Reglas de la mesa',
        rulesList: ['Zapato de 6 barajas', 'El crupier se planta con 17, también con 17 blando', 'El blackjack paga 3:2', 'Se puede doblar y abrir parejas'] },
      table: { dealer: 'Crupier', you: 'Tu mano', hand: 'Mano {n}', bankroll: 'Fichas', bet: 'Apuesta',
        soft: 'blando', bust: 'PASADO', bj: 'BLACKJACK', dealerCard: 'carta tapada', shuffled: 'Zapato barajado de nuevo' },
      act: { hit: 'Pedir', stand: 'Plantarse', double: 'Doblar', split: 'Abrir', deal: 'Repartir',
        again: 'Mano siguiente', insureQ: 'El crupier enseña un as. ¿Quieres seguro?', insureYes: 'Asegurar (paga 2:1)',
        insureNo: 'No asegurar', bet: 'Apuesta: {n}' },
      res: { win: 'Ganas {n}', lose: 'Pierdes {n}', push: 'Empate: recuperas la apuesta', bj: '¡Blackjack! Ganas {n}',
        dealerBust: 'El crupier se ha pasado', dealerHas: 'El crupier tiene {n}', title: 'Resultado' },
      hint: { title: 'Estrategia básica', ask: '¿Qué dice la tabla?', says: 'La tabla dice: {what}',
        H: 'pedir carta', S: 'plantarse', D: 'doblar', P: 'abrir la pareja',
        ok: 'Has jugado como dice la tabla', no: 'La tabla recomendaba {what}',
        note: 'La estrategia básica es la jugada matemáticamente correcta para cada combinación. No te hace ganar: solo reduce la ventaja de la casa al mínimo.' },
      stats: { title: 'Tus manos', played: 'Manos jugadas', won: 'Ganadas', lost: 'Perdidas', push: 'Empates',
        bj: 'Blackjacks', net: 'Balance', acc: 'Acierto con la tabla', reset: 'Borrar' },
      long: { title: '¿Y si juegas perfecto para siempre?', run: 'Simular {n} manos con estrategia básica', running: 'Simulando…',
        lede: 'Esta simulación juega miles de manos siguiendo la tabla al pie de la letra, sin ningún error humano.',
        edge: 'Ventaja de la casa', net: 'Resultado final', wagered: 'Total apostado', handsN: '{n} manos',
        verdict: 'Jugando de forma impecable, el resultado esperado sigue siendo negativo. Ese es el límite del blackjack: se puede jugar bien, pero no se puede ganar a largo plazo.',
        compare: 'En el póker, en cambio, la ventaja no la fija el casino: la fija la diferencia entre tus decisiones y las de tus rivales.' }
    },
    en: {
      pickTitle: 'Two games, two ways of deciding',
      pickSub: 'Play them separately and feel the difference: in poker you decide against people; in blackjack, against fixed rules.',
      pokerName: 'Texas Hold’em', pokerDesc: 'Against the other players',
      bjName: 'Blackjack', bjDesc: 'Against the house',
      eyebrow: 'Blackjack simulator', title: 'The game where the house always has the edge',
      lede: 'Same cards, completely different game. There are no opponents to read and no bluffs here: just you against fixed rules that never change. Play a few hands and see what there is left to decide.',
      setup: { bankroll: 'Starting chips', bet: 'Bet per hand', start: 'Start playing', rules: 'Table rules',
        rulesList: ['Six-deck shoe', 'Dealer stands on 17, including soft 17', 'Blackjack pays 3:2', 'Doubling and splitting allowed'] },
      table: { dealer: 'Dealer', you: 'Your hand', hand: 'Hand {n}', bankroll: 'Chips', bet: 'Bet',
        soft: 'soft', bust: 'BUST', bj: 'BLACKJACK', dealerCard: 'hole card', shuffled: 'Shoe reshuffled' },
      act: { hit: 'Hit', stand: 'Stand', double: 'Double', split: 'Split', deal: 'Deal',
        again: 'Next hand', insureQ: 'The dealer shows an ace. Take insurance?', insureYes: 'Insure (pays 2:1)',
        insureNo: 'No insurance', bet: 'Bet: {n}' },
      res: { win: 'You win {n}', lose: 'You lose {n}', push: 'Push: your bet comes back', bj: 'Blackjack! You win {n}',
        dealerBust: 'The dealer busts', dealerHas: 'The dealer has {n}', title: 'Result' },
      hint: { title: 'Basic strategy', ask: 'What does the chart say?', says: 'The chart says: {what}',
        H: 'hit', S: 'stand', D: 'double', P: 'split the pair',
        ok: 'You played it by the chart', no: 'The chart recommended {what}',
        note: 'Basic strategy is the mathematically correct play for every combination. It does not make you win: it only shrinks the house edge to its minimum.' },
      stats: { title: 'Your hands', played: 'Hands played', won: 'Won', lost: 'Lost', push: 'Pushes',
        bj: 'Blackjacks', net: 'Balance', acc: 'Chart accuracy', reset: 'Clear' },
      long: { title: 'And if you played perfectly forever?', run: 'Simulate {n} hands with basic strategy', running: 'Simulating…',
        lede: 'This simulation plays thousands of hands following the chart to the letter, with no human error at all.',
        edge: 'House edge', net: 'Final result', wagered: 'Total wagered', handsN: '{n} hands',
        verdict: 'Played flawlessly, the expected result is still negative. That is the ceiling of blackjack: you can play well, but you cannot win in the long run.',
        compare: 'In poker the edge is not set by the casino: it is set by the gap between your decisions and your opponents’.' }
    }
  };

  ['ca', 'es', 'en'].forEach(code => { if (C[code]) C[code].UI.bj = TXT[code]; });
})();
