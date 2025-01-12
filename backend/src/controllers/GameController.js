const pool = require("../database");
const Puzzle = require("../workers/GridGenerator.js");

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

function createGrid(words) {
  const options = {
    rows: 15, // number of rows in the grid
    columns: 15, // number of columns in the grid
    diagonal: true, // allow diagonal word placement
    backward: true, // allow words to be placed backwards
    allowOverlap: true,
  };

  wordsUppercase = words.map((word) => word.toUpperCase());

  const puzzle = new Puzzle(wordsUppercase, options);
  const grid = puzzle.to2DArray();
  console.log(grid);
  return grid;
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
      if (topic === topic1) {
        const grid = createGrid(words1);
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic1, capitalizeFirstLetter(topic1), grid, words1]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid,
            words: words1,
            topic: topic1,
          })
          .end();
      } else {
        const grid = createGrid(words2);
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic2, capitalizeFirstLetter(topic2), grid, words2]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid,
            words: words2,
            topic: topic2,
          })
          .end();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
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
          topic: game.topic,
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
};
