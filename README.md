# EL RESPLANDOR — Escape del Hotel Overlook

Videojuego 2D de terror y supervivencia en perspectiva cenital, desarrollado con **Phaser 3 + Vite**.
Controlas a **Danny Torrance**, que debe escapar del hotel Overlook esquivando a los fantasmas
que patrullan sus pasillos.

Inspirado en la atmósfera de *El resplandor* de Stephen King.

## Requisitos

- Node.js 18 o superior
- npm

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto http://localhost:5173).

Para compilar la versión de producción:

```bash
npm run build
npm run preview
```

## Publicar en GitHub Pages

El juego **debe publicarse compilado** (carpeta `dist`), no el código fuente:
el `index.html` de la raíz usa `/src/main.js`, que solo funciona con el servidor de Vite.

La forma recomendada es con el workflow incluido en `.github/workflows/deploy.yml`:

1. Sube el proyecto a GitHub (rama `main` o `master`).
2. En el repositorio ve a **Settings → Pages → Build and deployment**.
3. En **Source** elige **GitHub Actions**.
4. Haz push a `main`. El workflow compila (`npm run build`) y publica `dist`.

La URL quedará como `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

Alternativa manual: ejecuta `npm run build` y sube **el contenido** de `dist/`
a la rama `gh-pages` (o a la raíz de un repo `TU_USUARIO.github.io`).

## Controles

| Tecla | Acción |
|-------|--------|
| W / A / S / D o flechas | Mover a Danny |
| M | Activar / silenciar el sonido |

## Objetivo

Recorre los pasillos y habitaciones del Overlook y encuentra la **puerta de salida**
(zona verde en el vestíbulo sur). Evita a los fantasmas: cada contacto te quita vida.
Si tu vida llega a 0, la partida termina; si llegas a la puerta, escapas.

## Estructura del código

```
src/
  main.js                     Configuración de Phaser
  core/
    Constants.js              Valores configurables (velocidades, daño...)
    MapData.js                Mapa, spawns, decoración y consultas del grid
    Audio.js                  Sonido procedural con Web Audio API
  systems/
    Pathfinding.js            BFS en el grid para la IA de los fantasmas
    TextureFactory.js         Texturas generadas por código (sin assets externos)
    Ui.js                     Botones reutilizables
  entities/
    Player.js                 Danny: movimiento, colisiones, animaciones
    Ghost.js                  Fantasmas: patrulla, persecución y ataque
  scenes/
    BootScene.js              Generación de texturas/animaciones
    MenuScene.js              Menú principal
    GameScene.js              Lógica de la partida
    HudScene.js               Barra de vida e interfaz
    EndScene.js               Pantallas de victoria y derrota
scripts/
  check-map.mjs               Verificación de conectividad del mapa
```

Todos los gráficos y sonidos son **originales y generados por código** (Canvas + Web Audio),
por lo que no se requiere ningún recurso externo ni con licencia.

## Verificación del mapa

```bash
npm run check:map
```

Comprueba que la salida, los fantasmas, las lámparas y las habitaciones sean alcanzables.
