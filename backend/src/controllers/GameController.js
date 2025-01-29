const pool = require("../database");
const Puzzle = require("../workers/GridGenerator.js");

class ApiException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiException";
    this.statusCode = statusCode;
  }
}

const OVERLAP = Object.freeze({
  NO_OVERLAP: "no-overlap",
  POSSIBLE_OVERLAP: "possible-overlap",
  FORCE_OVERLAP: "force-overlap",
});

const DIFFICULTY = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
});

const CASING = Object.freeze({
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
  if (!val) {
    throw new ApiException(400, "Grid dimensions missing");
  }

  if (!Number.isInteger(val)) {
    throw new ApiException(400, "Grid dimensions must be integers");
  }

  if (val < 5 || val > 30) {
    throw new ApiException(400, "Grid dimensions must be in the range 5-30");
  }

  return val;
}

function validateCasing(val) {
  if (!val) {
    return CASING.UPPERCASE;
  }

  if (typeof val !== "string") {
    throw new ApiException(400, "Casing must be a string");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(CASING).includes(formatted)) {
    throw new ApiException(
      400,
      `Casing must be one of the following values: ${Object.values(CASING)}`
    );
  }

  return formatted;
}

function validateOverlap(val) {
  if (!val) {
    return OVERLAP.NO_OVERLAP;
  }

  if (typeof val !== "string") {
    throw new ApiException(400, "Overlap must be a string");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(OVERLAP).includes(formatted)) {
    throw new ApiException(
      400,
      `Overlap must be one of the following values: ${Object.values(OVERLAP)}`
    );
  }

  return formatted;
}

function validateDifficulty(val) {
  //TODO: check val is string
  if (!val) {
    return DIFFICULTY.MEDIUM;
  }

  if (typeof val !== "string") {
    throw new ApiException(400, "Difficulty must be a string");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(DIFFICULTY).includes(formatted)) {
    throw new ApiException(
      400,
      `Difficulty must be one of the following values: ${Object.values(
        DIFFICULTY
      )}`
    );
  }

  return formatted;
}

function validateBool(val, fieldName, defaultVal) {
  if (typeof val === "undefined") {
    return defaultVal;
  }

  if (typeof val !== "boolean") {
    throw new ApiException(400, fieldName + " must be a boolean");
  }

  return val;
}

function validateWords(words, width, height) {
  if (!words) {
    throw new ApiException(400, "Word list is missing");
  }

  if (!Array.isArray(words)) {
    throw new ApiException(400, "Word list must be an array");
  }

  words.forEach((item) => {
    if (typeof item !== "string") {
      throw new ApiException(400, "Word list must be an array of strings");
    }

    if (item.length < 2 || item.length > Math.min(width, height)) {
      throw new ApiException(
        400,
        "All words must be longer than 1 character and shorter than the smallest grid dimension"
      );
    }
  });

  return words;
}

function validateGrid(grid) {
  if (!Array.isArray(grid)) {
    throw new ApiException(400, "Grid must be an array.");
  }

  if (grid.length === 0) {
    throw new ApiException("Grid can't be empty");
  }

  const width = grid[0].length;

  grid.forEach((row) => {
    if (!Array.isArray(row)) {
      throw new ApiException(400, "Grid rows must be arrays.");
    }

    if (row.length !== width) {
      throw new ApiException(400, "Grid rows must be the same length");
    }

    row.forEach((item) => {
      if (typeof item !== "string") {
        throw new ApiException(400, "Grid elements must be strings");
      }
      if (item.length !== 1) {
        throw new ApiException(400, "Grid elements must be single characters");
      }
    });
  });

  return grid;
}

function validateTitle(title) {
  if (!title) {
    throw new ApiException(400, "Title is missing");
  }

  if (typeof title !== "string") {
    throw new ApiException(400, "Title must be a string");
  }

  if (title.length < 1 || title.length > 50) {
    throw new ApiException(
      400,
      "Title length must be between 1 and 50 characters"
    );
  }

  return title;
}

function optionsFromDifficulty(diff) {
  const size =
    diff === DIFFICULTY.EASY ? 10 : diff === DIFFICULTY.MEDIUM ? 15 : 20;

  return {
    rows: size,
    columns: size,
    diagonal: diff === DIFFICULTY.HARD,
    backward: diff !== DIFFICULTY.EASY,
    allowOverlap: diff !== DIFFICULTY.EASY,
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
      const backwardsEnabled = validateBool(
        data.backwardsEnabled,
        "backwardsEnabled",
        false
      );
      const diagonalsEnabled = validateBool(
        data.diagonalsEnabled,
        "backwardsEnabled",
        false
      );
      const casing = validateCasing(data.casing);
      const words = validateWords(data.words, width, height);

      const options = {
        rows: height,
        columns: width,
        diagonal: diagonalsEnabled,
        backward: backwardsEnabled,
        allowOverlap:
          overlap === OVERLAP.POSSIBLE_OVERLAP ||
          overlap === OVERLAP.FORCE_OVERLAP,
        uppercase: casing === CASING.UPPERCASE,
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
      const words = validateWords(data.words, grid.length, grid[0].length);
      const title = validateTitle(data.title);

      const game = await pool.query(
        "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
        ["custom", title, grid, words]
      );

      res.json({ link: "http://localhost:5173/game/" + game.rows[0].id }).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },
};
