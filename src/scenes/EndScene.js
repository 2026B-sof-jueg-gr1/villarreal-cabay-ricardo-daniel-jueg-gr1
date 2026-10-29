// ============================================================
// Pantallas de victoria y derrota
// ============================================================

import Phaser from 'phaser';
import { audio } from '../core/Audio.js';
import { makeButton } from '../systems/Ui.js';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  init(data) {
    this.victory = !!data.victory;
  }

  create() {
    audio.stopAmbient();
    audio.sfx(this.victory ? 'win' : 'lose');

    const accent = this.victory ? 0x7dffa8 : 0xff4a30;

    this.add.rectangle(480, 320, 960, 640, this.victory ? 0x02100a : 0x120202, 0.94);

    // Siluetas fantasmales de fondo
    for (let i = 0; i < 4; i++) {
      const g = this.add
        .image(140 + i * 230, 120 + (i % 2) * 400, 'ghost' + (i % 3))
        .setScale(2.4)
        .setAlpha(0.05)
        .setTint(0xaec4dd);
      this.tweens.add({
        targets: g,
        y: g.y - 40,
        duration: 3800 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const title = this.add
      .text(
        480,
        190,
        this.victory ? 'HAS ESCAPADO DEL OVERLOOK' : 'EL OVERLOOK TE HA RECLAMADO',
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '46px',
          color: this.victory ? '#bff5cf' : '#c0261a',
          stroke: '#000000',
          strokeThickness: 7,
          align: 'center',
          wordWrap: { width: 860 }
        }
      )
      .setOrigin(0.5);
    title.setShadow(0, 0, this.victory ? '#2f9c5c' : '#ff2b0a', 22, false, true);

    this.add
      .text(
        480,
        290,
        this.victory
          ? 'La puerta se cierra tras de ti. El hotel sigue respirando\nen la oscuridad... pero estás a salvo.'
          : 'Danny nunca salió del hotel.\nAhora juega para siempre entre sus pasillos.',
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '19px',
          color: '#c9b6a4',
          align: 'center',
          lineSpacing: 8
        }
      )
      .setOrigin(0.5);

    const hp = this.registry.get('health');
    if (this.victory && typeof hp === 'number') {
      this.add
        .text(480, 360, `Vida restante: ${hp}%`, {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '16px',
          color: '#8fae9a'
        })
        .setOrigin(0.5);
    }

    // Línea decorativa
    this.add.rectangle(480, 400, 460, 2, accent, 0.4);

    makeButton(this, 480, 470, 280, 54, 'REINTENTAR', () => this.retry());
    makeButton(this, 480, 540, 280, 50, 'MENÚ PRINCIPAL', () => this.toMenu());
  }

  retry() {
    const sm = this.scene;
    sm.stop('End');
    sm.stop('Hud');
    sm.stop('Game');
    sm.start('Game');
  }

  toMenu() {
    const sm = this.scene;
    sm.stop('End');
    sm.stop('Hud');
    sm.stop('Game');
    sm.start('Menu');
  }
}
