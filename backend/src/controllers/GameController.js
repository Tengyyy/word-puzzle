const pool = require("../database.js");
const { randomUUID } = require("crypto");
const GridGeneratorService = require("../services/GridGeneratorService");
const WordNetService = require("../services/WordNetService.js");

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
  MAINTAIN_CASING: "maintainCasing",
});

const LANGUAGE = Object.freeze({
  ESTONIAN: "et",
  ENGLISH: "en",
  GERMAN: "de",
});

const MODE = Object.freeze({
  WORDS: "words",
  HINTS: "hints",
});

function applyCasing(wordHints, wordListCasing) {
  return wordHints.map((hintObj) => {
    let { hint } = hintObj;

    switch (wordListCasing) {
      case CASING.UPPERCASE:
        hint = hint.toUpperCase();
        break;
      case CASING.LOWERCASE:
        hint = hint.toLowerCase();
        break;
      case CASING.MAINTAIN_CASING:
        // Do nothing, keep the original casing
        break;
      default:
        throw new ApiException(400, `Invalid casing option: ${wordListCasing}`);
    }

    return { ...hintObj, hint };
  });
}

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function validateLanguage(val) {
  if (!val) {
    return LANGUAGE.ESTONIAN;
  }

  if (typeof val !== "string") {
    throw new ApiException(400, "Language must be a string");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(LANGUAGE).includes(formatted)) {
    throw new ApiException(
      400,
      `Language must be one of the following values: ${Object.values(LANGUAGE)}`
    );
  }

  return formatted;
}

function validateMode(val) {
  if (!val) {
    return MODE.WORDS;
  }

  if (typeof val !== "string") {
    throw new ApiException(400, "Mode must be a string");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(MODE).includes(formatted)) {
    throw new ApiException(
      400,
      `Mode must be one of the following values: ${Object.values(MODE)}`
    );
  }

  return formatted;
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

function validateCasing(val, isGrid) {
  if (!val) {
    return isGrid ? CASING.UPPERCASE : CASING.MAINTAIN_CASING;
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

function validateString(val, fieldName) {
  if (typeof val !== "string") {
    throw new ApiException(400, fieldName + " must be a string");
  }

  if (val.length === 0 || val.length > 100) {
    throw new ApiException(
      400,
      "length of " + fieldName + " must be 1-50 characters"
    );
  }

  return val;
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

  if (words.length === 0) {
    throw new ApiException(400, "Word list must contain at least 1 word");
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

function validateWordHints(wordHints, width, height) {
  if (!Array.isArray(wordHints)) {
    throw new ApiException(400, "WordHints must be an array");
  }

  if (wordHints.length === 0) {
    throw new ApiException(400, "WordHints can't be empty");
  }

  const words = wordHints.map((wordHint) => wordHint.word);
  validateWords(words, width, height);
  wordHints.forEach((wordHint) => {
    validateString(wordHint.hint, "wordHint");
  });

  return wordHints;
}

function validateGrid(grid) {
  if (!Array.isArray(grid)) {
    throw new ApiException(400, "Grid must be an array.");
  }

  if (grid.length === 0) {
    throw new ApiException(400, "Grid can't be empty");
  }

  const width = grid[0].length;

  if (width === 0) {
    throw new ApiException(400, "Grid can't be empty");
  }

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

function validateAnswers(answers, grid, words) {
  if (!Array.isArray(answers)) {
    throw new ApiException(400, "Answers must be an array.");
  }

  const numRows = grid.length;
  const numCols = grid[0].length;
  const normalizedWords = new Set(words.map((word) => word.toUpperCase()));

  answers.forEach((answer, index) => {
    if (
      typeof answer !== "object" ||
      answer === null ||
      !("word" in answer) ||
      !("startRow" in answer) ||
      !("startCol" in answer) ||
      !("endRow" in answer) ||
      !("endCol" in answer)
    ) {
      throw new ApiException(
        400,
        `Answer at index ${index} is not a valid object.`
      );
    }

    const { word, startRow, startCol, endRow, endCol } = answer;
    const upperWord = word.toUpperCase();

    if (!normalizedWords.has(upperWord)) {
      throw new ApiException(400, `Word '${word}' is not in the word list.`);
    }

    if (
      !Number.isInteger(startRow) ||
      !Number.isInteger(startCol) ||
      !Number.isInteger(endRow) ||
      !Number.isInteger(endCol)
    ) {
      throw new ApiException(
        400,
        `Answer at index ${index} has invalid coordinates.`
      );
    }

    if (
      startRow < 0 ||
      startRow >= numRows ||
      startCol < 0 ||
      startCol >= numCols ||
      endRow < 0 ||
      endRow >= numRows ||
      endCol < 0 ||
      endCol >= numCols
    ) {
      throw new ApiException(
        400,
        `Answer at index ${index} has out-of-bounds coordinates.`
      );
    }

    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);
    const wordLength = upperWord.length;

    if (
      Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)) + 1 !==
      wordLength
    ) {
      throw new ApiException(
        400,
        `Answer at index ${index} has incorrect word length.`
      );
    }

    let extractedWord = "";
    let r = startRow;
    let c = startCol;

    for (let i = 0; i < wordLength; i++) {
      extractedWord += grid[r][c].toUpperCase();
      r += rowStep;
      c += colStep;
    }

    if (extractedWord !== upperWord) {
      throw new ApiException(
        400,
        `Answer at index ${index} does not match grid characters.`
      );
    }
  });

  return answers;
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
    overlap:
      diff == DIFFICULTY.EASY ? OVERLAP.NO_OVERLAP : OVERLAP.POSSIBLE_OVERLAP,
    uppercase: true,
  };
}

const dataStore = new Map();

function storeData(id, data) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  dataStore.set(id, { data, expiresAt });
}

function getData(id) {
  const data = dataStore.get(id);
  if (data) {
    storeData(id, data.data); //reset expiration time
    return data.data;
  }
  return null;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [id, { expiresAt }] of dataStore) {
    if (expiresAt <= now) {
      dataStore.delete(id);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60 * 1000);

module.exports = {
  async createGame(req, res) {
    try {
      const topic = validateString(req.query.topic);
      const diff = validateDifficulty(req.query.difficulty);
      const inputLanguage = validateLanguage(req.query.inputLanguage);
      const outputLanguage = validateLanguage(req.query.outputLanguage);
      const mode = validateMode(req.query.mode);
      const options = optionsFromDifficulty(diff);

      const { inputs, outputs } = await WordNetService.getWords(
        topic,
        inputLanguage,
        outputLanguage,
        mode,
        options.columns,
        options.rows,
        false
      );

      console.log(inputs);
      console.log(outputs);

      options.language = outputLanguage;
      const { grid, answers } = await GridGeneratorService.generateGrid(
        outputs,
        options
      );
      const words = inputs.map((hint, index) => ({
        hint: hint,
        word: outputs[index],
      }));
      const game = await pool.query(
        "INSERT INTO games (topic, title, grid, words, answers, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          topic,
          capitalizeFirstLetter(topic),
          grid,
          JSON.stringify(words),
          JSON.stringify(answers),
          JSON.stringify({
            inputLanguage: inputLanguage,
            outputLanguage: outputLanguage,
            mode: mode,
            difficulty: diff,
          }),
        ]
      );

      const id = game.rows[0].id;
      const data = {
        id: id,
        grid: grid,
        words: words,
        title: capitalizeFirstLetter(topic),
        answers: answers,
      };
      storeData(id, data);

      res.json(data).end();
    } catch (err) {
      console.error(err);

      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async loadGame(req, res) {
    const id = req.params.gameId;
    const showAnswers =
      req.query.showAnswers === "true" || req.query.showAnswers === "1";

    if (!id) {
      res.status(400).send("No id in request");
    }

    try {
      let data = getData(id);

      if (!data) {
        // Game not found in the in-memory dataStore
        const result = await pool.query(
          "SELECT id, title, grid, words, answers FROM games WHERE id = $1",
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).send("Game not found");
        }

        data = result.rows[0];
      }

      res
        .json({
          id: data.id,
          title: data.title,
          grid: data.grid,
          words: data.words,
          answers: showAnswers ? data.answers : null,
        })
        .end();
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  async createWordList(req, res) {
    const data = req.body;
    try {
      const width = validateDimension(data.width);
      const height = validateDimension(data.height);
      const topic = validateString(data.topic, "topic");
      const inputLanguage = validateLanguage(data.inputLanguage);
      const outputLanguage = validateLanguage(data.outputLanguage);
      const mode = validateMode(data.mode);
      const spacesAllowed = validateBool(data.spacesAllowed, false);
      const { inputs, outputs } = await WordNetService.getWords(
        topic,
        inputLanguage,
        outputLanguage,
        mode,
        width,
        height,
        spacesAllowed
      );
      const words = inputs.map((hint, index) => ({
        hint: hint,
        word: outputs[index],
      }));
      res.json(words).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async createCustomGame(req, res) {
    const data = req.body;
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
      const casing = validateCasing(data.casing, true);
      const words = validateWords(data.words, width, height);
      const language = validateLanguage(data.language);

      const options = {
        rows: height,
        columns: width,
        diagonal: diagonalsEnabled,
        backward: backwardsEnabled,
        overlap: overlap,
        uppercase: casing === CASING.UPPERCASE,
        language: language,
      };

      const result = await GridGeneratorService.generateGrid(words, options);
      res.json(result).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async persistGame(req, res) {
    const data = req.body;

    try {
      const grid = validateGrid(data.grid);
      const wordListCasing = validateCasing(data.wordListCasing, false);
      let wordHints = validateWordHints(
        data.words,
        grid.length,
        grid[0].length
      );
      wordHints = applyCasing(wordHints, wordListCasing);
      const words = wordHints.map((wordHint) => wordHint.word);
      const answers = validateAnswers(data.answers, grid, words);
      const title = validateTitle(data.title);

      const game = await pool.query(
        "INSERT INTO games (topic, title, grid, words, answers) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          "custom",
          title,
          grid,
          JSON.stringify(wordHints),
          JSON.stringify(answers),
        ]
      );

      const id = game.rows[0].id;
      const gameData = {
        id: id,
        grid: grid,
        title: title,
        words: wordHints,
        answers: answers,
      };

      storeData(id, gameData);

      res.json({ id: id }).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },

  async saveGame(req, res) {
    const data = req.body;

    try {
      const grid = validateGrid(data.grid);
      const wordListCasing = validateCasing(data.wordListCasing, false);
      let wordHints = validateWordHints(
        data.words,
        grid.length,
        grid[0].length
      );
      wordHints = applyCasing(wordHints, wordListCasing);
      const words = wordHints.map((wordHint) => wordHint.word);
      const answers = validateAnswers(data.answers, grid, words);
      const title = validateTitle(data.title);

      const id = randomUUID();
      const game = {
        id: id,
        grid: grid,
        title: title,
        words: wordHints,
        answers: answers,
      };
      storeData(id, game);

      res.json({ id: id }).end();
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).send(err.message || "Server error");
    }
  },
};
