import {Constants} from "../../../shared/Constants.js";
import {ValidationException} from "./Exceptions.js";
import { getMessage } from '../services/LocalizationService.js';


function getValues(constants) {
  return Object.values(constants).map((constant) => constant.value);
}

function withLang(res) {
  const lang = res.locals.language;
  return (key, ...args) => getMessage(key, lang, ...args);
}

export function validateLanguage(val, res) {
  if (!val) {
    return Constants.LANGUAGE.ESTONIAN.value;
  }

  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', 'lang'));
  }

  const formatted = val.toLowerCase().trim();
  if (!getValues(Constants.LANGUAGE).includes(formatted)) {
    throw new ValidationException(t('mustBeInList', 'lang', getValues(Constants.LANGUAGE)));
  }

  return formatted;
}

export function validateMode(val, res) {
  if (!val) {
    return Constants.MODE.WORDS.value;
  }

  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', 'mode'));
  }

  const formatted = val.toLowerCase().trim();
  if (!getValues(Constants.MODE).includes(formatted)) {
    throw new ValidationException(t('mustBeInList', 'mode', getValues(Constants.MODE)));
  }

  return formatted;
}

export function validateDimension(val, res) {
  const t = withLang(res);

  if (!val) {
    throw new ValidationException(t('dimensionsMissing'));
  }

  if (!Number.isInteger(val)) {
    throw new ValidationException(t('dimensionsNotIntegers'));
  }

  if (val < 5 || val > 30) {
    throw new ValidationException(t('dimensionsInvalidRange'));
  }

  return val;
}

export function validateCasing(val, isGrid, res) {
  if (!val) {
    return isGrid
      ? Constants.CASING.UPPERCASE.value
      : Constants.CASING.MAINTAIN_CASING.value;
  }

  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', 'casing'));
  }

  const formatted = val.toLowerCase().trim();
  if (!getValues(Constants.CASING).includes(formatted)) {
    throw new ValidationException(t('mustBeInList', 'casing', getValues(Constants.CASING)));
  }

  return formatted;
}

export function validateOverlap(val, res) {
  if (!val) {
    return Constants.OVERLAP.NO_OVERLAP.value;
  }

  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', 'overlap'));
  }

  const formatted = val.toLowerCase().trim();
  if (!getValues(Constants.OVERLAP).includes(formatted)) {
    throw new ValidationException(t('mustBeInList', 'overlap', getValues(Constants.OVERLAP)));
  }

  return formatted;
}

export function validateDifficulty(val, res) {
  if (!val) {
    return Constants.DIFFICULTY.MEDIUM.value;
  }

  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', 'difficulty'));
  }

  const formatted = val.toLowerCase().trim();
  if (!getValues(Constants.DIFFICULTY).includes(formatted)) {
    throw new ValidationException(t('mustBeInList', 'difficulty', getValues(Constants.DIFFICULTY)));
  }

  return formatted;
}

export function validateString(val, fieldName, res, length = 100) {
  const t = withLang(res);

  if (typeof val !== "string") {
    throw new ValidationException(t('invalidString', fieldName));
  }

  if (val.length === 0 || val.length > length) {
    throw new ValidationException(t('stringLength', fieldName, length));
  }

  return val;
}

export function validateBool(val, fieldName, defaultVal, res) {
  if (typeof val === "undefined") {
    return defaultVal;
  }

  const t = withLang(res);

  if (typeof val !== "boolean") {
    throw new ValidationException(t('boolType', fieldName));
  }

  return val;
}

export function validateWords(words, width, height, res, allowEmpty = false) {
  const t = withLang(res);

  if (!words) {
    if (allowEmpty) return []
    throw new ValidationException(t('wordListMissing'));
  }

  if (!Array.isArray(words)) {
    throw new ValidationException(t('invalidArray', 'words'));
  }

  if (words.length === 0) {
    if (allowEmpty) return []
    throw new ValidationException(t('emptyArray', 'words'));
  }

  words.forEach((item) => {
    if (typeof item !== "string") {
      throw new ValidationException(t('wordListOnlyStrings'));
    }

    if (item.length < 2 || item.length > Math.max(width, height)) {
      throw new ValidationException(t('wordListWordLength'));
    }
  });

  return words;
}

export function validateWordHints(wordHints, width, height, res, allowEmpty = false) {
  const t = withLang(res);

  if (!Array.isArray(wordHints)) {
    if (allowEmpty) return []
    throw new ValidationException(t('invalidArray', 'wordHints'));
  }

  if (wordHints.length === 0) {
    if (allowEmpty) return []
    throw new ValidationException(t('emptyArray', 'wordHints'));
  }

  const words = wordHints.map((wordHint) => wordHint.word);
  validateWords(words, width, height, res);
  wordHints.forEach((wordHint) => {
    validateString(wordHint.hint, "wordClue", res, 1000);
  });

  return wordHints;
}

export function validateGrid(grid, res) {
  const t = withLang(res);

  if (!Array.isArray(grid)) {
    throw new ValidationException(t('grid2D'));
  }

  if (grid.length === 0) {
    throw new ValidationException(t('emptyArray', 'grid'));
  }

  const width = grid[0].length;

  if (width === 0) {
    throw new ValidationException(t('emptyArray', 'grid'));
  }

  grid.forEach((row) => {
    if (!Array.isArray(row)) {
      throw new ValidationException(t('gridRowsType'));
    }

    if (row.length !== width) {
      throw new ValidationException(t('gridRowsLength'));
    }

    row.forEach((item) => {
      if (typeof item !== "string") {
        throw new ValidationException(t('gridElementsType'));
      }
      if (item.length !== 1) {
        throw new ValidationException(t('gridElementsLength'));
      }
    });
  });

  return grid;
}

export function validateAnswers(answers, grid, words, res) {
  const t = withLang(res);

  if (!Array.isArray(answers)) {
    throw new ValidationException(t('invalidArray', 'answers'));
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
      throw new ValidationException(t('invalidAnswer', index));
    }

    const { word, startRow, startCol, endRow, endCol } = answer;
    const upperWord = word.toUpperCase();

    if (!normalizedWords.has(upperWord)) {
      throw new ValidationException(t('wordNotInList', index));
    }

    if (
      !Number.isInteger(startRow) ||
      !Number.isInteger(startCol) ||
      !Number.isInteger(endRow) ||
      !Number.isInteger(endCol)
    ) {
      throw new ValidationException(t('answerCoordinates', index));
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
      throw new ValidationException(t('answerCoordinatesOutOfBounds', index));
    }

    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);
    const wordLength = upperWord.length;

    if (
      Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)) + 1 !==
      wordLength
    ) {
      throw new ValidationException(t('answerLength', index));
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
      throw new ValidationException(t('answerGridMismatch', index));
    }
  });

  return answers;
}

export function validateTitle(title, res) {
  return validateString(title, 'title', res, 50)
}
