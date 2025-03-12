import * as Constants from "../../../shared/Constants.js";
import { ValidationException } from "./Exceptions.js";

export function validateLanguage(val) {
  if (!val) {
    return Constants.LANGUAGE.ESTONIAN;
  }

  if (typeof val !== "string") {
    throw new ValidationException("Keel peab olema sõne");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(Constants.LANGUAGE).includes(formatted)) {
    throw new ValidationException(
      `Keel peab olema üks järgnevatest väärtustest: ${Object.values(
        Constants.LANGUAGE
      )}`
    );
  }

  return formatted;
}

export function validateMode(val) {
  if (!val) {
    return Constants.MODE.WORDS;
  }

  if (typeof val !== "string") {
    throw new ValidationException("Mängurežiim peab olema sõne");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(Constants.MODE).includes(formatted)) {
    throw new ValidationException(
      `Mängurežiim peab olema üks järgnevatest väärtustest: ${Object.values(
        Constants.MODE
      )}`
    );
  }

  return formatted;
}

export function validateDimension(val) {
  if (!val) {
    throw new ValidationException("Sõnarägastiku mõõtmed on puudu");
  }

  if (!Number.isInteger(val)) {
    throw new ValidationException(
      "Sõnarägastiku mõõtmed peavad olema täisarvud"
    );
  }

  if (val < 5 || val > 30) {
    throw new ValidationException(
      "Sõnarägastiku mõõtmed peavad olema vahemikus 5-30"
    );
  }

  return val;
}

export function validateCasing(val, isGrid) {
  if (!val) {
    return isGrid
      ? Constants.CASING.UPPERCASE
      : Constants.CASING.MAINTAIN_CASING;
  }

  if (typeof val !== "string") {
    throw new ValidationException("Tähtede suurus peab olema sõne");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(Constants.CASING).includes(formatted)) {
    throw new ValidationException(
      `Tähtede suurus peab olema üks järgnevatest väärtustest: ${Object.values(
        Constants.CASING
      )}`
    );
  }

  return formatted;
}

export function validateOverlap(val) {
  if (!val) {
    return Constants.OVERLAP.NO_OVERLAP;
  }

  if (typeof val !== "string") {
    throw new ValidationException("Ülekattumine peab olema sõne");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(Constants.OVERLAP).includes(formatted)) {
    throw new ValidationException(
      `Ülekattumine peab olema üks järgnevatest väärtustest: ${Object.values(
        Constants.OVERLAP
      )}`
    );
  }

  return formatted;
}

export function validateDifficulty(val) {
  if (!val) {
    return Constants.DIFFICULTY.MEDIUM;
  }

  if (typeof val !== "string") {
    throw new ValidationException("Raskusaste peab olema sõne");
  }

  const formatted = val.toLowerCase().trim();
  if (!Object.values(Constants.DIFFICULTY).includes(formatted)) {
    throw new ValidationException(
      `Raskusaste peab olema üks järgnevatest väärtustest: ${Object.values(
        Constants.DIFFICULTY
      )}`
    );
  }

  return formatted;
}

export function validateString(val, fieldName) {
  if (typeof val !== "string") {
    throw new ValidationException(`Väli '${fieldName}' peab olema sõne`);
  }

  if (val.length === 0 || val.length > 100) {
    throw new ValidationException(
      `Välja '${fieldName}' pikkus peab olema 1-50 tähte`
    );
  }

  return val;
}

export function validateBool(val, fieldName, defaultVal) {
  if (typeof val === "undefined") {
    return defaultVal;
  }

  if (typeof val !== "boolean") {
    throw new ValidationException(
      `Väli ${fieldName} peab olema tõeväärtus true/false`
    );
  }

  return val;
}

export function validateWords(words, width, height) {
  if (!words) {
    throw new ValidationException("Sõnade nimekiri on puudu");
  }

  if (!Array.isArray(words)) {
    throw new ValidationException("Sõnade nimekiri peab olema massiiv");
  }

  if (words.length === 0) {
    throw new ValidationException(
      "Sõnade nimekiri peab sisaldama vähemalt ühte sõna"
    );
  }

  words.forEach((item) => {
    if (typeof item !== "string") {
      throw new ValidationException(
        "Sõnade nimekiri peab koosnema ainult sõnedest"
      );
    }

    if (item.length < 2 || item.length > Math.max(width, height)) {
      throw new ValidationException(
        "Kõik sõnad peavad olema vähemalt kaks tähte pikad ning maksimaalselt sama pikad kui sõnarägastiku kõige suurem dimensioon"
      );
    }
  });

  return words;
}

export function validateWordHints(wordHints, width, height) {
  if (!Array.isArray(wordHints)) {
    throw new ValidationException("Väli 'sõnavihje' peab olema massiiv");
  }

  if (wordHints.length === 0) {
    throw new ValidationException("Väli 'sõnavihjed' ei tohi olla tühi");
  }

  const words = wordHints.map((wordHint) => wordHint.word);
  validateWords(words, width, height);
  wordHints.forEach((wordHint) => {
    validateString(wordHint.hint, "sõna vihje");
  });

  return wordHints;
}

export function validateGrid(grid) {
  if (!Array.isArray(grid)) {
    throw new ValidationException("Sõnarägastik peab olema 2D massiiv");
  }

  if (grid.length === 0) {
    throw new ValidationException("Sõnarägastik ei tohi olla tühi");
  }

  const width = grid[0].length;

  if (width === 0) {
    throw new ValidationException("Sõnarägastik ei tohi olla tühi");
  }

  grid.forEach((row) => {
    if (!Array.isArray(row)) {
      throw new ValidationException(
        "Sõnarägastiku read peavad olema massiivid"
      );
    }

    if (row.length !== width) {
      throw new ValidationException(
        "Sõnarägastiku read peavad olema sama pikad"
      );
    }

    row.forEach((item) => {
      if (typeof item !== "string") {
        throw new ValidationException(
          "Sõnarägastiku elemendid peavad olema 'sõne' tüüpi"
        );
      }
      if (item.length !== 1) {
        throw new ValidationException(
          "Sõnarägastiku elemendid peavad olema üksikud tähed"
        );
      }
    });
  });

  return grid;
}

export function validateAnswers(answers, grid, words) {
  if (!Array.isArray(answers)) {
    throw new ValidationException("Väli 'vastused' peab olema massiiv");
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
      throw new ValidationException(
        `Vastus indeksil ${index} ei ole sobival kujul`
      );
    }

    const { word, startRow, startCol, endRow, endCol } = answer;
    const upperWord = word.toUpperCase();

    if (!normalizedWords.has(upperWord)) {
      throw new ValidationException(`Sõna '${word}' ei ole sõnade nimekirjas`);
    }

    if (
      !Number.isInteger(startRow) ||
      !Number.isInteger(startCol) ||
      !Number.isInteger(endRow) ||
      !Number.isInteger(endCol)
    ) {
      throw new ValidationException(
        `Indeksil ${index} oleva vastuse koordinaadid ei ole korrektsel kujul`
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
      throw new ValidationException(
        `Indeksil ${index} oleva vastuse koordinaadid on rägastiku piiridest väljas.`
      );
    }

    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);
    const wordLength = upperWord.length;

    if (
      Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)) + 1 !==
      wordLength
    ) {
      throw new ValidationException(
        `Indeksil ${index} oleva vastuse pikkus on vale`
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
      throw new ValidationException(
        `Indeksil ${index} olev vastus ei ole vastavuses rägastiku tähtedega`
      );
    }
  });

  return answers;
}

export function validateTitle(title) {
  if (!title) {
    throw new ValidationException("Pealkiri on puudu");
  }

  if (typeof title !== "string") {
    throw new ValidationException("Pealkiri peab olema sõne tüüpi");
  }

  if (title.length < 1 || title.length > 50) {
    throw new ValidationException("Pealkirja pikkus peab olema 1-50 tähemärki");
  }

  return title;
}
