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
      .replace(uppercase ? /[^A-Z]/g : /[^a-z]/g, "")
      .split("");
    const unused = this.grid.filter((n) => n === undefined).length;
    const letters = Array.from(
      uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyz"
    );
    //const letters = Array.from("?");

    for (let pos = 0; pos < this.size; pos++) {
      if (!this.grid[pos]) {
        this.grid[pos] =
          processedMessage.shift() ||
          letters[Math.floor(Math.random() * letters.length)];
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
      allowOverlap = false,
      forceOverlap = false,
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
    this.allowOverlap = allowOverlap;
    this.forceOverlap = forceOverlap;
    this.uppercase = uppercase;
    this.message = message;
    this.seed = seed;
    this.wordPositions = [];

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
    const stack = [
      {
        grid,
        word: words.shift(),
        dirs: this._shuffle([...directions]),
        positions: this._shuffle([...positions]),
      },
    ];

    while (true) {
      const current = stack[stack.length - 1];
      if (!current) throw new Error("no solution possible");

      let dir = current.dirs.pop();
      if (!dir) {
        current.positions.pop();
        current.dirs = this._shuffle([...directions]);
        dir = current.dirs.pop();
      }

      const pos = current.positions[current.positions.length - 1];

      if (pos === undefined) {
        words.unshift(current.word);
        stack.pop();
      } else {
        const newGrid = this._tryWord(current.grid, current.word, pos, dir);
        if (newGrid) {
          if (words.length > 0) {
            stack.push({
              grid: newGrid,
              word: words.shift(),
              dirs: this._shuffle([...directions]),
              positions: this._shuffle([...positions]),
            });
          } else {
            this.grid = newGrid;
            this.solution = newGrid.dup();
            this.unusedSquares = this.grid.fill(this.message, this.uppercase);
            break;
          }
        }
      }
    }
  }

  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _tryWord(grid, word, position, direction) {
    const copy = grid.dup();
    let [row, column] = copy.at(position);
    const [dr, dc] = Puzzle.DIRS[direction];
    const letters = word.split("");

    const startRow = row;
    const startCol = column;
    let endRow = row;
    let endCol = column;

    while (
      row >= 0 &&
      row < copy.rows &&
      column >= 0 &&
      column < copy.columns
    ) {
      const letter = letters.shift();
      if (!letter) break;

      const existingLetter = copy.get(row, column);

      if (
        existingLetter === undefined ||
        (this.allowOverlap && existingLetter === letter)
      ) {
        copy.set(row, column, letter);
        row += dr;
        column += dc;

        if (!letters.length) {
          endRow = row - dr; // Last valid position
          endCol = column - dc; // Last valid position
        }
      } else {
        return null;
      }
    }

    if (letters.length === 0) {
      this.wordPositions.push({
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
