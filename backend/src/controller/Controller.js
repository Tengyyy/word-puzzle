import {Constants} from "../../../shared/Constants.js";
import * as Validation from "./Validation.js";
import * as Utils from "../../../shared/Utils.js";
import {ServerException, TimeoutException, ValidationException} from "./Exceptions.js";
import pool from "../database.js";
import {randomUUID} from "crypto";
import GridGeneratorService from "../services/GridGeneratorService.js";
import WordNetService from "../services/WordNetService.js";
import logger from '../logger.js';


function applyCasing(wordHints, wordListCasing) {
  return wordHints.map((hintObj) => {
    let { hint } = hintObj;

    switch (wordListCasing) {
      case Constants.CASING.UPPERCASE.value:
        hint = hint.toUpperCase();
        break;
      case Constants.CASING.LOWERCASE.value:
        hint = hint.toLowerCase();
        break;
      case Constants.CASING.MAINTAIN_CASING.value:
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
    diff === Constants.DIFFICULTY.EASY.value
      ? 10
      : diff === Constants.DIFFICULTY.MEDIUM.value
        ? 15
        : 20;

  return {
    rows: size,
    columns: size,
    diagonal: diff !== Constants.DIFFICULTY.EASY.value,
    backward: diff !== Constants.DIFFICULTY.EASY.value,
    overlap:
      diff === Constants.DIFFICULTY.EASY.value
        ? Constants.OVERLAP.NO_OVERLAP.value
        : Constants.OVERLAP.POSSIBLE_OVERLAP.value,
    uppercase: true,
    mode:
      diff === Constants.DIFFICULTY.HARD.value
        ? Constants.MODE.HINTS.value
        : Constants.MODE.WORDS.value,
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

export async function autocomplete(req, res) {
  try {
    const query = req.query.query?.toLowerCase();
    const language = Validation.validateLanguage(req.query.language);
    if (!query) {
      res.json([]).end();
    }

    const result = await WordNetService.autocomplete(query, language);
    res.json(result).end();
  } catch (err) {
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
  }
}

export async function createGame(req, res) {
  try {
    const topic = Validation.validateString(req.query.topic, "sisendteema");
    const diff = Validation.validateDifficulty(req.query.difficulty);
    const inputLanguage = Validation.validateLanguage(req.query.inputLanguage);
    const outputLanguage = Validation.validateLanguage(
      req.query.outputLanguage
    );

    let options = optionsFromDifficulty(diff);

    const wordNetResult = await WordNetService.getWords(
      topic,
      inputLanguage,
      outputLanguage,
      options.mode,
      options.columns,
      options.rows,
      false
    );

    options.language = outputLanguage;

    const { mode, ...gridOptions } = options;

    const { chosenWords, grid, answers } = await GridGeneratorService.generateGrid(
      [],
      wordNetResult,
      gridOptions
    );

    const words = chosenWords.sort((a, b) => a.hint.localeCompare(b.hint));

    const id = randomUUID();
    await pool.query(
      "INSERT INTO games (id, topic, title, grid, words, answers, difficulty, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        id,
        topic,
        Utils.capitalizeFirstLetter(topic),
        grid,
        JSON.stringify(words),
        JSON.stringify(answers),
        diff,
        JSON.stringify({
          inputLanguage: inputLanguage,
          outputLanguage: outputLanguage,
          mode: mode,
          difficulty: diff,
        }),
      ]
    );

    const data = {
      id: id,
      grid: grid,
      words: words,
      title: Utils.capitalizeFirstLetter(topic),
      answers: answers,
      difficulty: diff,
    };
    storeData(id, data);

    res.json(data).end();
  } catch (err) {
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
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
      const result = await pool.query(
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
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
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
    const wordListCasing = Validation.validateCasing(data.wordListCasing, false);
    const customWords = Validation.validateWordHints(data.words, width, height, true) || [];

    let topic = null;
    if (data.topic) {
      topic = Validation.validateString(data.topic, "sisendteema");
    }
    const inputLanguage = Validation.validateLanguage(data.inputLanguage);
    const outputLanguage = Validation.validateLanguage(data.outputLanguage);

    const nonAlphaAllowed = Validation.validateBool(
      data.nonAlphaAllowed,
      "mitte-tähestikulised sümbolid lubatud",
      false
    );
    const mode = Validation.validateMode(data.mode);
    const alphabetize = Validation.validateBool(data.alphabetize, false);
    Validation.validateTitle(data.title);

    let wordNetResult = [];


    if (topic) {
      wordNetResult = await WordNetService.getWords(
        topic,
        inputLanguage,
        outputLanguage,
        mode,
        width,
        height,
        nonAlphaAllowed
      );
    } else {
      if (customWords.length === 0) {
        throw new ValidationException("Sõnade nimekiri ja sisendteema ei saa samaaegselt tühjad olla");
      }
    }

    const options = {
      rows: height,
      columns: width,
      diagonal: diagonalsEnabled,
      backward: backwardsEnabled,
      overlap: overlap,
      uppercase: casing === Constants.CASING.UPPERCASE.value,
      language: outputLanguage,
    };

    const { chosenWords, grid, answers } = await GridGeneratorService.generateGrid(customWords, wordNetResult, options);

    let processedWords = applyCasing(chosenWords, wordListCasing);
    let processedAnswers = answers;
    if (alphabetize) {
      // merge words and answers together for sorting
      let mergedWords = [...processedWords].map((item, index) => ({ wordItem: item, answerItem: answers[index] }));
      mergedWords = mergedWords.sort((a, b) => a.wordItem.hint.localeCompare(b.wordItem.hint.localeCompare));

      processedWords = mergedWords.map((item) => item.wordItem);
      processedAnswers = mergedWords.map((item) => item.answerItem);
    }

    res.json({ words: processedWords, grid: grid, answers: processedAnswers }).end();
  } catch (err) {
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
  }
}

export async function persistGame(req, res) {
  const data = req.body;

  try {
    const grid = Validation.validateGrid(data.grid);
    const wordHints = Validation.validateWordHints(
      data.words,
      grid.length,
      grid[0].length
    );
    const words = wordHints.map((wordHint) => wordHint.word);
    const answers = Validation.validateAnswers(data.answers, grid, words);
    const title = Validation.validateTitle(data.title);
    const difficulty = Validation.validateDifficulty(data.difficulty);

    const id = randomUUID();

    await pool.query(
      "INSERT INTO games (id, topic, title, grid, words, answers, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        id,
        "custom",
        title,
        grid,
        JSON.stringify(wordHints),
        JSON.stringify(answers),
        difficulty,
      ]
    );

    const gameData = {
      id: id,
      grid: grid,
      title: title,
      words: wordHints,
      answers: answers,
      difficulty: difficulty,
    };

    storeData(id, gameData);

    res.json({ id: id }).end();
  } catch (err) {
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
  }
}

export async function saveGame(req, res) {
  const data = req.body;

  try {
    const grid = Validation.validateGrid(data.grid);
    const wordHints = Validation.validateWordHints(
      data.words,
      grid.length,
      grid[0].length
    );
    const words = wordHints.map((wordHint) => wordHint.word);
    const answers = Validation.validateAnswers(data.answers, grid, words);
    const title = Validation.validateTitle(data.title);
    const difficulty = Validation.validateDifficulty(data.difficulty);

    const id = randomUUID();
    const game = {
      id: id,
      grid: grid,
      title: title,
      words: wordHints,
      answers: answers,
      difficulty: difficulty,
    };
    storeData(id, game);

    res.json({ id: id }).end();
  } catch (err) {
    logger.error(err);

    if (err instanceof ValidationException ||
      err instanceof ServerException ||
      err instanceof TimeoutException) {
      // For custom exceptions, send the specific error message
      res.status(err.statusCode || 500).json({ message: err.message || "Midagi läks valesti" });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ message: "Midagi läks valesti" });
    }
  }
}
