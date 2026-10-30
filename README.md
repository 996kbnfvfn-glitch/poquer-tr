# PokerMind · El pòquer Texas Hold'em com a joc d'habilitat

Web del Treball de Recerca sobre probabilitat, estratègia i psicologia del
Texas Hold'em, amb simuladors interactius i fragments d'una entrevista a un
jugador professional anònim.

Disponible en català, castellà i anglès.

## Com està feta

Web estàtica, sense cap pas de compilació: React 18 i htm carregats com a
scripts clàssics, i un sistema de disseny propi en CSS. Per veure-la en local
no cal instal·lar res, només servir la carpeta:

    python3 -m http.server 8000

## Com actualitzar-la

Editeu els fitxers, i després:

    git add -A
    git commit -m "Descripció del canvi"
    git push

GitHub Pages torna a publicar sola en un o dos minuts. L'adreça no canvia mai.
