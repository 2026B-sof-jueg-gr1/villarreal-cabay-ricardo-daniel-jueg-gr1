// ============================================================
// Menú principal
// ============================================================

import Phaser from 'phaser';
import { audio } from '../core/Audio.js';
import { makeButton } from '../systems/Ui.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.setBackgroundColor('#050101');

    // Desbloquear audio con el primer gesto del usuario
    this.input.on('pointerdown', () => {
      audio.init();
      audio.resume();
    });

    this.add.image(480, 320, 'gradBg').setDisplaySize(960, 640);

    // Franja de alfombra decorativa
    for (let i = 0; i < 30; i++) {
      this.add.image(16 + i * 32, 628, 'floor').setAlpha(0.35).setScale(1, 0.5);
    }

    // Fantasmas de fondo
    const g1 = this.add.image(170, 340, 'ghost0').setScale(3).setTint(0x93a9c9).setAlpha(0.1);
    this.tweens.add({ targets: g1, x: 790, duration: 7200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const g2 = this.add.image(810, 470, 'ghost1').setScale(1.8).setTint(0xc9a9a9).setAlpha(0.07);
    this.tweens.add({ targets: g2, y: 250, duration: 5400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Título
    const title = this.add
      .text(480, 140, 'EL RESPLANDOR', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '74px',
        color: '#93170f',
        stroke: '#000000',
        strokeThickness: 8
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, '#ff2b0a', 26, false, true);

    this.add
      .text(480, 205, 'Una noche en el Hotel Overlook', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '22px',
        color: '#c9b6a4'
      })
      .setOrigin(0.5);

    this.add
      .text(
        480,
        268,
        'Eres Danny Torrance. El hotel no quiere dejarte ir.\nEncuentra la puerta de salida antes de que los fantasmas te alcancen.',
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '17px',
          color: '#b9a696',
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5);

    // Botones
    makeButton(this, 480, 368, 310, 56, 'COMENZAR PARTIDA', () => {
      audio.init();
      audio.resume();
      this.scene.start('Game');
    });

    const soundBtn = makeButton(this, 480, 438, 310, 50, this.soundLabel(), () => {
      audio.init();
      audio.resume();
      audio.setMuted(!audio.muted);
      soundBtn.txt.setText(this.soundLabel());
    });

    this.add
      .text(480, 505, 'WASD  ·  FLECHAS  ·  M para silenciar', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '16px',
        color: '#8f7f72'
      })
      .setOrigin(0.5);

    this.add
      .text(480, 600, 'Inspirado en «El resplandor» de Stephen King  —  Phaser 3', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '13px',
        color: '#6e5f55'
      })
      .setOrigin(0.5);

    // Parpadeo ocasional del título
    this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: () => {
        if (Math.random() < 0.6) {
          this.tweens.add({
            targets: title,
            alpha: 0.35,
            duration: 60,
            yoyo: true,
            repeat: 2 + Math.floor(Math.random() * 3),
            repeatDelay: 55
          });
        }
      }
    });
  }

  soundLabel() {
    return audio.muted ? 'SONIDO: DESACTIVADO' : 'SONIDO: ACTIVADO';
  }
}
