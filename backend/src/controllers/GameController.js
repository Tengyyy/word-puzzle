const pool = require("../database");
const Puzzle = require("../workers/GridGenerator.js");

class ApiException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiException";
    this.statusCode = statusCode;
  }
}

const overlap = Object.freeze({
  NO_OVERLAP: "no-overlap",
  POSSIBLE_OVERLAP: "possible-overlap",
  FORCE_OVERLAP: "force-overlap",
});

const difficulty = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
});

const casing = Object.freeze({
  UPPERCASE: "uppercase",
  LOWERCASE: "lowercase",
});

const words1 = [
  "elevant",
  "kaelkirjak",
  "ninasarvik",
  "jääkaru",
  "lõvi",
  "skorpion",
  "jõehobu",
  "madu",
  "tiiger",
];

const topic1 = "animals";

const words2 = [
  "roosa",
  "must",
  "sinine",
  "oranž",
  "roheline",
  "kollane",
  "hall",
  "valge",
  "punane",
  "lilla",
  "pruun",
];

const topic2 = "colors";

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function validateDimension(val) {
  //TODO: check val is an integer
  if (!val) {
    throw new ApiException(400, "Grid dimensions missing");
  }

  if (val < 5 || val > 30) {
    throw new ApiException(400, "Grid dimensions out of range 5-30");
  }

  return val;
}

function validateCasing(val) {
  //TODO: check val is string
  if (!val) {
    return casing.UPPERCASE;
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(casing).includes(formatted)) {
    throw new ApiException(400, `Casing not any of ${Object.values(casing)}`);
  }

  return formatted;
}

function validateOverlap(val) {
  //TODO: check val is string
  if (!val) {
    return overlap.NO_OVERLAP;
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(overlap).includes(formatted)) {
    throw new ApiException(400, `Overlap not any of ${Object.values(overlap)}`);
  }

  return formatted;
}

function validateDifficulty(val) {
  //TODO: check val is string
  if (!val) {
    return difficulty.MEDIUM;
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(difficulty).includes(formatted)) {
    throw new ApiException(
      400,
      `Overlap not any of ${Object.values(difficulty)}`
    );
  }

  return formatted;
}

function validateBool(val) {
  //TODO: check val is a boolean
}

function validateWords(words, width, height) {
  //TODO: check words are all string and not empty and do not exceed width and height
}

function validateGrid(val) {
  //TODO: check that grid is a 2d array and all the nested arrays are the same length
  //TODO: check that all elements in the rows are single characters and are not some weird special characterss
}

function optionsFromDifficulty(diff) {
  const size =
    diff === difficulty.EASY ? 10 : diff === difficulty.MEDIUM ? 15 : 20;

  return {
    rows: size,
    columns: size,
    diagonal: diff === difficulty.HARD,
    backward: diff !== difficulty.EASY,
    allowOverlap: diff !== difficulty.EASY,
    uppercase: true,
  };
}

function createGrid(words, options) {
  const puzzle = new Puzzle(words, options);
  const grid = puzzle.to2DArray();
  console.log(grid);
  return { grid: grid, wordPositions: puzzle.wordPositions };
}

module.exports = {
  async createGame(req, res) {
    const topic = req.query.topic;

    if (!topic) {
      res.status(400).send("Topic not specified.");
    }

    if (topic !== topic1 && topic !== topic2) {
      res.status(400).send("Unknown topic.");
    }

    try {
      const diff = validateDifficulty(req.query.difficulty);
      if (topic === topic1) {
        const grid = createGrid(words1, optionsFromDifficulty(diff)).grid;
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic1, capitalizeFirstLetter(topic1), grid, words1]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid,
            words: words1,
            title: capitalizeFirstLetter(topic1),
          })
          .end();
      } else {
        const grid = createGrid(words2, optionsFromDifficulty(diff)).grid;
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic2, capitalizeFirstLetter(topic2), grid, words2]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid,
            words: words2,
            title: capitalizeFirstLetter(topic2),
          })
          .end();
      }
    } catch (err) {
      console.error(err);

      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async loadGame(req, res) {
    const id = req.params.gameId;

    if (!id) {
      res.status(400).send("No id in request");
    }

    try {
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).send("Game not found");
      }

      const game = result.rows[0];
      res
        .json({
          id: game.id,
          title: game.title,
          grid: game.grid,
          words: game.words,
        })
        .end();
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  async createCustomGame(req, res) {
    const data = req.body;
    console.log("data: " + JSON.stringify(data));

    try {
      const width = validateDimension(data.width);
      const height = validateDimension(data.height);
      const overlap = validateOverlap(data.overlap);
      const backwardsEnabled = validateBool(data.backwardsEnabled);
      const diagonalsEnabled = validateBool(data.diagonalsEnabled);
      const casing = validateCasing(data.casing);
      const words = validateWords(data.words, width, height);

      const options = {
        rows: height,
        columns: width,
        diagonal: diagonalsEnabled,
        backward: backwardsEnabled,
        allowOverlap:
          overlap === overlap.POSSIBLE_OVERLAP ||
          overlap === overlap.FORCE_OVERLAP,
        uppercase: casing === casing.UPPERCASE,
      };

      const resp = createGrid(words, options);
      res.json(resp).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async saveGame(req, res) {
    const data = req.body;

    try {
      const grid = validateGrid(data.grid);
      const words = validateWords(data.words, grid.length(), grid[0].length);
      const title = validateTitle(data.title);

      const game = await pool.query(
        "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
        ["custom", title, grid, words]
      );

      res.json({ id: game.rows[0].id }).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },
};
