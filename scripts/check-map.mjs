// Verifica que el mapa sea jugable: conectividad, salida,
// fantasmas, lámparas y mobiliario coherentes.
import {
  MAP_W,
  MAP_H,
  PLAYER_START,
  GHOST_DEFS,
  LAMPS,
  FURNITURE,
  DOOR_TILES,
  EXIT,
  TWINS_TILE,
  walkAt,
  blockedAt
} from '../src/core/MapData.js';

let ok = true;
const fail = (msg) => {
  ok = false;
  console.error('❌ ' + msg);
};
const pass = (msg) => console.log('✅ ' + msg);

// BFS desde el inicio del jugador (ignora mobiliario, valida arquitectura)
function reachableFrom(sx, sy) {
  const seen = new Uint8Array(MAP_W * MAP_H);
  const q = [[sx, sy]];
  seen[sy * MAP_W + sx] = 1;
  let head = 0;
  while (head < q.length) {
    const [x, y] = q[head++];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      const id = ny * MAP_W + nx;
      if (seen[id] || !walkAt(nx, ny)) continue;
      seen[id] = 1;
      q.push([nx, ny]);
    }
  }
  return { seen, q };
}

const { seen, q } = reachableFrom(PLAYER_START[0], PLAYER_START[1]);

// 1. Salida alcanzable
for (const [x, y] of EXIT.zoneTiles) {
  if (!seen[y * MAP_W + x]) fail(`La salida (${x},${y}) no es alcanzable`);
}
pass('Salida alcanzable desde el inicio');

// 2. Spawns de fantasmas alcanzables
for (const g of GHOST_DEFS) {
  const [x, y] = g.spawn;
  if (!seen[y * MAP_W + x]) fail(`Fantasma "${g.name}" en (${x},${y}) no alcanzable`);
  if (blockedAt(x, y)) fail(`Fantasma "${g.name}" aparece sobre una celda bloqueada`);
  for (const [wx, wy] of g.route) {
    if (!seen[wy * MAP_W + wx]) fail(`Waypoint (${wx},${wy}) de "${g.name}" no alcanzable`);
  }
}
pass('Fantasmas y rutas alcanzables');

// 3. Lámparas sobre piso libre
for (const L of LAMPS) {
  if (!walkAt(L.x, L.y)) fail(`Lámpara en (${L.x},${L.y}) no está sobre piso`);
}
pass('Lámparas sobre piso');

// 4. Todo el piso transitable es alcanzable (sin zonas aisladas)
let totalFloor = 0;
let unreachable = 0;
for (let y = 0; y < MAP_H; y++) {
  for (let x = 0; x < MAP_W; x++) {
    if (walkAt(x, y)) {
      totalFloor++;
      if (!seen[y * MAP_W + x]) {
        unreachable++;
        if (unreachable <= 8) console.warn(`   piso aislado: (${x},${y})`);
      }
    }
  }
}
if (unreachable > 0) fail(`${unreachable} casillas de piso aisladas de ${totalFloor}`);
else pass(`Todo el piso (${totalFloor} casillas) es alcanzable`);

// 5. Mobiliario sobre piso y sin bloquear puertas/salida/inicio
const doorSet = new Set(DOOR_TILES.map(([x, y]) => `${x},${y}`));
for (const f of FURNITURE) {
  const k = `${f.x},${f.y}`;
  if (!walkAt(f.x, f.y)) fail(`Mueble ${f.key} fuera del piso en (${f.x},${f.y})`);
  if (doorSet.has(k)) fail(`Mueble ${f.key} bloquea una puerta en (${f.x},${f.y})`);
  if (k === `${PLAYER_START[0]},${PLAYER_START[1]}`) fail('Mueble sobre el inicio del jugador');
  if (EXIT.zoneTiles.some(([x, y]) => `${x},${y}` === k)) fail('Mueble sobre la zona de salida');
}
pass('Mobiliario coherente');

// 6. Gemelas sobre piso
if (!walkAt(TWINS_TILE[0], TWINS_TILE[1])) fail('Aparición de gemelas fuera del piso');
else pass('Aparición de gemelas sobre piso');

// 7. Distancia mínima inicio -> salida
const exitTile = EXIT.zoneTiles[0];
const dist = Math.abs(exitTile[0] - PLAYER_START[0]) + Math.abs(exitTile[1] - PLAYER_START[1]);
if (dist < 10) fail(`Inicio demasiado cerca de la salida (${dist} casillas)`);
else pass(`Distancia Manhattan inicio→salida: ${dist} casillas`);

console.log('');
if (ok) {
  console.log('Mapa OK. Casillas alcanzables:', q.length);
  process.exit(0);
} else {
  console.error('Mapa con errores.');
  process.exit(1);
}
