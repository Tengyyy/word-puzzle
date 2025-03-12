import * as Constants from "../../../shared/Constants.js";
import * as Validation from "./Validation.js";
import * as Utils from "./Utils.js";
import { ValidationException, ServerException } from "./Exceptions.js";
import { query } from "../database.js";
import { randomUUID } from "crypto";
import { generateGrid } from "../services/GridGeneratorService.js";
import { getWords } from "../services/WordNetService.js";

function applyCasing(wordHints, wordListCasing) {
  return wordHints.map((hintObj) => {
    let { hint } = hintObj;

    switch (wordListCasing) {
      case Constants.CASING.UPPERCASE:
        hint = hint.toUpperCase();
        break;
      case Constants.CASING.LOWERCASE:
        hint = hint.toLowerCase();
        break;
      case Constants.CASING.MAINTAIN_CASING:
        // Do nothing, keep the original casing
        break;
      default:
        throw new ValidationException(
          `Ebasobiv sõnade suuruse valik: ${wordListCasing}`
        );
    }

    return { ...hintObj, hint };
  });
}

function optionsFromDifficulty(diff) {
  const size =
    diff === Constants.DIFFICULTY.EASY
      ? 10
      : diff === Constants.DIFFICULTY.MEDIUM
      ? 15
      : 20;

  return {
    rows: size,
    columns: size,
    diagonal: diff === Constants.DIFFICULTY.HARD,
    backward: diff !== Constants.DIFFICULTY.EASY,
    overlap:
      diff == Constants.DIFFICULTY.EASY
        ? Constants.OVERLAP.NO_OVERLAP
        : Constants.OVERLAP.POSSIBLE_OVERLAP,
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

export async function createGame(req, res) {
  try {
    const topic = Validation.validateString(req.query.topic, "teema");
    const diff = Validation.validateDifficulty(req.query.difficulty);
    const inputLanguage = Validation.validateLanguage(req.query.inputLanguage);
    const outputLanguage = Validation.validateLanguage(
      req.query.outputLanguage
    );
    const mode = Validation.validateMode(req.query.mode);
    const options = optionsFromDifficulty(diff);

    const { inputs, outputs } = await getWords(
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
    const { grid, answers } = await generateGrid(outputs, options);
    const words = inputs.map((hint, index) => ({
      hint: hint,
      word: outputs[index],
    }));
    const game = await query(
      "INSERT INTO games (topic, title, grid, words, answers, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        topic,
        Utils.capitalizeFirstLetter(topic),
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
      title: Utils.capitalizeFirstLetter(topic),
      answers: answers,
    };
    storeData(id, data);

    res.json(data).end();
  } catch (err) {
    console.error(err);

    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
export async function loadGame(req, res) {
  const id = req.params.gameId;
  const showAnswers =
    req.query.showAnswers === "true" || req.query.showAnswers === "1";

  if (!id) {
    res.status(400).json({ message: "Vigane päring. Mängu ID on puudu." });
  }

  try {
    let data = getData(id);

    if (!data) {
      // Game not found in the in-memory dataStore
      const result = await query(
        "SELECT id, title, grid, words, answers FROM games WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: `Ei leidnud mängi ID-ga ${id}` });
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
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
export async function createWordList(req, res) {
  const data = req.body;
  try {
    const width = Validation.validateDimension(data.width);
    const height = Validation.validateDimension(data.height);
    const topic = Validation.validateString(data.topic, "teema");
    const inputLanguage = Validation.validateLanguage(data.inputLanguage);
    const outputLanguage = Validation.validateLanguage(data.outputLanguage);
    const mode = Validation.validateMode(data.mode);
    const spacesAllowed = Validation.validateBool(
      data.spacesAllowed,
      "tühikud lubatud",
      false
    );
    const { inputs, outputs } = await getWords(
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
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
export async function createCustomGame(req, res) {
  const data = req.body;
  try {
    const width = Validation.validateDimension(data.width);
    const height = Validation.validateDimension(data.height);
    const overlap = Validation.validateOverlap(data.overlap);
    const backwardsEnabled = Validation.validateBool(
      data.backwardsEnabled,
      "tagurpidi sõnad lubatud",
      false
    );
    const diagonalsEnabled = Validation.validateBool(
      data.diagonalsEnabled,
      "diagonaalis sõnad lubatud",
      false
    );
    const casing = Validation.validateCasing(data.casing, true);
    const words = Validation.validateWords(data.words, width, height);
    const language = Validation.validateLanguage(data.language);

    const options = {
      rows: height,
      columns: width,
      diagonal: diagonalsEnabled,
      backward: backwardsEnabled,
      overlap: overlap,
      uppercase: casing === Constants.CASING.UPPERCASE,
      language: language,
    };

    const result = await generateGrid(words, options);
    res.json(result).end();
  } catch (err) {
    console.error(err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
export async function persistGame(req, res) {
  const data = req.body;

  try {
    const grid = Validation.validateGrid(data.grid);
    const wordListCasing = Validation.validateCasing(
      data.wordListCasing,
      false
    );
    let wordHints = Validation.validateWordHints(
      data.words,
      grid.length,
      grid[0].length
    );
    wordHints = applyCasing(wordHints, wordListCasing);
    const words = wordHints.map((wordHint) => wordHint.word);
    const answers = Validation.validateAnswers(data.answers, grid, words);
    const title = Validation.validateTitle(data.title);

    const game = await query(
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
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
export async function saveGame(req, res) {
  const data = req.body;

  try {
    const grid = Validation.validateGrid(data.grid);
    const wordListCasing = Validation.validateCasing(
      data.wordListCasing,
      false
    );
    let wordHints = Validation.validateWordHints(
      data.words,
      grid.length,
      grid[0].length
    );
    wordHints = applyCasing(wordHints, wordListCasing);
    const words = wordHints.map((wordHint) => wordHint.word);
    const answers = Validation.validateAnswers(data.answers, grid, words);
    const title = Validation.validateTitle(data.title);

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
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Midagi läks valesti" });
  }
}
