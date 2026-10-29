// ============================================================
// Escena principal de juego: mapa, Danny, fantasmas, luz,
// daño, victoria y derrota.
// ============================================================

import Phaser from 'phaser';
import {
  TILE,
  MAX_HEALTH,
  GHOST_DAMAGE,
  INVULN_MS
} from '../core/Constants.js';
import {
  MAP_W,
  MAP_H,
  WORLD_W,
  WORLD_H,
  PLAYER_START,
  GHOST_DEFS,
  LAMPS,
  FURNITURE,
  PAINTINGS,
  DOOR_TILES,
  REDRUM_TILE,
  BLOOD,
  TWINS_TILE,
  EXIT,
  STONE_TILES,
  walkAt
} from '../core/MapData.js';
import Player from '../entities/Player.js';
import Ghost from '../entities/Ghost.js';
import { audio } from '../core/Audio.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.finished = false;
    this.twinsShown = false;
    this.lastScareAt = 0;

    this.registry.set('health', MAX_HEALTH);
    this.registry.set('hurtTick', 0);

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor('#050202');

    this.buildMap();

    // ---------- Danny ----------
    this.player = new Player(this, PLAYER_START[0], PLAYER_START[1]);
    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.add.collider(this.player, this.furnGroup);

    // ---------- Fantasmas ----------
    this.ghosts = GHOST_DEFS.map((def, i) => new Ghost(this, def, i));
    for (const ghost of this.ghosts) {
      this.physics.add.collider(ghost, this.wallGroup);
      this.physics.add.collider(ghost, this.furnGroup);
    }
    this.physics.add.overlap(this.player, this.ghosts, this.onGhostTouch, null, this);

    // ---------- Salida ----------
    this.physics.add.overlap(this.player, this.exitZone, this.onExitReached, null, this);

    // ---------- Cámara ----------
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.roundPixels = true;

    // ---------- Oscuridad y niebla ----------
    this.darkness = this.add
      .renderTexture(0, 0, 960, 640)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(60);
    this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(61);

    // ---------- Indicador de salida ----------
    this.exitArrow = this.add.image(0, 0, 'arrow').setDepth(63).setAlpha(0.3).setScale(0.9);

    // ---------- Gemelas ----------
    this.setupTwins();

    // ---------- HUD ----------
    this.scene.launch('Hud');

    // ---------- Audio ----------
    audio.startAmbient();
    audio.setGhostIntensity(0);

    // ---------- Controles ----------
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.addCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,M');
    this.input.keyboard.on('keydown-M', () => {
      audio.setMuted(!audio.muted);
    });

    // Latido cuando queda poca vida
    this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => {
        if (!this.finished && this.registry.get('health') <= 30) {
          audio.sfx('heartbeat');
        }
      }
    });
  }

  // ==========================================================
  // Construcción del mapa
  // ==========================================================
  buildMap() {
    this.wallGroup = this.physics.add.staticGroup();
    this.furnGroup = this.physics.add.staticGroup();
    this.lampStates = [];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const wx = x * TILE + TILE / 2;
        const wy = y * TILE + TILE / 2;

        if (walkAt(x, y)) {
          const key = STONE_TILES.has(`${x},${y}`) ? 'stone' : 'floor';
          this.add.image(wx, wy, key).setDepth(-10);
        } else {
          let nearFloor = false;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (walkAt(x + dx, y + dy)) {
              nearFloor = true;
              break;
            }
          }
          const shade = 0.9 + ((x * 37 + y * 91) % 9) * 0.012;
          const c = Math.floor(255 * shade);
          const tint = (c << 16) | (c << 8) | c;

          if (nearFloor) {
            this.wallGroup.create(wx, wy, 'wall').setDepth(0).setTint(tint);
          } else {
            this.add.image(wx, wy, 'wall').setDepth(0).setTint(tint);
          }
        }
      }
    }

    // Mobiliario sólido
    for (const f of FURNITURE) {
      this.furnGroup
        .create(f.x * TILE + TILE / 2, f.y * TILE + TILE / 2, f.key)
        .setDepth(8);
    }

    // Puertas
    for (const [x, y] of DOOR_TILES) {
      this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, 'doorway').setDepth(2).setAlpha(0.95);
    }

    // Cuadros
    for (const [x, y] of PAINTINGS) {
      this.add.image(x * TILE + TILE / 2, y * TILE + 12, 'painting').setDepth(1).setAlpha(0.9);
    }

    // REDRUM
    const [rx, ry] = REDRUM_TILE;
    this.add.image(rx * TILE + TILE / 2, ry * TILE + TILE / 2, 'redrum').setDepth(1);

    // Manchas de sangre
    for (const [x, y] of BLOOD) {
      this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, 'blood').setDepth(-9).setAlpha(0.5);
    }

    // Puerta de salida
    this.add.image(EXIT.doorX * TILE, EXIT.doorY * TILE, 'exitDoor').setOrigin(0, 0).setDepth(1);
    this.exitGlow = this.add
      .image(EXIT.x, EXIT.doorY * TILE + 6, 'orb')
      .setTint(0x7dffa8)
      .setAlpha(0.25)
      .setScale(1.4)
      .setDepth(2);
    this.tweens.add({
      targets: this.exitGlow,
      alpha: 0.1,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Zona de victoria
    this.exitZone = this.add.zone(EXIT.x, EXIT.y, TILE * 2, TILE);
    this.physics.add.existing(this.exitZone, true);

    // Lámparas
    for (const L of LAMPS) {
      const sprite = this.add
        .image(L.x * TILE + TILE / 2, L.y * TILE + TILE / 2, 'lamp')
        .setDepth(4);
      this.lampStates.push({
        sprite,
        flicker: !!L.flicker,
        on: true,
        next: 0
      });
    }
  }

  setupTwins() {
    const [tx, ty] = TWINS_TILE;
    this.twins = this.add
      .image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'twins')
      .setDepth(62)
      .setAlpha(0)
      .setScale(0.9);
    this.tweens.add({
      targets: this.twins,
      y: this.twins.y - 6,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  triggerTwins() {
    this.twinsShown = true;
    audio.sfx('twins');
    this.cameras.main.flash(320, 220, 230, 255);

    const flash = this.add
      .rectangle(480, 320, 960, 640, 0xdfe8ff, 0.75)
      .setScrollFactor(0)
      .setDepth(70);
    this.tweens.add({ targets: flash, alpha: 0, duration: 650, onComplete: () => flash.destroy() });

    this.tweens.add({ targets: this.twins, alpha: 0.92, duration: 900 });
    this.time.delayedCall(2600, () => {
      if (this.twins && this.twins.active) {
        this.tweens.add({ targets: this.twins, alpha: 0, duration: 1600 });
      }
    });
  }

  // ==========================================================
  // Utilidades para la IA
  // ==========================================================
  tileOf(obj) {
    return [Math.floor(obj.x / TILE), Math.floor(obj.y / TILE)];
  }

  playerTile() {
    return this.tileOf(this.player);
  }

  onGhostAggro() {
    if (this.time.now - this.lastScareAt > 2500) {
      this.lastScareAt = this.time.now;
      audio.sfx('scare');
    }
  }

  // ==========================================================
  // Daño / victoria / derrota
  // ==========================================================
  onGhostTouch() {
    if (this.finished || this.player.dead) return;
    if (this.time.now < this.player.invulnUntil) return;

    const health = Math.max(0, this.registry.get('health') - GHOST_DAMAGE);
    this.registry.set('health', health);
    this.registry.inc('hurtTick', 1);

    this.player.invulnUntil = this.time.now + INVULN_MS;
    audio.sfx('hurt');
    this.cameras.main.shake(140, 0.006);

    if (health <= 0) this.onDefeat();
  }

  onDefeat() {
    if (this.finished) return;
    this.finished = true;

    this.player.freeze();
    this.player.setTint(0x8890a0);
    for (const ghost of this.ghosts) ghost.freeze();
    if (this.exitArrow) this.exitArrow.setVisible(false);

    this.cameras.main.shake(300, 0.008);
    this.tweens.add({
      targets: this.player,
      alpha: 0.15,
      angle: 78,
      duration: 900,
      ease: 'Sine.easeIn'
    });

    this.time.delayedCall(1200, () => {
      this.scene.launch('End', { victory: false });
      this.scene.pause();
    });
  }

  onExitReached() {
    if (this.finished) return;
    this.finished = true;

    this.player.freeze();
    for (const ghost of this.ghosts) ghost.freeze();
    if (this.exitArrow) this.exitArrow.setVisible(false);

    this.cameras.main.fadeOut(650, 0, 0, 0);
    this.time.delayedCall(800, () => {
      this.scene.launch('End', { victory: true });
      this.scene.pause();
    });
  }

  // ==========================================================
  // Iluminación dinámica
  // ==========================================================
  updateLighting(time) {
    const cam = this.cameras.main;
    const rt = this.darkness;

    // Parpadeo de lámparas
    for (const L of this.lampStates) {
      if (!L.flicker) continue;
      if (time > L.next) {
        L.on = Math.random() > 0.14;
        L.next = time + (L.on ? 80 + Math.random() * 160 : 60 + Math.random() * 140);
        L.sprite.setAlpha(L.on ? 1 : 0.15);
      }
    }

    rt.clear();
    rt.fill(0x030202, 1);

    // Luz de Danny (parpadea si está herido de gravedad)
    const health = this.registry.get('health');
    const lightFails = health <= 30 && Math.random() < 0.06;
    if (!lightFails) {
      rt.erase('lightPlayer', this.player.x - cam.scrollX - 170, this.player.y - cam.scrollY - 170);
    }

    for (const L of this.lampStates) {
      if (!L.on) continue;
      rt.erase('lightLamp', L.sprite.x - cam.scrollX - 120, L.sprite.y - cam.scrollY - 120);
    }

    rt.erase('lightSmall', EXIT.x - cam.scrollX - 80, EXIT.doorY * TILE - cam.scrollY - 80);

    if (this.twins && this.twins.alpha > 0.05) {
      rt.erase('lightTiny', this.twins.x - cam.scrollX - 60, this.twins.y - cam.scrollY - 60);
    }
  }

  // ==========================================================
  // Bucle principal
  // ==========================================================
  update(time, delta) {
    const dt = delta;

    this.player.control(this.keys, dt);

    for (const ghost of this.ghosts) ghost.update(dt);

    // Parpadeo de invulnerabilidad
    if (!this.player.dead) {
      if (time < this.player.invulnUntil) {
        this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.35 : 1);
      } else {
        this.player.setAlpha(1);
      }
    }

    // Flecha hacia la salida
    if (!this.finished && this.exitArrow.visible) {
      const ang = Math.atan2(EXIT.y - this.player.y, EXIT.x - this.player.x);
      const d = 30;
      this.exitArrow.setPosition(
        this.player.x + Math.cos(ang) * d,
        this.player.y + Math.sin(ang) * d
      );
      this.exitArrow.setRotation(ang);
      this.exitArrow.setAlpha(0.25 + 0.12 * Math.sin(time * 0.004));
    }

    // Aparición de las gemelas
    if (!this.twinsShown) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.twins.x,
        this.twins.y
      );
      if (d < 150) this.triggerTwins();
    }

    // Sonido de proximidad de fantasmas
    let nearest = Infinity;
    for (const ghost of this.ghosts) {
      if (ghost.dead) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, ghost.x, ghost.y);
      if (d < nearest) nearest = d;
    }
    if (!this.finished) {
      audio.setGhostIntensity(Phaser.Math.Clamp(1 - nearest / 420, 0, 1));
    }

    this.updateLighting(time);
  }
}
