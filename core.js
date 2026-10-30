/* ============================================================================
   POKERMIND · Núcleo independiente del idioma
   Lo que no se traduce: orden de fuerza de las 169 manos y el índice de pestañas.
   ========================================================================== */
window.PM_CORE = (function () {
  'use strict';

  /* Orden aproximado de fuerza (all-in heads-up + jugabilidad posflop). */
  const HAND_ORDER = ('AA KK QQ JJ AKs AQs TT AKo AJs KQs 99 ATs AQo KJs 88 QJs KTs A9s AJo QTs KQo 77 JTs A8s K9s ' +
    'A7s ATo Q9s J9s KJo A5s 66 T9s A6s A4s QJo K8s A3s Q8s KTo A2s 98s J8s 55 T8s K7s QTo JTo A9o K6s 97s 87s K5s ' +
    '44 76s T7s K4s Q7s J7s K9o 86s 65s K3s 33 Q6s 96s A8o T6s 54s K2s Q5s 75s J6s Q9o 22 64s Q4s J9o T9o J5s 85s ' +
    '53s Q3s T5s A7o 43s 95s J4s Q2s K8o 74s T4s J3s 63s 98o 52s 84s J2s T3s A6o 42s 94s Q8o 62s T2s 32s 73s A5o ' +
    '93s K7o J8o 83s 87o 92s T8o A4o 82s 97o 72s Q7o K6o A3o 76o J7o 65o A2o K5o T7o Q6o 86o 54o K4o 96o 75o J6o ' +
    'Q5o 64o K3o T6o 53o 85o K2o Q4o J5o 95o 43o 74o Q3o T5o J4o 63o 84o Q2o 52o T4o J3o 42o 94o 73o 32o J2o T3o ' +
    '62o 93o 83o T2o 92o 82o 72o').split(/\s+/);

  /* Pestañas: el orden es el itinerario del curso. Las etiquetas llegan del idioma. */
  const TABS = ['inicio','historia','reglas','habilidades','mental','psicologia','probabilidad','recursos','casos','vocabulario'];

  return { HAND_ORDER, TABS };
})();
