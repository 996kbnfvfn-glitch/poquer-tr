/* ============================================================================
   POKERMIND · Textos de l'entrevista (tres idiomes)
   La pestanya s'insereix just després de "Casos". Els textos d'aquí són veu de
   la web: descriuen J. i el context. Les seves paraules només són a
   entrevista.data.js i no es toquen mai.
   ========================================================================== */
(function () {
  'use strict';
  const C = window.PM_CONTENT;

  const TXT = {
    ca: {
      tab: 'L’entrevista',
      /* Peu de pàgina: canvieu aquests quatre valors pels vostres. */
      credit: { who: '[NOM I COGNOMS]', work: 'Treball de Recerca',
                school: '[NOM DE L’INSTITUT]', year: '[CURS, p. ex. 2n de Batxillerat · 2025-2026]' },
      lead: 'Un jugador que en viu des de fa set anys ho explica així:',
      lead2: 'Qui s’hi dedica ho resumeix amb altres paraules:',
      heroCta: 'Escolta l’entrevista',
      eyebrow: 'Font primària',
      title: 'Una hora amb un jugador professional',
      lede: 'La part pràctica d’aquest treball inclou una entrevista amb un jugador professional de pòquer en actiu. Les frases que apareixen al llarg de la web surten d’aquí, i es poden escoltar totes amb un clic.',
      who: 'Qui és J.',
      whoText: 'J. és el nom que fem servir per referir-nos-hi. Té 32 anys i en fa set que viu del pòquer: juga partides de cash en línia de No-Limit Texas Hold’em a sis jugadors, en nivells NL200–NL500, i hi dedica entre 15 i 20 hores d’estudi cada setmana.',
      anon: 'Per què és anònim',
      anonText: 'Va acceptar participar-hi amb la condició de no donar el seu nom, i per això també té la veu modificada. Hi ha tres motius: la privacitat, evitar l’etiqueta social que encara acompanya qui viu del joc, i un de pràctic — en el pòquer en línia, els rivals estudien els jugadors coneguts i aprofiten tot el que en saben.',
      rel: 'Què hi aporta al treball',
      relText: 'L’entrevista posa a prova les tres hipòtesis del treball amb l’experiència de qui en viu: que la matemàtica decideix el llarg termini, que el control emocional val tant com el càlcul i que la gestió del bankroll és el que separa jugar bé de sobreviure-hi.',
      fitxa: { age: '32 anys', years: '7 anys de professional', game: 'Cash NL Hold’em 6-max',
               stakes: 'NL200 – NL500', study: '15–20 h d’estudi setmanals' },
      player: 'Escolta l’entrevista sencera',
      playerHint: 'Vint minuts. L’àudio no es descarrega fins que el demanes.',
      chapters: 'Capítols',
      chaptersHint: 'Fes clic a qualsevol capítol per saltar-hi.',
      blocs: { intro: 'Presentació', bankroll: 'Bloc 1 · Gestió del bankroll',
               mates: 'Bloc 2 · Matemàtiques', psico: 'Bloc 3 · Psicologia i tilt', comiat: 'Comiat' },
      nowPlaying: 'sonant ara',
      quotes: 'Les frases, una per una',
      quotesHint: 'Agrupades per tema. Cada botó reprodueix exactament el tros on es diu.',
      featured: 'Les cinc que sostenen el treball',
      eixos: { tesi: 'La tesi', prob: 'Probabilitat', estrategia: 'Estratègia',
               bankroll: 'Bankroll', psico: 'Psicologia i tilt', realisme: 'La realitat de l’ofici',
               tancament: 'Tancament' },
      /* Component de cita */
      cite: { author: 'jugador professional de pòquer', pseudo: 'anònim',
              play: 'Escolta la resposta', stop: 'Atura', context: 'Escolta-la al context',
              ariaPlay: 'Escolta la resposta a partir del minut {t}',
              ariaStop: 'Atura la reproducció',
              ariaContext: 'Obre l’entrevista sencera al minut {t}',
              trad: null },
      loading: 'Carregant l’àudio…',
      err: 'No s’ha pogut reproduir l’àudio. Prova de tornar-hi.'
    },

    es: {
      tab: 'La entrevista',
      credit: { who: '[NOMBRE Y APELLIDOS]', work: 'Trabajo de Investigación',
                school: '[NOMBRE DEL INSTITUTO]', year: '[CURSO, p. ej. 2º de Bachillerato · 2025-2026]' },
      lead: 'Un jugador que vive de ello desde hace siete años lo explica así:',
      lead2: 'Quien se dedica a ello lo resume con otras palabras:',
      heroCta: 'Escucha la entrevista',
      eyebrow: 'Fuente primaria',
      title: 'Una hora con un jugador profesional',
      lede: 'La parte práctica de este trabajo incluye una entrevista con un jugador profesional de póker en activo. Las frases que aparecen a lo largo de la web salen de aquí, y se pueden escuchar todas con un clic.',
      who: 'Quién es J.',
      whoText: 'J. es el nombre que usamos para referirnos a él. Tiene 32 años y lleva siete viviendo del póker: juega partidas de cash online de No-Limit Texas Hold’em a seis jugadores, en niveles NL200–NL500, y les dedica entre 15 y 20 horas de estudio cada semana.',
      anon: 'Por qué es anónimo',
      anonText: 'Aceptó participar con la condición de no dar su nombre, y por eso también tiene la voz modificada. Hay tres motivos: la privacidad, evitar la etiqueta social que todavía acompaña a quien vive del juego, y uno práctico — en el póker online, los rivales estudian a los jugadores conocidos y aprovechan todo lo que saben de ellos.',
      rel: 'Qué aporta al trabajo',
      relText: 'La entrevista pone a prueba las tres hipótesis del trabajo con la experiencia de quien vive de ello: que la matemática decide el largo plazo, que el control emocional vale tanto como el cálculo y que la gestión del bankroll es lo que separa jugar bien de sobrevivir.',
      fitxa: { age: '32 años', years: '7 años de profesional', game: 'Cash NL Hold’em 6-max',
               stakes: 'NL200 – NL500', study: '15–20 h de estudio semanales' },
      player: 'Escucha la entrevista entera',
      playerHint: 'Veinte minutos. El audio no se descarga hasta que lo pides.',
      chapters: 'Capítulos',
      chaptersHint: 'Haz clic en cualquier capítulo para saltar a él.',
      blocs: { intro: 'Presentación', bankroll: 'Bloque 1 · Gestión del bankroll',
               mates: 'Bloque 2 · Matemáticas', psico: 'Bloque 3 · Psicología y tilt', comiat: 'Despedida' },
      nowPlaying: 'sonando ahora',
      quotes: 'Las frases, una a una',
      quotesHint: 'Agrupadas por tema. Cada botón reproduce exactamente el fragmento donde se dice.',
      featured: 'Las cinco que sostienen el trabajo',
      eixos: { tesi: 'La tesis', prob: 'Probabilidad', estrategia: 'Estrategia',
               bankroll: 'Bankroll', psico: 'Psicología y tilt', realisme: 'La realidad del oficio',
               tancament: 'Cierre' },
      cite: { author: 'jugador profesional de póker', pseudo: 'anónimo',
              play: 'Escucha la respuesta', stop: 'Parar', context: 'Escúchala en contexto',
              ariaPlay: 'Escucha la respuesta a partir del minuto {t}',
              ariaStop: 'Detener la reproducción',
              ariaContext: 'Abre la entrevista entera en el minuto {t}',
              trad: 'Traducción' },
      loading: 'Cargando el audio…',
      err: 'No se ha podido reproducir el audio. Inténtalo de nuevo.'
    },

    en: {
      tab: 'The interview',
      credit: { who: '[FULL NAME]', work: 'Research Project',
                school: '[SCHOOL NAME]', year: '[YEAR, e.g. Upper Secondary 2 · 2025-2026]' },
      lead: 'A player who has lived off it for seven years puts it like this:',
      lead2: 'Someone who does it for a living sums it up differently:',
      heroCta: 'Listen to the interview',
      eyebrow: 'Primary source',
      title: 'An hour with a professional player',
      lede: 'The practical part of this project includes an interview with a working professional poker player. The quotes that appear across the site come from here, and every one of them can be heard with a click.',
      who: 'Who J. is',
      whoText: 'J. is the name we use for him. He is 32 and has made his living from poker for seven years: he plays six-handed No-Limit Texas Hold’em cash games online at NL200–NL500, and puts in 15 to 20 hours of study a week.',
      anon: 'Why he is anonymous',
      anonText: 'He agreed to take part on condition that his name was not used, which is also why his voice is altered. There are three reasons: privacy, avoiding the social label that still follows people who live off gambling, and a practical one — in online poker, opponents study known players and use everything they know about them.',
      rel: 'What it brings to the project',
      relText: 'The interview tests the project’s three hypotheses against the experience of someone who lives by them: that mathematics decides the long run, that emotional control counts as much as calculation, and that bankroll management is what separates playing well from surviving.',
      fitxa: { age: '32 years old', years: '7 years as a pro', game: 'NL Hold’em cash, 6-max',
               stakes: 'NL200 – NL500', study: '15–20 h of study a week' },
      player: 'Listen to the full interview',
      playerHint: 'Twenty minutes. The audio is not downloaded until you ask for it.',
      chapters: 'Chapters',
      chaptersHint: 'Click any chapter to jump to it.',
      blocs: { intro: 'Introduction', bankroll: 'Part 1 · Bankroll management',
               mates: 'Part 2 · Mathematics', psico: 'Part 3 · Psychology and tilt', comiat: 'Closing' },
      nowPlaying: 'playing now',
      quotes: 'The quotes, one by one',
      quotesHint: 'Grouped by theme. Each button plays exactly the passage where it is said.',
      featured: 'The five that carry the project',
      eixos: { tesi: 'The thesis', prob: 'Probability', estrategia: 'Strategy',
               bankroll: 'Bankroll', psico: 'Psychology and tilt', realisme: 'The reality of the job',
               tancament: 'Closing' },
      cite: { author: 'professional poker player', pseudo: 'anonymous',
              play: 'Listen to the answer', stop: 'Stop', context: 'Hear it in context',
              ariaPlay: 'Listen to the answer from minute {t}',
              ariaStop: 'Stop playback',
              ariaContext: 'Open the full interview at minute {t}',
              trad: 'Translation' },
      loading: 'Loading the audio…',
      err: 'The audio could not be played. Please try again.'
    }
  };

  /* La pestanya va just després de "Casos". */
  ['ca', 'es', 'en'].forEach(code => {
    if (!C[code]) return;
    C[code].UI.ent = TXT[code];
    if (C[code].TABS.some(x => x.id === 'entrevista')) return;
    const at = C[code].TABS.findIndex(x => x.id === 'casos');
    C[code].TABS.splice(at + 1, 0, { id: 'entrevista', label: TXT[code].tab });
  });
  if (PM_CORE.TABS.indexOf('entrevista') === -1) {
    PM_CORE.TABS.splice(PM_CORE.TABS.indexOf('casos') + 1, 0, 'entrevista');
  }
})();
