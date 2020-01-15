import Phaser from 'phaser';

export const GRID_SIZE_X = 40; // In pixels
export const GRID_SIZE_Y = 60; // In pixels

export default class extends Phaser.Sprite {
  constructor({ game, x, y, occupied }) {
    super(game, x * GRID_SIZE_X, y * GRID_SIZE_Y, 'mushroom');
    this.anchor.setTo(0.5);

    this.holeY = y;
    this.holeX = x;

    this.holeId = `${x},${y}`;

    this.occupied = occupied;
    this.selected = false;
    this.highlighted = false;

    this.inputEnabled = true;
    this.input.pixelPerfectOver = true;
    this.input.useHandCursor = true;

    this.selectedTween = this.game.add
      .tween(this)
      .to(
        {
          y: y * GRID_SIZE_Y - 2,
        },
        200,
        Phaser.Easing.Bounce.Out
      )
      .to({ y: y * GRID_SIZE_Y }, 200, Phaser.Easing.Bounce.Out)
      .loop()
      .start();
    this.selectedTween.pause();
  }

  select() {
    this.selected = true;
    this.selectedTween.resume();
  }

  deselect() {
    this.selectedTween.pause();
    this.y = this.holeY * GRID_SIZE_Y;
    this.selected = false;
  }

  update() {
    if (this.occupied) {
      if (this.selected) {
        this.tint = 0xffffff;
      } else if (this.highlighted) {
        this.tint = 0xeeeeee;
      } else {
        this.tint = 0xffffff;
      }

      this.scale.setTo(0.6);
    } else {
      this.tint = 0x000000;
      this.scale.setTo(0.5);
    }
  }
}
