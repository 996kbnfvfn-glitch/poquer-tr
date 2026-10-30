/* ============================================================================
   POKERMIND · Entrevista · Font única de dades
   ----------------------------------------------------------------------------
   Les 18 frases i els 12 capítols viuen NOMÉS aquí. Cap component no en copia
   el text: tot es llegeix d'aquest fitxer.

   `text` és la transcripció literal del que diu J. No es toca mai. L'única
   llicència és tipogràfica, tal com permet l'encàrrec: cometes «» i espai dur
   ( ) abans del símbol de percentatge, segons l'ús català.

   `trad` són traduccions editorials al castellà i a l'anglès perquè el lector
   que no llegeix català entengui la frase. Es marquen sempre com a traducció:
   la cita que s'atribueix a J. és únicament la catalana.

   `inici` i `final` delimiten en segons la resposta sencera on apareix la
   frase, per poder-la escoltar a l'àudio.
   ========================================================================== */
window.PM_ENTREVISTA = (function () {
  'use strict';

  /* L'extensió és .mp4 perquè és el contenidor real del fitxer (AAC dins
     d'MPEG-4) i és el que accepten tant els navegadors com l'allotjament.
     Prefix configurable: l'embolcall de la carpeta del Finder serveix la
     pàgina des d'un nivell per damunt dels actius. */
  const AUDIO = (window.PM_ASSET_BASE || '') + 'audio/entrevista-jugador-poquer.mp4';
  const DURADA = 1220;

  const FRASES = [
    { id: 'F01', eix: 'tesi', inici: 480, final: 516, tram: '08:00–08:36', destacada: true,
      text: 'A la ruleta l’avantatge sempre és de la casa: pots jugar perfecte tota la vida i perdràs. Al pòquer jugues contra persones, i qui pren millors decisions té avantatge a la llarga.',
      trad: { es: 'En la ruleta la ventaja siempre es de la casa: puedes jugar perfecto toda la vida y perderás. En el póker juegas contra personas, y quien toma mejores decisiones tiene ventaja a la larga.',
              en: 'In roulette the house always has the edge: you can play perfectly your whole life and you will lose. In poker you play against people, and whoever makes better decisions has the edge in the long run.' } },

    { id: 'F02', eix: 'prob', inici: 587, final: 607, tram: '09:47–10:07', destacada: true,
      text: 'Les matemàtiques no decideixen si guanyes aquesta mà. Decideixen si guanyaràs diners a la llarga.',
      trad: { es: 'Las matemáticas no deciden si ganas esta mano. Deciden si ganarás dinero a la larga.',
              en: 'Maths don’t decide whether you win this hand. They decide whether you’ll win money in the long run.' } },

    { id: 'F03', eix: 'bankroll', inici: 216, final: 263, tram: '03:36–04:23', destacada: true,
      text: 'No vaig perdre per mala sort. Vaig perdre per no tenir normes.',
      trad: { es: 'No perdí por mala suerte. Perdí por no tener normas.',
              en: 'I didn’t lose because of bad luck. I lost because I had no rules.' } },

    { id: 'F04', eix: 'psico', inici: 855, final: 910, tram: '14:15–15:10', destacada: true,
      text: 'La mala sort em va costar un pot. El tilt em va costar un mes.',
      trad: { es: 'La mala suerte me costó un bote. El tilt me costó un mes.',
              en: 'Bad luck cost me a pot. Tilt cost me a month.' } },

    { id: 'F05', eix: 'tancament', inici: 1210, final: 1220, tram: '20:10–20:20', destacada: true,
      text: 'Si algú et diu que el pòquer és pura sort, pregunta-li quantes mans ha jugat. La sort dura una nit. Les decisions, tota una carrera.',
      trad: { es: 'Si alguien te dice que el póker es pura suerte, pregúntale cuántas manos ha jugado. La suerte dura una noche. Las decisiones, toda una carrera.',
              en: 'If someone tells you poker is pure luck, ask them how many hands they’ve played. Luck lasts a night. Decisions last a career.' } },

    { id: 'F06', eix: 'prob', inici: 480, final: 516, tram: '08:00–08:36',
      text: 'Una decisió no es jutja pel resultat d’una mà, sinó pel que guanyaries si la repetissis milers de vegades.',
      trad: { es: 'Una decisión no se juzga por el resultado de una mano, sino por lo que ganarías si la repitieras miles de veces.',
              en: 'A decision isn’t judged by the result of one hand, but by what you’d win if you repeated it thousands of times.' } },

    { id: 'F07', eix: 'prob', inici: 520, final: 574, tram: '08:40–09:34',
      text: '50 sobre 200 és un 25 %: has de guanyar almenys una de cada quatre vegades perquè pagar valgui la pena.',
      trad: { es: '50 sobre 200 es un 25 %: tienes que ganar al menos una de cada cuatro veces para que pagar valga la pena.',
              en: '50 into 200 is 25%: you have to win at least one time in four for the call to be worth it.' } },

    { id: 'F08', eix: 'prob', inici: 520, final: 574, tram: '08:40–09:34',
      text: '9 entre 46 és un 19,6 %. Necessitaves un 25 %. Si pagues sempre aquí, a la llarga perds diners, sense comptar el que podries guanyar a les apostes posteriors.',
      trad: { es: '9 entre 46 es un 19,6 %. Necesitabas un 25 %. Si pagas siempre aquí, a la larga pierdes dinero, sin contar lo que podrías ganar en las apuestas posteriores.',
              en: '9 out of 46 is 19.6%. You needed 25%. If you always call here, in the long run you lose money, not counting what you could win on later streets.' } },

    { id: 'F09', eix: 'prob', inici: 732, final: 771, tram: '12:12–12:51',
      text: 'Un jugador guanyador pot perdre durant 100.000 mans o més per pura variància.',
      trad: { es: 'Un jugador ganador puede perder durante 100.000 manos o más por pura varianza.',
              en: 'A winning player can lose over 100,000 hands or more through pure variance.' } },

    { id: 'F10', eix: 'estrategia', inici: 652, final: 701, tram: '10:52–11:41',
      text: 'El GTO és l’estratègia teòricament òptima, basada en la teoria de jocs i l’equilibri de Nash: si la jugues, ningú no et pot explotar.',
      trad: { es: 'El GTO es la estrategia teóricamente óptima, basada en la teoría de juegos y el equilibrio de Nash: si la juegas, nadie puede explotarte.',
              en: 'GTO is the theoretically optimal strategy, based on game theory and the Nash equilibrium: if you play it, nobody can exploit you.' } },

    { id: 'F11', eix: 'estrategia', inici: 712, final: 722, tram: '11:52–12:02',
      text: 'L’examen és cada dia, el professor és la variància i la nota te la posa sis mesos després.',
      trad: { es: 'El examen es cada día, el profesor es la varianza y la nota te la pone seis meses después.',
              en: 'The exam is every day, the teacher is variance, and your grade arrives six months later.' } },

    { id: 'F12', eix: 'bankroll', inici: 191, final: 211, tram: '03:11–03:31',
      text: 'El pòquer no paga a final de mes. Paga quan vol, i tu has de funcionar com si fossis una empresa seriosa.',
      trad: { es: 'El póker no paga a final de mes. Paga cuando quiere, y tú tienes que funcionar como si fueras una empresa seria.',
              en: 'Poker doesn’t pay at the end of the month. It pays when it feels like it, and you have to run yourself like a serious business.' } },

    { id: 'F13', eix: 'bankroll', inici: 439, final: 460, tram: '07:19–07:40',
      text: 'Una ratxa dolenta et buida el compte. Una de bona et buida el cap.',
      trad: { es: 'Una mala racha te vacía la cuenta. Una buena te vacía la cabeza.',
              en: 'A bad run empties your account. A good one empties your head.' } },

    { id: 'F14', eix: 'psico', inici: 802, final: 852, tram: '13:22–14:12',
      text: 'No és estar enfadat. És estar enfadat i continuar convençut que jugues bé.',
      trad: { es: 'No es estar enfadado. Es estar enfadado y seguir convencido de que juegas bien.',
              en: 'It isn’t being angry. It’s being angry and still convinced you’re playing well.' } },

    { id: 'F15', eix: 'psico', inici: 1013, final: 1034, tram: '16:53–17:14',
      text: 'El problema no és la mala sort, és el que fas just després.',
      trad: { es: 'El problema no es la mala suerte, es lo que haces justo después.',
              en: 'The problem isn’t the bad luck, it’s what you do right afterwards.' } },

    { id: 'F16', eix: 'psico', inici: 1045, final: 1085, tram: '17:25–18:05',
      text: 'El resultat és d’avui; la decisió és l’única cosa que és teva.',
      trad: { es: 'El resultado es de hoy; la decisión es lo único que es tuyo.',
              en: 'The result belongs to today; the decision is the only thing that’s yours.' } },

    { id: 'F17', eix: 'psico', inici: 1149, final: 1185, tram: '19:09–19:45',
      text: 'El bankroll i les matemàtiques són les eines; el cap és la mà que les agafa.',
      trad: { es: 'El bankroll y las matemáticas son las herramientas; la cabeza es la mano que las coge.',
              en: 'Bankroll and maths are the tools; your head is the hand that holds them.' } },

    { id: 'F18', eix: 'realisme', inici: 1092, final: 1129, tram: '18:12–18:49',
      text: 'Guanyo com un enginyer amb uns anys d’experiència, però sense nòmina, sense vacances pagades i amb mesos en negatiu.',
      trad: { es: 'Gano como un ingeniero con unos años de experiencia, pero sin nómina, sin vacaciones pagadas y con meses en negativo.',
              en: 'I earn like an engineer with a few years’ experience, but with no payslip, no paid holiday and months in the red.' } }
  ];

  /* Els títols dels capítols són redacció de la web, no paraules de J.:
     per això sí que es tradueixen. */
  const CAPITOLS = [
    { inici: 0,    minut: '00:00', bloc: 'intro',
      titol: { ca: 'Presentació: qui és J. i per què és anònim',
               es: 'Presentación: quién es J. y por qué es anónimo',
               en: 'Introduction: who J. is and why he is anonymous' } },
    { inici: 99,   minut: '01:39', bloc: 'bankroll',
      titol: { ca: '1. Quants diners calen per viure del pòquer?',
               es: '1. ¿Cuánto dinero hace falta para vivir del póker?',
               en: '1. How much money do you need to live off poker?' } },
    { inici: 210,  minut: '03:30', bloc: 'bankroll',
      titol: { ca: '2. T’has quedat mai a zero?', es: '2. ¿Te has quedado alguna vez a cero?',
               en: '2. Have you ever gone broke?' } },
    { inici: 341,  minut: '05:41', bloc: 'bankroll',
      titol: { ca: '3. Les normes que no es trenquen', es: '3. Las normas que no se rompen',
               en: '3. The rules you never break' } },
    { inici: 459,  minut: '07:39', bloc: 'mates',
      titol: { ca: '4. És pura sort, com la ruleta?', es: '4. ¿Es pura suerte, como la ruleta?',
               en: '4. Is it pure luck, like roulette?' } },
    { inici: 607,  minut: '10:07', bloc: 'mates',
      titol: { ca: '5. Un dia d’estudi', es: '5. Un día de estudio', en: '5. A day of study' } },
    { inici: 721,  minut: '12:01', bloc: 'mates',
      titol: { ca: '6. Bo o afortunat?', es: '6. ¿Bueno o afortunado?', en: '6. Good or lucky?' } },
    { inici: 771,  minut: '12:51', bloc: 'psico',
      titol: { ca: '7. Què és el tilt', es: '7. Qué es el tilt', en: '7. What tilt is' } },
    { inici: 910,  minut: '15:10', bloc: 'psico',
      titol: { ca: '8. Com es nota i com se’n surt', es: '8. Cómo se nota y cómo se sale',
               en: '8. How you notice it and how you get out' } },
    { inici: 1034, minut: '17:14', bloc: 'psico',
      titol: { ca: '9. Perdre jugant bé, guanyar jugant malament',
               es: '9. Perder jugando bien, ganar jugando mal',
               en: '9. Losing when you play well, winning when you play badly' } },
    { inici: 1128, minut: '18:48', bloc: 'psico',
      titol: { ca: '10. Bankroll, matemàtiques o cap', es: '10. Bankroll, matemáticas o cabeza',
               en: '10. Bankroll, maths or mindset' } },
    { inici: 1185, minut: '19:45', bloc: 'comiat',
      titol: { ca: 'Comiat', es: 'Despedida', en: 'Closing' } }
  ];

  /* Ordre en què es presenten els eixos a la pàgina de l'entrevista. */
  const EIXOS = ['tesi', 'prob', 'estrategia', 'bankroll', 'psico', 'realisme', 'tancament'];

  const perId = id => FRASES.find(f => f.id === id) || null;
  const perEix = eix => FRASES.filter(f => f.eix === eix);
  const destacades = () => FRASES.filter(f => f.destacada);

  return { AUDIO, DURADA, FRASES, CAPITOLS, EIXOS, perId, perEix, destacades };
})();
