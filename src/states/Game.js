/* globals __DEV__ */
import Phaser from 'phaser';
import _ from 'lodash';
import Graph from 'graph-data-structure';

import lang from '../lang';
import Hole, { GRID_SIZE } from '../sprites/Hole';

const hasEdge = (a, b) => {
  // Same row, to the right
  if (a.y === b.y && a.x - b.x === -2 * GRID_SIZE) {
    return true;
  }

  // Above and within range
  if (a.y - b.y === 1 * GRID_SIZE && Math.abs(a.x - b.x) === GRID_SIZE) {
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

    this.holes.forEach(hole => {
      hole.occupied = hole.x !== 1 * GRID_SIZE || hole.y !== 5 * GRID_SIZE;
    });

    console.log(this.game.graph.serialize());
  }

  buildHole(x, y) {
    const hole = new Hole({ x, y, game: this.game, occupied: false });
    hole.events.onInputUp.add(() => this.onInputUp(hole));
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
      this.lines.forEach(l => this.game.debug.geom(l));
    }
  }

  onInputUp(hole) {
    if (this.game.selectedHole) {
      if (this.game.selectedHole === hole) {
        hole.selected = false;
        this.game.selectedHole = null;
      } else if (!hole.occupied) {
        const path = this.game.graph.shortestPath(this.game.selectedHole.holeId, hole.holeId);
        if (this.validPath(path)) {
          for (let i = 0; i < path.length; i++) {
            const holeId = path[i];
            const pathHole = this.holeForId(holeId);
            pathHole.occupied = i === path.length - 1;
          }
          this.game.selectedHole.selected = false;
          this.game.selectedHole = null;
        }
      }
    } else {
      this.game.selectedHole = hole;
      hole.selected = true;
    }
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

      const yDiff = (p.y - q.y) / GRID_SIZE;
      const xDiff = (p.x - q.x) / GRID_SIZE;

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
