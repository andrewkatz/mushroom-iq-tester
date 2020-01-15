/* globals __DEV__ */
import Phaser from 'phaser';
import _ from 'lodash';
import Graph from 'graph-data-structure';

import lang from '../lang';
import Hole, { GRID_SIZE_X, GRID_SIZE_Y } from '../sprites/Hole';

const hasEdge = (a, b) => {
  // Same row, to the right
  if (a.y === b.y && a.x - b.x === -2 * GRID_SIZE_X) {
    return true;
  }

  // Above and within range
  if (a.y - b.y === 1 * GRID_SIZE_Y && Math.abs(a.x - b.x) === GRID_SIZE_X) {
    return true;
  }

  return false;
};

export default class extends Phaser.State {
  init() {}

  preload() {}

  create() {
    this.game.graph = Graph();
    this.holes = [];
    this.lines = [];

    // Bottom row
    this.game.graph.addNode(this.buildHole(1, 5));
    this.game.graph.addNode(this.buildHole(3, 5));
    this.game.graph.addNode(this.buildHole(5, 5));
    this.game.graph.addNode(this.buildHole(7, 5));
    this.game.graph.addNode(this.buildHole(9, 5));

    this.game.graph.addNode(this.buildHole(2, 4));
    this.game.graph.addNode(this.buildHole(4, 4));
    this.game.graph.addNode(this.buildHole(6, 4));
    this.game.graph.addNode(this.buildHole(8, 4));

    this.game.graph.addNode(this.buildHole(3, 3));
    this.game.graph.addNode(this.buildHole(5, 3));
    this.game.graph.addNode(this.buildHole(7, 3));

    this.game.graph.addNode(this.buildHole(4, 2));
    this.game.graph.addNode(this.buildHole(6, 2));

    this.game.graph.addNode(this.buildHole(5, 1));

    this.holes.forEach(a => {
      this.holes.forEach(b => {
        if (hasEdge(a, b)) {
          this.buildEdge(a, b);
        }
      });
    });

    this.startText = this.game.add.text(0, 0, 'Select a position to leave blank.', {
      font: '20px Ibarra Real Nova',
      fill: '#000',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
    });
    this.startText.setTextBounds(0, 360, 400, 40);

    this.startChosen = false;
  }

  buildHole(x, y) {
    const hole = new Hole({ x, y, game: this.game, occupied: true });
    hole.events.onInputUp.add(() => this.onInputUp(hole));
    hole.events.onInputOver.add(() => this.onInputOver(hole));
    hole.events.onInputOut.add(() => this.onInputOut(hole));
    this.holes.push(hole);
    this.game.add.existing(hole);
    return hole.holeId;
  }

  buildEdge(a, b) {
    this.game.graph.addEdge(a.holeId, b.holeId);
    this.game.graph.addEdge(b.holeId, a.holeId);
    this.lines.push(new Phaser.Line(a.x, a.y, b.x, b.y));
  }

  render() {
    if (__DEV__) {
      // this.lines.forEach(l => this.game.debug.geom(l));
    }
  }

  update() {}

  onInputUp(hole) {
    if (!this.startChosen) {
      hole.occupied = false;
      this.startChosen = true;
      this.startText.destroy();
      return;
    }

    if (this.game.selectedHole) {
      if (this.game.selectedHole === hole) {
        hole.deselect();
        this.game.selectedHole = null;
      } else if (!hole.occupied) {
        const path = this.game.graph.shortestPath(this.game.selectedHole.holeId, hole.holeId);
        if (this.validPath(path)) {
          for (let i = 0; i < path.length; i++) {
            const holeId = path[i];
            const pathHole = this.holeForId(holeId);
            pathHole.occupied = i === path.length - 1;
          }
          this.game.selectedHole.deselect();
          this.game.selectedHole = null;
        }
      }
    } else {
      this.game.selectedHole = hole;
      hole.select();
    }
  }

  onInputOver(hole) {
    hole.highlighted = true;
  }

  onInputOut(hole) {
    hole.highlighted = false;
  }

  holeForId(holeId) {
    return this.holes.find(h => h.holeId === holeId);
  }

  validPath(path) {
    if (path.length !== 3) {
      return false;
    }

    let masterYDiff = null;
    let masterXDiff = null;

    for (let i = 0; i < path.length - 1; i++) {
      const p = this.holeForId(path[i]);
      const q = this.holeForId(path[i + 1]);

      const yDiff = p.holeY - q.holeY;
      const xDiff = p.holeX - q.holeX;

      if (i === 0) {
        masterYDiff = yDiff;
        masterXDiff = xDiff;
      } else if (masterXDiff !== xDiff || masterYDiff !== yDiff) {
        return false;
      }
    }

    return true;
  }
}
