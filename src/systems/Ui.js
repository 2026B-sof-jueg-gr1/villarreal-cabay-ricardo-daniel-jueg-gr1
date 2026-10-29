// Botones simples reutilizables (rectángulo + texto)
import { audio } from '../core/Audio.js';

export function makeButton(scene, x, y, w, h, label, onClick) {
  const bg = scene.add.rectangle(x, y, w, h, 0x2a0b09, 0.92).setStrokeStyle(2, 0x7e2318);
  const txt = scene.add
    .text(x, y, label, {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '22px',
      color: '#e8d8c8'
    })
    .setOrigin(0.5);

  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => {
    bg.setFillStyle(0x431310, 0.97);
    bg.setStrokeStyle(2, 0xc0402a);
    txt.setColor('#ffe9d9');
  });
  bg.on('pointerout', () => {
    bg.setFillStyle(0x2a0b09, 0.92);
    bg.setStrokeStyle(2, 0x7e2318);
    txt.setColor('#e8d8c8');
  });
  bg.on('pointerdown', () => {
    audio.sfx('click');
    onClick();
  });

  return { bg, txt };
}
