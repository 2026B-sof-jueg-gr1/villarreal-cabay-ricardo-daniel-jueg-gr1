// ============================================================
// BFS sobre el grid del mapa. Los fantasmas lo usan para
// patrullar y perseguir respetando paredes y mobiliario.
// ============================================================

import { MAP_W, MAP_H, blockedAt } from '../core/MapData.js';

const N = MAP_W * MAP_H;
const prev = new Int32Array(N);
const seen = new Uint8Array(N);

/**
 * Devuelve el camino desde `start` hasta `goal` (excluyendo start)
 * como un arreglo de [x, y] en orden de recorrido, o null si no existe.
 */
export function findPath(start, goal) {
  const [sx, sy] = start;
  const [gx, gy] = goal;
  if (sx === gx && sy === gy) return [];
  if (gx < 0 || gy < 0 || gx >= MAP_W || gy >= MAP_H) return null;

  prev.fill(-1);
  seen.fill(0);

  const startId = sy * MAP_W + sx;
  const goalId = gy * MAP_W + gx;
  const queue = [startId];
  seen[startId] = 1;
  let head = 0;

  const dirs = [1, -1, MAP_W, -MAP_W];

  while (head < queue.length) {
    const cur = queue[head++];
    if (cur === goalId) {
      const path = [];
      let c = cur;
      while (c !== startId) {
        path.push([c % MAP_W, Math.floor(c / MAP_W)]);
        c = prev[c];
      }
      return path.reverse();
    }

    const cx = cur % MAP_W;
    const cy = Math.floor(cur / MAP_W);

    for (let d = 0; d < 4; d++) {
      const nid = cur + dirs[d];
      const nx = nid % MAP_W;
      const ny = Math.floor(nid / MAP_W);
      if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue; // evitar wrap de filas
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (seen[nid]) continue;
      const isGoal = nid === goalId;
      if (!isGoal && blockedAt(nx, ny)) continue;
      seen[nid] = 1;
      prev[nid] = cur;
      queue.push(nid);
    }
  }

  return null;
}
