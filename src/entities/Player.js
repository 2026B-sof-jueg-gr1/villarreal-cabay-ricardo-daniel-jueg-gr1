// ============================================================
// Danny Torrance: movimiento en 4 direcciones, animaciones,
// colisiones y temporizador de pasos.
// ============================================================

import Phaser from 'phaser';
import { PLAYER_SPEED, TILE } from '../core/Constants.js';
import { audio } from '../core/Audio.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, tileX, tileY) {
    super(scene, tileX * TILE + TILE / 2, tileY * TILE + TILE / 2, 'playerWalk0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(16, 12);
    this.body.setOffset(8, 18);
    this.setCollideWorldBounds(true);

    this.speed = PLAYER_SPEED;
    this.dead = false;
    this.invulnUntil = 0;
    this.stepTimer = 0;

    this.play('dannyIdle');
  }

  control(keys, dt) {
    if (this.dead) {
      this.setVelocity(0);
      return;
    }

    let dx = 0;
    let dy = 0;
    if (keys.A.isDown || keys.LEFT.isDown) dx -= 1;
    if (keys.D.isDown || keys.RIGHT.isDown) dx += 1;
    if (keys.W.isDown || keys.UP.isDown) dy -= 1;
    if (keys.S.isDown || keys.DOWN.isDown) dy += 1;

    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      const len = Math.hypot(dx, dy) || 1;
      this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
      if (dx !== 0) this.setFlipX(dx < 0);
      this.anims.play('dannyWalk', true);

      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = 340;
        audio.sfx('step');
      }
    } else {
      this.setVelocity(0);
      this.anims.play('dannyIdle', true);
      this.stepTimer = 0;
    }
  }

  freeze() {
    this.dead = true;
    this.setVelocity(0);
    this.anims.stop();
  }
}
