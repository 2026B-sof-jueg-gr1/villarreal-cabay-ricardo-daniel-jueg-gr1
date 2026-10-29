// ============================================================
// Fantasmas: patrullan su ruta y persiguen a Danny cuando lo
// detectan. La navegación usa BFS sobre el grid del mapa, por
// lo que respetan paredes, puertas y mobiliario.
// ============================================================

import Phaser from 'phaser';
import { TILE } from '../core/Constants.js';
import {
  GHOST_PATROL_SPEED,
  GHOST_CHASE_SPEED,
  GHOST_CHASE_RADIUS,
  GHOST_LOSE_RADIUS
} from '../core/Constants.js';
import { findPath } from '../systems/Pathfinding.js';

export default class Ghost extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, def, index = 0) {
    super(scene, def.spawn[0] * TILE + TILE / 2, def.spawn[1] * TILE + TILE / 2, 'ghost0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    this.setAlpha(0.82);
    this.body.setCircle(10, 6, 6);
    this.setCollideWorldBounds(true);
    this.setTint(def.tint || 0xdfe8ff);
    this.play({ key: 'ghostFloat', startFrame: index % 3 });
    this.anims.timeScale = 0.85 + Math.random() * 0.4;

    this.def = def;
    this.route = def.route;
    this.routeIdx = 0;
    this.state = 'patrol';
    this.path = null;
    this.pathIdx = 0;
    this.pathTimer = Math.random() * 250;
    this.dead = false;
    this.phase = Math.random() * Math.PI * 2;
    this.stuckMs = 0;
    this.px = this.x;
    this.py = this.y;

    // Halo visible por encima de la oscuridad
    this.aura = scene.add
      .image(this.x, this.y, 'orb')
      .setTint(0x9ab8e8)
      .setAlpha(0.13)
      .setScale(0.7)
      .setDepth(62);
  }

  update(dt) {
    if (this.dead || this.scene.finished) {
      this.setVelocity(0);
      if (this.aura) this.aura.setAlpha(0);
      return;
    }

    const player = this.scene.player;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (this.state === 'patrol' && dist < GHOST_CHASE_RADIUS) {
      this.state = 'chase';
      this.scene.onGhostAggro(this);
    } else if (this.state === 'chase' && dist > GHOST_LOSE_RADIUS) {
      this.state = 'patrol';
      this.path = null;
      this.pathTimer = 0;
    }

    this.pathTimer -= dt;
    if (!this.path || this.pathTimer <= 0) {
      this.pathTimer = this.state === 'chase' ? 300 : 900;
      const goal = this.state === 'chase' ? this.scene.playerTile() : this.route[this.routeIdx];
      this.path = findPath(this.scene.tileOf(this), goal);
      this.pathIdx = 1;
    }

    // Avanzar waypoint en patrulla
    if (this.state === 'patrol') {
      const wp = this.route[this.routeIdx];
      const wx = wp[0] * TILE + TILE / 2;
      const wy = wp[1] * TILE + TILE / 2;
      if (Phaser.Math.Distance.Between(this.x, this.y, wx, wy) < 20) {
        this.routeIdx = (this.routeIdx + 1) % this.route.length;
        this.path = null;
        this.pathTimer = 0;
      }
    }

    // Seguir el camino calculado
    let tx;
    let ty;
    if (this.path && this.pathIdx < this.path.length) {
      const node = this.path[this.pathIdx];
      tx = node[0] * TILE + TILE / 2;
      ty = node[1] * TILE + TILE / 2;
      if (Phaser.Math.Distance.Between(this.x, this.y, tx, ty) < 8) {
        this.pathIdx += 1;
      }
    } else if (this.state === 'chase') {
      tx = player.x;
      ty = player.y;
    } else {
      const wp = this.route[this.routeIdx];
      tx = wp[0] * TILE + TILE / 2;
      ty = wp[1] * TILE + TILE / 2;
    }

    const speed = this.state === 'chase' ? GHOST_CHASE_SPEED : GHOST_PATROL_SPEED;
    if (typeof tx === 'number' && typeof ty === 'number') {
      const ang = Math.atan2(ty - this.y, tx - this.x);
      this.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
      if (Math.abs(Math.cos(ang)) > 0.2) this.setFlipX(Math.cos(ang) < 0);
      this.setRotation(Math.sin(this.scene.time.now * 0.002 + this.phase) * 0.05);
    }

    // Detección de atasco
    const moved = Phaser.Math.Distance.Between(this.x, this.y, this.px, this.py);
    this.px = this.x;
    this.py = this.y;
    if (this.body.velocity.length() > 10 && moved < 0.4) {
      this.stuckMs += dt;
    } else {
      this.stuckMs = 0;
    }
    if (this.stuckMs > 700) {
      this.stuckMs = 0;
      this.path = null;
      this.pathTimer = 0;
      this.setVelocity((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
    }

    // Halo
    if (this.aura) {
      this.aura.setPosition(this.x, this.y);
      this.aura.setAlpha(this.state === 'chase' ? 0.22 : 0.13);
      this.aura.setTint(this.state === 'chase' ? 0xffa0a0 : 0x9ab8e8);
    }
  }

  freeze() {
    this.dead = true;
    this.setVelocity(0);
    this.anims.stop();
    if (this.aura) this.aura.setAlpha(0);
  }
}
