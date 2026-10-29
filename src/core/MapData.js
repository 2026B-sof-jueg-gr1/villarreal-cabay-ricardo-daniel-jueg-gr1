// ============================================================
// Mapa del Hotel Overlook
// Grid de 38 x 26 casillas (1216 x 832 px).
// Todo el mapa se construye mediante "carve" (excavado) de
// rectángulos sobre una base de paredes, lo que evita errores
// de transcripción y garantiza que las zonas estén conectadas.
// ============================================================

import { TILE } from './Constants.js';

export const MAP_W = 38;
export const MAP_H = 26;
export const WORLD_W = MAP_W * TILE;
export const WORLD_H = MAP_H * TILE;

// 1 = transitable, 0 = pared
const walk = new Uint8Array(MAP_W * MAP_H);
const idx = (x, y) => y * MAP_W + x;

function carve(x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1) {
        walk[idx(x, y)] = 1;
      }
    }
  }
}

// ---------- Pasillos principales ----------
carve(1, 1, 36, 2);     // pasillo norte
carve(1, 11, 36, 12);   // pasillo central
carve(1, 21, 36, 23);   // vestíbulo / pasillo sur
carve(6, 1, 7, 23);     // pasillo vertical oeste
carve(30, 1, 31, 23);   // pasillo vertical este

// ---------- Habitaciones ----------
carve(1, 4, 4, 9);      // habitación noroeste (pequeña)
carve(1, 14, 4, 19);    // habitación suroeste (pequeña)
carve(33, 4, 35, 9);    // habitación noreste (pequeña)
carve(33, 14, 35, 19);  // habitación sureste (pequeña)
carve(9, 4, 17, 9);     // suite noroeste (grande)
carve(19, 4, 28, 9);    // suite noreste (grande) -> inicio de Danny
carve(9, 14, 17, 19);   // suite suroeste (grande)
carve(19, 14, 28, 19);  // suite sureste (grande)

// ---------- Puertas (celdas de paso) ----------
export const DOOR_TILES = [
  [2, 3], [12, 3], [26, 3], [34, 3],
  [3, 10], [10, 10], [22, 10], [34, 10],
  [2, 13], [14, 13], [24, 13], [34, 13],
  [3, 20], [9, 20], [27, 20], [34, 20]
];
for (const [x, y] of DOOR_TILES) walk[idx(x, y)] = 1;

// Pasos entre suites (columna 18)
const SUITE_PASSAGES = [[18, 6], [18, 7], [18, 16], [18, 17]];
for (const [x, y] of SUITE_PASSAGES) walk[idx(x, y)] = 1;

// ---------- Salida ----------
// La puerta está en la pared sur (fila 24). El jugador no la cruza:
// pisar las casillas de la zona activa la victoria.
export const EXIT = {
  doorX: 18,
  doorY: 24,
  zoneTiles: [[18, 23], [19, 23]],
  x: 19 * TILE,
  y: 23 * TILE + TILE / 2
};
export const STONE_TILES = new Set(['18,23', '19,23']);

// ---------- Punto de inicio ----------
export const PLAYER_START = [24, 6];

// ---------- Fantasmas ----------
export const GHOST_DEFS = [
  { spawn: [10, 2], route: [[4, 2], [34, 2]], tint: 0xd9e2ff, name: 'susurro' },
  { spawn: [2, 11], route: [[2, 11], [35, 11]], tint: 0xd6c9ef, name: 'dama' },
  { spawn: [10, 22], route: [[2, 22], [34, 22]], tint: 0xcfe0d8, name: 'botones' },
  { spawn: [30, 16], route: [[30, 1], [30, 23]], tint: 0xe8d8c8, name: 'huésped' },
  { spawn: [6, 8], route: [[6, 1], [6, 22]], tint: 0xd0d0e8, name: 'gemelas' }
];

// ---------- Lámparas ----------
export const LAMPS = [
  { x: 4, y: 1, flicker: false }, { x: 13, y: 1, flicker: true },
  { x: 22, y: 1, flicker: false }, { x: 31, y: 1, flicker: false },
  { x: 5, y: 11, flicker: false }, { x: 14, y: 11, flicker: true },
  { x: 23, y: 11, flicker: false }, { x: 32, y: 11, flicker: false },
  { x: 8, y: 21, flicker: false }, { x: 17, y: 21, flicker: true },
  { x: 26, y: 21, flicker: false }, { x: 35, y: 21, flicker: false },
  { x: 6, y: 6, flicker: true }, { x: 6, y: 17, flicker: false },
  { x: 31, y: 10, flicker: false }, { x: 31, y: 18, flicker: true }
];

// ---------- Mobiliario (sólido) ----------
export const FURNITURE = [
  { key: 'dresser', x: 10, y: 4 }, { key: 'bed', x: 15, y: 5 }, { key: 'table', x: 14, y: 8 },
  { key: 'sofa', x: 27, y: 4 }, { key: 'chair', x: 20, y: 4 }, { key: 'dresser', x: 28, y: 8 },
  { key: 'bed', x: 10, y: 17 }, { key: 'dresser', x: 16, y: 19 }, { key: 'chair', x: 9, y: 15 },
  { key: 'table', x: 26, y: 17 }, { key: 'chair', x: 20, y: 18 }, { key: 'dresser', x: 27, y: 19 },
  { key: 'sofa', x: 12, y: 22 }, { key: 'chair', x: 16, y: 22 }, { key: 'sofa', x: 23, y: 22 },
  { key: 'chair', x: 2, y: 9 }, { key: 'dresser', x: 34, y: 8 },
  { key: 'table', x: 2, y: 15 }, { key: 'chair', x: 34, y: 19 }
];

// ---------- Decoración ----------
export const PAINTINGS = [
  [16, 3], [20, 3], [28, 3], [25, 10],
  [5, 13], [29, 13], [12, 20], [21, 20]
];
export const REDRUM_TILE = [21, 13];
export const BLOOD = [[24, 12], [10, 22]];
export const TWINS_TILE = [25, 12];

// ---------- Consultas ----------
const furnitureBlocked = new Set(FURNITURE.map((f) => `${f.x},${f.y}`));

export function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
}

export function walkAt(x, y) {
  return inBounds(x, y) && walk[idx(x, y)] === 1;
}

export function blockedAt(x, y) {
  if (!walkAt(x, y)) return true;
  return furnitureBlocked.has(`${x},${y}`);
}

export function tileCenter(x, y) {
  return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
}
