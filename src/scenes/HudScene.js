// ============================================================
// HUD: barra de vida, aviso de objetivo y destello de daño.
// Se ejecuta en paralelo a GameScene y lee el registro global.
// ============================================================

import Phaser from 'phaser';
import { MAX_HEALTH } from '../core/Constants.js';
import { audio } from '../core/Audio.js';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
  }

  create() {
    this.lastHp = -1;
    this.lastTick = -1;
    this.lastMuted = null;

    this.bar = this.add.graphics();

    this.label = this.add.text(22, 2, 'VIDA', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '14px',
      color: '#c9a189'
    });

    this.add
      .text(938, 18, 'Encuentra la puerta de SALIDA', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '15px',
        color: '#b8a795'
      })
      .setOrigin(1, 0)
      .setAlpha(0.7);

    this.hint = this.add
      .text(938, 622, 'WASD / Flechas — M: sonido', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '13px',
        color: '#8f7f72'
      })
      .setOrigin(1, 1)
      .setAlpha(0.6);

    this.flashRect = this.add.rectangle(480, 320, 960, 640, 0x8f0000, 0).setOrigin(0.5);

    this.drawBar(MAX_HEALTH);
    this.lastHp = MAX_HEALTH;
    this.lastTick = this.registry.get('hurtTick') || 0;
  }

  drawBar(hp) {
    const g = this.bar;
    g.clear();
    g.fillStyle(0x000000, 0.55);
    g.fillRect(22, 22, 186, 20);
    g.lineStyle(2, 0x7a241a, 0.9);
    g.strokeRect(22, 22, 186, 20);

    const w = Math.max(0, 178 * (hp / MAX_HEALTH));
    let color = 0x8f1d12;
    if (hp <= 60) color = 0xb3271a;
    if (hp <= 30) color = 0xc9401f;
    g.fillStyle(color, 1);
    g.fillRect(26, 26, w, 12);
  }

  flash() {
    this.tweens.killTweensOf(this.flashRect);
    this.flashRect.setAlpha(0.35);
    this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 240 });
  }

  update(time) {
    const hp = this.registry.get('health');
    if (hp !== this.lastHp) {
      this.drawBar(hp);
      this.lastHp = hp;
    }

    const tick = this.registry.get('hurtTick');
    if (tick !== this.lastTick) {
      this.flash();
      this.lastTick = tick;
    }

    if (audio.muted !== this.lastMuted) {
      this.lastMuted = audio.muted;
      this.hint.setText(audio.muted ? 'SONIDO SILENCIADO — M para activar' : 'WASD / Flechas — M: sonido');
    }

    if (hp <= 30) {
      this.bar.setAlpha(0.75 + 0.25 * Math.sin(time * 0.006));
    } else {
      this.bar.setAlpha(1);
    }
  }
}
