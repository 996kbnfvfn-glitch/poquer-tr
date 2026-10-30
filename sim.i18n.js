/* ============================================================================
   POKERMIND · Textos del simulador (se inyectan en los tres idiomas)
   Van aparte para no tocar los archivos de contenido ya existentes.
   ========================================================================== */
(function () {
  'use strict';
  const C = window.PM_CONTENT;

  const TXT = {
    ca: {
      tab: 'Simulador',
      setup: { eyebrow: 'Simulador', title: 'Juga una mà de veritat', 
        lede: 'Texas Hold\'em complet contra oponents amb estratègies diferents. Cegues, posicions, botes paral·lels, showdown i anàlisi de la mà: tot calculat en aquesta pàgina.',
        players: 'Jugadors a la taula', stack: 'Fitxes inicials', blinds: 'Cegues', name: 'El teu nom',
        difficulty: 'Nivell de la IA', easy: 'Fàcil', medium: 'Mitjà', hard: 'Difícil',
        start: 'Repartir la primera mà', rivals: 'Rivals', styleLabel: 'Estil',
        practice: 'Mode pràctica', practiceNote: 'Recompra automàtica quan et quedis sense fitxes: mans il·limitades per aprendre sense pressió.',
        autoplay: 'Mà següent automàtica' },
      styles: { tag: 'Sòlid agressiu (TAG)', lag: 'Molt agressiu (LAG)', nit: 'Conservador (Nit)', random: 'Imprevisible' },
      table: { pot: 'Bot', total: 'Bot total', stack: 'Fitxes', toCall: 'Per pagar', street: { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' },
        showdown: 'Showdown', thinking: 'pensant…', yourTurn: 'És el teu torn', waiting: 'Esperant els rivals…',
        folded: 'retirat', allin: 'ALL-IN', hand: 'Mà {n}', you: 'Tu', empty: 'seient buit',
        blindsAre: 'Cegues {sb}/{bb}', yourHand: 'La teva mà: {hand}' },
      act: { fold: 'Retirar-se', check: 'Passar', call: 'Pagar {n}', bet: 'Apostar', raise: 'Pujar', allin: 'ALL-IN {n}',
        amount: 'Quantitat', half: '½ bot', threeq: '¾ bot', pot: 'Bot', min: 'Mín', max: 'Màx', confirm: 'Confirmar {n}',
        back: 'Enrere', betTo: 'Apostar {n}', raiseTo: 'Pujar a {n}' },
      tip: { fold: 'Abandones la mà i perds el que ja has posat. És correcte sempre que el preu no compensi la teva equity.',
        check: 'Continues a la mà sense posar fitxes. Només es pot fer si ningú no ha apostat abans que tu.',
        call: 'Iguales l\'aposta. Només guanya si tens la millor mà: no pots guanyar el bot fent que es retirin.',
        bet: 'Poses fitxes quan ningú no ho ha fet. Guanya de dues maneres: la millor mà o que tothom es retiri.',
        raise: 'Augmentes l\'aposta del rival. La pujada mínima és la mida de l\'última aposta.',
        allin: 'Poses totes les fitxes. Si algú no et pot cobrir, es crea un bot paral·lel.' },
      help: { title: 'Ajuda didàctica', potOdds: 'Pot odds', potOddsText: 'Pagues {call} per un bot de {pot}: necessites guanyar el {need} de les vegades.',
        equity: 'La teva equity', calc: 'Calcular la meva equity', calcing: 'Simulant…',
        equityText: 'Guanyes el {eq} contra {n} rival(s) si la mà arriba al final.',
        verdictOk: 'El preu compensa: tens més equity de la que et demana el bot.',
        verdictNo: 'El preu no compensa amb la mà actual.',
        range: 'Rang recomanat des de {pos}', rangeText: 'Des d\'aquesta posició es juga aproximadament el {pct} de les mans. La teva mà {hand} {inr}.',
        inRange: 'hi entra', outRange: 'no hi entra', position: 'Posició' },
      stats: { title: 'Les teves estadístiques', hands: 'Mans jugades', won: 'Mans guanyades', winrate: 'Mans guanyades (%)',
        showdown: 'Showdowns guanyats', net: 'Balanç de fitxes', biggest: 'Bot més gran', reset: 'Esborrar estadístiques', vpip: 'VPIP' },
      logT: { title: 'Historial de la mà', empty: 'Encara no hi ha accions.',
        sb: 'cega petita', bb: 'cega gran', fold: 'es retira', check: 'passa', call: 'paga', bet: 'aposta', raise: 'puja a', allin: 'va all-in' },
      res: { title: 'Resultat de la mà', winsWith: '{name} guanya {amount} amb {hand}', wins: '{name} guanya {amount}',
        split: 'Bot repartit entre {names}', noShowdown: 'Tothom s\'ha retirat: no hi ha showdown.',
        youWon: 'Has guanyat {amount} fitxes', youLost: 'Has perdut {amount} fitxes', youFlat: 'Mà neutra',
        next: 'Mà següent', newGame: 'Nova partida', analysis: 'Anàlisi', yourHandWas: 'La teva mà: {hand}',
        eqAt: 'La teva equity al {street} era del {eq}', broke: 'T\'has quedat sense fitxes. En mode pràctica recompres automàticament.' }
    },
    es: {
      tab: 'Simulador',
      setup: { eyebrow: 'Simulador', title: 'Juega una mano de verdad',
        lede: 'Texas Hold\'em completo contra oponentes con estrategias distintas. Ciegas, posiciones, botes paralelos, showdown y análisis de la mano: todo calculado en esta página.',
        players: 'Jugadores en la mesa', stack: 'Fichas iniciales', blinds: 'Ciegas', name: 'Tu nombre',
        difficulty: 'Nivel de la IA', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        start: 'Repartir la primera mano', rivals: 'Rivales', styleLabel: 'Estilo',
        practice: 'Modo práctica', practiceNote: 'Recompra automática cuando te quedes sin fichas: manos ilimitadas para aprender sin presión.',
        autoplay: 'Mano siguiente automática' },
      styles: { tag: 'Sólido agresivo (TAG)', lag: 'Muy agresivo (LAG)', nit: 'Conservador (Nit)', random: 'Imprevisible' },
      table: { pot: 'Bote', total: 'Bote total', stack: 'Fichas', toCall: 'Por pagar', street: { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' },
        showdown: 'Showdown', thinking: 'pensando…', yourTurn: 'Es tu turno', waiting: 'Esperando a los rivales…',
        folded: 'retirado', allin: 'ALL-IN', hand: 'Mano {n}', you: 'Tú', empty: 'asiento vacío',
        blindsAre: 'Ciegas {sb}/{bb}', yourHand: 'Tu mano: {hand}' },
      act: { fold: 'Retirarse', check: 'Pasar', call: 'Pagar {n}', bet: 'Apostar', raise: 'Subir', allin: 'ALL-IN {n}',
        amount: 'Cantidad', half: '½ bote', threeq: '¾ bote', pot: 'Bote', min: 'Mín', max: 'Máx', confirm: 'Confirmar {n}',
        back: 'Atrás', betTo: 'Apostar {n}', raiseTo: 'Subir a {n}' },
      tip: { fold: 'Abandonas la mano y pierdes lo ya invertido. Es correcto siempre que el precio no compense tu equity.',
        check: 'Sigues en la mano sin poner fichas. Solo es posible si nadie ha apostado antes que tú.',
        call: 'Igualas la apuesta. Solo gana si tienes la mejor mano: no puedes ganar el bote haciendo que se retiren.',
        bet: 'Pones fichas cuando nadie lo ha hecho. Gana de dos formas: la mejor mano o que todos se retiren.',
        raise: 'Aumentas la apuesta del rival. La subida mínima es del tamaño de la última apuesta.',
        allin: 'Pones todas tus fichas. Si alguien no puede cubrirte, se crea un bote paralelo.' },
      help: { title: 'Ayuda didáctica', potOdds: 'Pot odds', potOddsText: 'Pagas {call} por un bote de {pot}: necesitas ganar el {need} de las veces.',
        equity: 'Tu equity', calc: 'Calcular mi equity', calcing: 'Simulando…',
        equityText: 'Ganas el {eq} contra {n} rival(es) si la mano llega al final.',
        verdictOk: 'El precio compensa: tienes más equity de la que te exige el bote.',
        verdictNo: 'El precio no compensa con la mano actual.',
        range: 'Rango recomendado desde {pos}', rangeText: 'Desde esta posición se juega aproximadamente el {pct} de las manos. Tu mano {hand} {inr}.',
        inRange: 'entra', outRange: 'no entra', position: 'Posición' },
      stats: { title: 'Tus estadísticas', hands: 'Manos jugadas', won: 'Manos ganadas', winrate: 'Manos ganadas (%)',
        showdown: 'Showdowns ganados', net: 'Balance de fichas', biggest: 'Bote más grande', reset: 'Borrar estadísticas', vpip: 'VPIP' },
      logT: { title: 'Historial de la mano', empty: 'Todavía no hay acciones.',
        sb: 'ciega pequeña', bb: 'ciega grande', fold: 'se retira', check: 'pasa', call: 'paga', bet: 'apuesta', raise: 'sube a', allin: 'va all-in' },
      res: { title: 'Resultado de la mano', winsWith: '{name} gana {amount} con {hand}', wins: '{name} gana {amount}',
        split: 'Bote repartido entre {names}', noShowdown: 'Todos se retiraron: no hay showdown.',
        youWon: 'Has ganado {amount} fichas', youLost: 'Has perdido {amount} fichas', youFlat: 'Mano neutra',
        next: 'Siguiente mano', newGame: 'Nueva partida', analysis: 'Análisis', yourHandWas: 'Tu mano: {hand}',
        eqAt: 'Tu equity en el {street} era del {eq}', broke: 'Te has quedado sin fichas. En modo práctica recompras automáticamente.' }
    },
    en: {
      tab: 'Simulator',
      setup: { eyebrow: 'Simulator', title: 'Play a real hand',
        lede: 'Full Texas Hold\'em against opponents with different strategies. Blinds, positions, side pots, showdown and hand analysis: all computed on this page.',
        players: 'Players at the table', stack: 'Starting stack', blinds: 'Blinds', name: 'Your name',
        difficulty: 'AI level', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        start: 'Deal the first hand', rivals: 'Opponents', styleLabel: 'Style',
        practice: 'Practice mode', practiceNote: 'Automatic rebuy when you run out of chips: unlimited hands to learn without pressure.',
        autoplay: 'Auto-deal next hand' },
      styles: { tag: 'Tight aggressive (TAG)', lag: 'Loose aggressive (LAG)', nit: 'Conservative (Nit)', random: 'Unpredictable' },
      table: { pot: 'Pot', total: 'Total pot', stack: 'Stack', toCall: 'To call', street: { preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River' },
        showdown: 'Showdown', thinking: 'thinking…', yourTurn: 'Your turn', waiting: 'Waiting for opponents…',
        folded: 'folded', allin: 'ALL-IN', hand: 'Hand {n}', you: 'You', empty: 'empty seat',
        blindsAre: 'Blinds {sb}/{bb}', yourHand: 'Your hand: {hand}' },
      act: { fold: 'Fold', check: 'Check', call: 'Call {n}', bet: 'Bet', raise: 'Raise', allin: 'ALL-IN {n}',
        amount: 'Amount', half: '½ pot', threeq: '¾ pot', pot: 'Pot', min: 'Min', max: 'Max', confirm: 'Confirm {n}',
        back: 'Back', betTo: 'Bet {n}', raiseTo: 'Raise to {n}' },
      tip: { fold: 'You give up the hand and lose what you already put in. Correct whenever the price does not match your equity.',
        check: 'You stay in the hand without betting. Only possible if nobody has bet before you.',
        call: 'You match the bet. It only wins by having the best hand: you cannot win the pot by making people fold.',
        bet: 'You put chips in when nobody has. It wins two ways: best hand, or everyone folds.',
        raise: 'You increase your opponent\'s bet. The minimum raise equals the size of the last bet.',
        allin: 'You push your whole stack. If someone cannot cover you, a side pot is created.' },
      help: { title: 'Learning aids', potOdds: 'Pot odds', potOddsText: 'You pay {call} for a {pot} pot: you need to win {need} of the time.',
        equity: 'Your equity', calc: 'Compute my equity', calcing: 'Simulating…',
        equityText: 'You win {eq} against {n} opponent(s) if the hand goes to the end.',
        verdictOk: 'The price is right: you have more equity than the pot demands.',
        verdictNo: 'The price is wrong for this hand.',
        range: 'Recommended range from {pos}', rangeText: 'From this position roughly {pct} of hands are played. Your hand {hand} {inr}.',
        inRange: 'is in range', outRange: 'is out of range', position: 'Position' },
      stats: { title: 'Your statistics', hands: 'Hands played', won: 'Hands won', winrate: 'Hands won (%)',
        showdown: 'Showdowns won', net: 'Chip balance', biggest: 'Biggest pot', reset: 'Clear statistics', vpip: 'VPIP' },
      logT: { title: 'Hand history', empty: 'No actions yet.',
        sb: 'small blind', bb: 'big blind', fold: 'folds', check: 'checks', call: 'calls', bet: 'bets', raise: 'raises to', allin: 'goes all-in' },
      res: { title: 'Hand result', winsWith: '{name} wins {amount} with {hand}', wins: '{name} wins {amount}',
        split: 'Pot split between {names}', noShowdown: 'Everyone folded: no showdown.',
        youWon: 'You won {amount} chips', youLost: 'You lost {amount} chips', youFlat: 'Break-even hand',
        next: 'Next hand', newGame: 'New game', analysis: 'Analysis', yourHandWas: 'Your hand: {hand}',
        eqAt: 'Your equity on the {street} was {eq}', broke: 'You are out of chips. Practice mode rebuys automatically.' }
    }
  };

  /* Inyecta los textos y coloca la pestaña justo después de "Com es juga". */
  ['ca', 'es', 'en'].forEach(code => {
    if (!C[code]) return;
    C[code].UI.sim = TXT[code];
    const at = C[code].TABS.findIndex(x => x.id === 'reglas');
    C[code].TABS.splice(at + 1, 0, { id: 'simulador', label: TXT[code].tab });
  });
  const i = PM_CORE.TABS.indexOf('reglas');
  if (PM_CORE.TABS.indexOf('simulador') === -1) PM_CORE.TABS.splice(i + 1, 0, 'simulador');
})();
