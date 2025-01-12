const pool = require("../database");

const grid1 = [
  ["E", "F", "U", "U", "B", "I", "A", "C", "X", "G", "S", "Y", "T", "B", "A"],
  ["B", "L", "O", "I", "R", "N", "G", "T", "L", "Z", "J", "N", "I", "E", "H"],
  ["U", "N", "E", "U", "G", "A", "N", "J", "O", "T", "J", "O", "I", "L", "P"],
  ["J", "U", "S", "V", "U", "I", "K", "F", "P", "K", "E", "I", "G", "D", "W"],
  ["G", "Õ", "H", "B", "A", "T", "V", "Ä", "W", "E", "Z", "P", "E", "K", "K"],
  ["G", "M", "E", "I", "O", "N", "O", "Õ", "Ä", "H", "K", "R", "R", "I", "C"],
  ["V", "U", "L", "H", "X", "Q", "T", "E", "L", "J", "A", "O", "D", "V", "L"],
  ["F", "W", "Z", "M", "O", "N", "E", "F", "B", "C", "E", "K", "J", "R", "T"],
  ["W", "I", "O", "O", "B", "B", "R", "A", "X", "G", "L", "S", "Y", "A", "F"],
  ["F", "F", "W", "Q", "T", "S", "U", "Y", "U", "I", "K", "R", "Q", "S", "K"],
  ["B", "Z", "Y", "C", "M", "H", "P", "W", "M", "P", "I", "P", "K", "A", "C"],
  ["B", "B", "A", "S", "J", "G", "F", "H", "I", "D", "R", "C", "R", "N", "D"],
  ["M", "T", "D", "V", "A", "M", "G", "R", "R", "N", "J", "Q", "E", "I", "S"],
  ["H", "X", "L", "M", "A", "D", "U", "C", "B", "L", "A", "B", "E", "N", "D"],
  ["E", "V", "O", "I", "K", "Q", "T", "O", "A", "I", "K", "S", "Y", "K", "I"],
];

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

const grid2 = [
  ["P", "O", "A", "O", "E", "L", "A", "S", "E", "L", "N", "U", "M", "U"],
  ["U", "O", "E", "N", "I", "N", "I", "S", "S", "T", "I", "K", "R", "R"],
  ["N", "E", "S", "E", "O", "A", "I", "E", "R", "I", "N", "V", "A", "A"],
  ["A", "N", "S", "V", "M", "L", "E", "E", "R", "S", "E", "E", "O", "N"],
  ["N", "I", "R", "I", "L", "I", "G", "A", "E", "L", "L", "A", "A", "E"],
  ["E", "L", "L", "S", "N", "L", "S", "A", "Z", "L", "I", "U", "R", "N"],
  ["U", "E", "L", "R", "A", "L", "A", "E", "L", "L", "E", "T", "L", "U"],
  ["O", "H", "K", "V", "E", "A", "I", "O", "O", "E", "T", "Ž", "U", "U"],
  ["R", "O", "O", "N", "O", "L", "A", "Z", "P", "S", "N", "U", "G", "R"],
  ["O", "R", "U", "G", "L", "N", "E", "U", "U", "A", "N", "A", "E", "P"],
  ["O", "L", "R", "G", "G", "L", "N", "M", "R", "I", "U", "L", "E", "U"],
  ["S", "M", "L", "L", "U", "G", "I", "O", "E", "U", "N", "L", "V", "L"],
  ["A", "E", "N", "A", "O", "L", "N", "A", "N", "A", "P", "A", "O", "O"],
  ["E", "N", "A", "L", "L", "O", "K", "M", "R", "L", "E", "H", "R", "T"],
];

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
      if (topic == topic1) {
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic1, capitalizeFirstLetter(topic1), grid1, words1]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid1,
            words: words1,
            topic: topic1,
          })
          .end();
      } else {
        const game = await pool.query(
          "INSERT INTO games (topic, title, grid, words) VALUES ($1, $2, $3, $4) RETURNING *",
          [topic2, capitalizeFirstLetter(topic2), grid2, words2]
        );

        res
          .json({
            id: game.rows[0].id,
            grid: grid2,
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
