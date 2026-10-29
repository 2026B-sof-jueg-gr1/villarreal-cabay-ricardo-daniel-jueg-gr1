// ============================================================
// Boot: genera todas las texturas y animaciones una sola vez.
// ============================================================

import Phaser from 'phaser';
import { buildTextures } from '../systems/TextureFactory.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildTextures(this);

    if (!this.anims.exists('dannyIdle')) {
      this.anims.create({
        key: 'dannyIdle',
        frames: [{ key: 'playerIdle0' }, { key: 'playerIdle1' }],
        frameRate: 1.4,
        repeat: -1
      });
    }
    if (!this.anims.exists('dannyWalk')) {
      this.anims.create({
        key: 'dannyWalk',
        frames: [
          { key: 'playerWalk1' },
          { key: 'playerWalk2' },
          { key: 'playerWalk3' },
          { key: 'playerWalk2' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('ghostFloat')) {
      this.anims.create({
        key: 'ghostFloat',
        frames: [{ key: 'ghost0' }, { key: 'ghost1' }, { key: 'ghost2' }],
        frameRate: 5,
        repeat: -1
      });
    }

    this.scene.start('Menu');
  }
}
