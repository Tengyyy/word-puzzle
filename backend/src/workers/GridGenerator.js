const OVERLAP = Object.freeze({
  NO_OVERLAP: "no-overlap",
  POSSIBLE_OVERLAP: "possible-overlap",
  FORCE_OVERLAP: "force-overlap",
});

class Grid {
  constructor(rows, columns, grid = null) {
    this.rows = rows;
    this.columns = columns;
    this.size = this.rows * this.columns;
    this.grid = grid || new Array(this.rows * this.columns);
  }

  index(rowOrPos, column = null) {
    if (column !== null) {
      return rowOrPos * this.columns + column;
    }
    return rowOrPos;
  }

  at(position) {
    const row = Math.floor(position / this.columns);
    const col = position % this.columns;
    return [row, col];
  }

  get(rowOrPos, column = null) {
    return this.grid[this.index(rowOrPos, column)];
  }

  set(rowOrPos, ...args) {
    let column = null;
    let value;

    if (args.length === 1) {
      value = args[0];
    } else if (args.length === 2) {
      [column, value] = args;
    } else {
      throw new Error("expected 2..3 arguments");
    }

    this.grid[this.index(rowOrPos, column)] = value;
  }

  dup() {
    return new Grid(this.rows, this.columns, [...this.grid]);
  }

  fill(message = null, uppercase = true) {
    const processedMessage = (message || "")
      [uppercase ? "toUpperCase" : "toLowerCase"]()
      .replace(uppercase ? /[^A-ZÕÜÖÄŠŽ]/g : /[^a-zõüöäšž]/g, "")
      .split("");

    const unused = this.grid.filter((n) => n === undefined).length;

    // EKI korpus märkide statistika: https://en.eki.ee/corpus
    // A  8100857
    // E  7028435
    // I  6542963
    // S  5776376
    // T  4851121
    // L  4121993
    // U  3741561
    // N  3374496
    // K  3046708
    // O  2608481
    // D  2527407
    // M  2434348
    // R  2322550
    // V  1588836
    // P  1251495
    // G  1224764
    // J  1102623
    // H  1098427
    // Ä  852155
    // Õ  721423
    // B  615187
    // Ü  494098
    // Ö  198498
    // F  136160
    // C  106239
    // Y  40591
    // W  35353
    // Z  29078
    // X  9960
    // Š  6212
    // Q  3780
    // Ž  3391
    // Kokku 65995566

    const letterFrequencies = {
      A: 12.27,
      E: 10.65,
      I: 9.91,
      S: 8.75,
      T: 7.35,
      L: 6.25,
      U: 5.67,
      N: 5.11,
      K: 4.62,
      O: 3.95,
      D: 3.83,
      M: 3.69,
      R: 3.52,
      V: 2.41,
      P: 1.9,
      G: 1.86,
      J: 1.67,
      H: 1.66,
      Ä: 1.29,
      Õ: 1.1,
      B: 0.93,
      Ü: 0.75,
      Ö: 0.3,
      F: 0.2,
      C: 0.2,
      Y: 0.06,
      W: 0.05,
      Z: 0.04,
      X: 0.02,
      Š: 0.01,
      Q: 0.01,
      Ž: 0.01,
    };

    const letters = Object.keys(letterFrequencies);
    const weights = Object.values(letterFrequencies);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Function to pick a weighted random letter
    function weightedRandom() {
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < letters.length; i++) {
        if (rand < weights[i]) return letters[i];
        rand -= weights[i];
      }
    }

    for (let pos = 0; pos < this.size; pos++) {
      if (!this.grid[pos]) {
        this.grid[pos] = processedMessage.shift() || weightedRandom();
      }
    }

    return unused;
  }
}

class Puzzle {
  static DIRS = {
    right: [0, 1],
    left: [0, -1],
    up: [-1, 0],
    down: [1, 0],
    rightdown: [1, 1],
    rightup: [-1, 1],
    leftdown: [1, -1],
    leftup: [-1, -1],
  };

  constructor(
    vocabulary,
    {
      rows = 15,
      columns = 15,
      diagonal = false,
      backward = false,
      overlap = OVERLAP.NO_OVERLAP,
      uppercase = true,
      message = null,
      seed = Date.now(),
    } = {}
  ) {
    this.vocabulary = vocabulary;
    this.rows = rows;
    this.columns = columns;
    this.diagonal = diagonal;
    this.backward = backward;
    this.overlap = overlap;
    this.uppercase = uppercase;
    this.message = message;
    this.seed = seed;
    this.answers = [];

    this._setSeed(this.seed);
    this._generate();
  }

  _setSeed(seed) {
    // Simple implementation of seeded random number generator
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  _generate() {
    const words = [...this.vocabulary]
      .sort((a, b) => b.length - a.length)
      .map((word) =>
        this.uppercase ? word.toUpperCase() : word.toLowerCase()
      ); // Sort words by length descending

    let directions = ["right", "down"];
    if (this.diagonal) directions.push("rightdown");
    if (this.backward) directions.push("left", "up");
    if (this.diagonal && this.backward)
      directions.push("leftup", "leftdown", "rightup");

    const grid = new Grid(this.rows, this.columns);
    const positions = Array.from({ length: grid.size }, (_, i) => i);
    const stack = [];

    while (words.length > 0) {
      const word = words.shift();
      let placed = false;

      for (
        let attempt = 0;
        attempt < (this.overlap === OVERLAP.FORCE_OVERLAP ? 2 : 1);
        attempt++
      ) {
        const forceOverlap =
          attempt === 0 && this.overlap === OVERLAP.FORCE_OVERLAP; // First attempt: enforce overlap, second: relax it
        const shuffledPositions = this._shuffle([...positions]);
        const shuffledDirections = this._shuffle([...directions]);

        for (const pos of shuffledPositions) {
          for (const dir of shuffledDirections) {
            const newGrid = this._tryWord(grid, word, pos, dir, forceOverlap);
            if (newGrid) {
              grid.grid = newGrid.grid;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        if (placed) break; // Stop attempting once placed
      }

      if (!placed) {
        throw new Error(`Could not place word: ${word}`);
      }
    }

    this.grid = grid;
    this.solution = grid.dup();
    this.unusedSquares = this.grid.fill(this.message, this.uppercase);
  }

  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _tryWord(grid, word, position, direction, forceOverlap) {
    const copy = grid.dup();
    let [row, column] = copy.at(position);
    const [dr, dc] = Puzzle.DIRS[direction];
    const letters = word.split("");

    const startRow = row;
    const startCol = column;
    let endRow = row;
    let endCol = column;

    let hasOverlap = false;

    while (
      row >= 0 &&
      row < copy.rows &&
      column >= 0 &&
      column < copy.columns
    ) {
      const letter = letters.shift();
      if (!letter) break;

      const existingLetter = copy.get(row, column);

      if (existingLetter === undefined || existingLetter === letter) {
        if (existingLetter === letter) {
          hasOverlap = true;
        }
        copy.set(row, column, letter);
        row += dr;
        column += dc;

        if (!letters.length) {
          endRow = row - dr;
          endCol = column - dc;
        }
      } else {
        return null;
      }
    }

    if (letters.length === 0) {
      if (this.overlap === OVERLAP.NO_OVERLAP && hasOverlap) {
        return null;
      }

      if (forceOverlap && !hasOverlap) {
        return null;
      }

      this.answers.push({
        word,
        startRow,
        startCol,
        endRow,
        endCol,
      });

      return copy;
    }

    return null;
  }

  to2DArray() {
    const grid2D = [];
    for (let row = 0; row < this.rows; row++) {
      const rowArray = [];
      for (let col = 0; col < this.columns; col++) {
        rowArray.push(this.grid.get(row, col));
      }
      grid2D.push(rowArray);
    }
    return grid2D;
  }

  toString(showSolution = false) {
    let s = "";
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (col > 0) s += " ";
        if (showSolution) {
          s += this.solution.get(row, col) || ".";
        } else {
          s += this.grid.get(row, col);
        }
      }
      s += "\n";
    }
    return s;
  }
}

module.exports = Puzzle;
