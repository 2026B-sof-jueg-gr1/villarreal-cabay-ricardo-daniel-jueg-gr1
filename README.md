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
