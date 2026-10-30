/* ============================================================================
   POKERMIND · Textos de les millores (avís d'emmagatzematge, cercador, menú)
   Van en un fitxer a part per no tocar els tres fitxers de contingut existents.
   ========================================================================== */
(function () {
  'use strict';
  const K = window.PM_CONTENT;

  const TXT = {
    ca: {
      consent: {
        open: 'Privacitat i emmagatzematge',
        title: 'Privacitat i emmagatzematge',
        lede: 'Aquesta web no fa servir cookies, ni analítica, ni píxels de seguiment. Res del que facis aquí s’envia a cap servidor nostre.',
        body: 'L’únic que es desa és al teu propi navegador. Les preferències d’idioma i de tema són necessàries perquè la web recordi el que has triat. El progrés de les habilitats i les estadístiques dels simuladors són opcionals: si les rebutges, la web funciona exactament igual.',
        third: 'Les tipografies i les llibreries de la pàgina es carreguen des de Google Fonts, Cloudflare i jsDelivr. Aquests serveis reben la teva adreça IP quan obres la web.',
        accept: 'Acceptar-ho tot',
        reject: 'Només l’essencial',
        config: 'Configurar',
        save: 'Desar la meva tria',
        policy: 'Llegir la política completa',
        catEss: 'Essencial',
        catEssDesc: 'Idioma, tema clar/fosc i aquesta mateixa decisió. Exempt de consentiment: sense això la web no pot recordar el que tries.',
        catOpt: 'Progrés i estadístiques',
        catOptDesc: 'Arbre d’habilitats, estadístiques del simulador de pòquer i del de blackjack. Només al teu navegador, mai surten del dispositiu.',
        always: 'Sempre actiu',
        on: 'Activat',
        off: 'Desactivat',
        okAll: 'Emmagatzematge opcional activat.',
        okNone: 'Emmagatzematge opcional desactivat i dades esborrades.',
        change: 'Pots canviar-ho quan vulguis des del peu de pàgina.',
        keys: 'Claus que es desen'
      },
      search: {
        open: 'Cercar al lloc',
        title: 'Cercar al lloc',
        placeholder: 'Secció, terme, mà, cas…',
        empty: 'Cap resultat per “{q}”.',
        emptyHint: 'Prova amb una paraula més curta o en singular.',
        idle: 'Escriu per cercar a totes les seccions, al vocabulari, a les mans i als casos.',
        count: '{n} resultats',
        count1: '1 resultat',
        navigate: 'moure’s',
        select: 'obrir',
        close: 'tancar',
        groups: {
          tab: 'Seccions', term: 'Vocabulari', history: 'Història', variant: 'Modalitats',
          hand: 'Jugades', position: 'Posicions', action: 'Accions', skill: 'Habilitats',
          mental: 'Joc mental', tell: 'Tells', bias: 'Lectura del rival', archetype: 'Perfils',
          case: 'Casos reals', sheet: 'Resums', quiz: 'Preguntes'
        }
      },
      menu: {
        open: 'Obrir el menú',
        close: 'Tancar el menú',
        title: 'Menú',
        sections: 'Seccions',
        tools: 'Eines i preferències',
        lang: 'Idioma',
        theme: 'Tema',
        themeDark: 'Fosc',
        themeLight: 'Clar',
        sound: 'So',
        soundOn: 'Activat',
        soundOff: 'Desactivat',
        search: 'Cercar al lloc',
        shortcuts: 'Dreceres de teclat',
        privacy: 'Privacitat i emmagatzematge'
      },
      load: { dealing: 'Repartint…', simulating: 'Simulant', of: 'de' }
    },

    es: {
      consent: {
        open: 'Privacidad y almacenamiento',
        title: 'Privacidad y almacenamiento',
        lede: 'Esta web no usa cookies, ni analítica, ni píxeles de seguimiento. Nada de lo que hagas aquí se envía a ningún servidor nuestro.',
        body: 'Lo único que se guarda está en tu propio navegador. Las preferencias de idioma y de tema son necesarias para que la web recuerde lo que has elegido. El progreso de las habilidades y las estadísticas de los simuladores son opcionales: si los rechazas, la web funciona exactamente igual.',
        third: 'Las tipografías y las librerías de la página se cargan desde Google Fonts, Cloudflare y jsDelivr. Estos servicios reciben tu dirección IP cuando abres la web.',
        accept: 'Aceptarlo todo',
        reject: 'Solo lo esencial',
        config: 'Configurar',
        save: 'Guardar mi elección',
        policy: 'Leer la política completa',
        catEss: 'Esencial',
        catEssDesc: 'Idioma, tema claro/oscuro y esta misma decisión. Exento de consentimiento: sin esto la web no puede recordar lo que eliges.',
        catOpt: 'Progreso y estadísticas',
        catOptDesc: 'Árbol de habilidades, estadísticas del simulador de póker y del de blackjack. Solo en tu navegador, nunca salen del dispositivo.',
        always: 'Siempre activo',
        on: 'Activado',
        off: 'Desactivado',
        okAll: 'Almacenamiento opcional activado.',
        okNone: 'Almacenamiento opcional desactivado y datos borrados.',
        change: 'Puedes cambiarlo cuando quieras desde el pie de página.',
        keys: 'Claves que se guardan'
      },
      search: {
        open: 'Buscar en el sitio',
        title: 'Buscar en el sitio',
        placeholder: 'Sección, término, mano, caso…',
        empty: 'Ningún resultado para «{q}».',
        emptyHint: 'Prueba con una palabra más corta o en singular.',
        idle: 'Escribe para buscar en todas las secciones, el vocabulario, las manos y los casos.',
        count: '{n} resultados',
        count1: '1 resultado',
        navigate: 'moverse',
        select: 'abrir',
        close: 'cerrar',
        groups: {
          tab: 'Secciones', term: 'Vocabulario', history: 'Historia', variant: 'Modalidades',
          hand: 'Jugadas', position: 'Posiciones', action: 'Acciones', skill: 'Habilidades',
          mental: 'Juego mental', tell: 'Tells', bias: 'Lectura del rival', archetype: 'Perfiles',
          case: 'Casos reales', sheet: 'Resúmenes', quiz: 'Preguntas'
        }
      },
      menu: {
        open: 'Abrir el menú',
        close: 'Cerrar el menú',
        title: 'Menú',
        sections: 'Secciones',
        tools: 'Herramientas y preferencias',
        lang: 'Idioma',
        theme: 'Tema',
        themeDark: 'Oscuro',
        themeLight: 'Claro',
        sound: 'Sonido',
        soundOn: 'Activado',
        soundOff: 'Desactivado',
        search: 'Buscar en el sitio',
        shortcuts: 'Atajos de teclado',
        privacy: 'Privacidad y almacenamiento'
      },
      load: { dealing: 'Repartiendo…', simulating: 'Simulando', of: 'de' }
    },

    en: {
      consent: {
        open: 'Privacy and storage',
        title: 'Privacy and storage',
        lede: 'This site uses no cookies, no analytics and no tracking pixels. Nothing you do here is sent to a server of ours.',
        body: 'The only thing stored lives in your own browser. Language and theme preferences are needed for the site to remember what you picked. Skill-tree progress and simulator statistics are optional: if you decline them, the site works exactly the same.',
        third: 'The page loads its fonts and libraries from Google Fonts, Cloudflare and jsDelivr. Those services receive your IP address when you open the site.',
        accept: 'Accept all',
        reject: 'Essential only',
        config: 'Configure',
        save: 'Save my choice',
        policy: 'Read the full policy',
        catEss: 'Essential',
        catEssDesc: 'Language, light/dark theme and this decision itself. Exempt from consent: without it the site cannot remember your choices.',
        catOpt: 'Progress and statistics',
        catOptDesc: 'Skill tree, poker simulator statistics and blackjack simulator statistics. Kept in your browser only, never leaves the device.',
        always: 'Always on',
        on: 'On',
        off: 'Off',
        okAll: 'Optional storage enabled.',
        okNone: 'Optional storage disabled and data deleted.',
        change: 'You can change this at any time from the footer.',
        keys: 'Keys that are stored'
      },
      search: {
        open: 'Search the site',
        title: 'Search the site',
        placeholder: 'Section, term, hand, case…',
        empty: 'No results for “{q}”.',
        emptyHint: 'Try a shorter word, or the singular form.',
        idle: 'Type to search every section, the glossary, the hands and the case studies.',
        count: '{n} results',
        count1: '1 result',
        navigate: 'move',
        select: 'open',
        close: 'close',
        groups: {
          tab: 'Sections', term: 'Glossary', history: 'History', variant: 'Variants',
          hand: 'Hand rankings', position: 'Positions', action: 'Actions', skill: 'Skills',
          mental: 'Mental game', tell: 'Tells', bias: 'Reading opponents', archetype: 'Profiles',
          case: 'Real cases', sheet: 'Cheat sheets', quiz: 'Quiz'
        }
      },
      menu: {
        open: 'Open menu',
        close: 'Close menu',
        title: 'Menu',
        sections: 'Sections',
        tools: 'Tools and preferences',
        lang: 'Language',
        theme: 'Theme',
        themeDark: 'Dark',
        themeLight: 'Light',
        sound: 'Sound',
        soundOn: 'On',
        soundOff: 'Off',
        search: 'Search the site',
        shortcuts: 'Keyboard shortcuts',
        privacy: 'Privacy and storage'
      },
      load: { dealing: 'Dealing…', simulating: 'Simulating', of: 'of' }
    }
  };

  ['ca', 'es', 'en'].forEach(code => {
    if (!K[code]) return;
    K[code].UI.consent = TXT[code].consent;
    K[code].UI.search  = TXT[code].search;
    K[code].UI.menu    = TXT[code].menu;
    K[code].UI.load    = TXT[code].load;
  });
})();
