import Phaser from 'phaser';
import { BootScene } from './BootScene';
import { LevelScene } from './LevelScene';
import { BossScene } from './BossScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#0f172a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    audio: {
      noAudio: true,
    },
    scene: [BootScene, LevelScene, BossScene],
  };
}
