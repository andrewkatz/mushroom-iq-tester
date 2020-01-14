import Phaser from 'phaser';

export const GRID_SIZE = 60; // In pixels

export default class extends Phaser.Sprite {
  constructor({ game, x, y, occupied }) {
    super(game, x * GRID_SIZE, y * GRID_SIZE, 'mushroom');
    this.anchor.setTo(0.5);

    this.holeId = `${x},${y}`;

    this.occupied = occupied;
    this.selected = false;

    this.inputEnabled = true;
    this.input.pixelPerfectOver = true;
    this.input.useHandCursor = true;
  }

  update() {
    if (this.occupied) {
      if (this.selected) {
        this.tint = 0xff0000;
      } else {
        this.tint = 0xffffff;
      }
    } else {
      this.tint = 0x000000;
    }
  }
}
