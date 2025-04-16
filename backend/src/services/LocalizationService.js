const messages = {
  invalidString: {
    et: (field) => `Väli '${fields[field].et}' peab olema sõne`,
    en: (field) => `Field '${fields[field].en}' must be a string`,
  },
  stringLength: {
    et: (field, len) => `Välja '${fields[field].et}' pikkus peab olema 1-${len} tähte`,
    en: (field, len) => `Field '${fields[field].en}' length must be 1–${len} characters`,
  },
  mustBeInList: {
    et: (field, values) => `${fields[field].et} peab olema üks järgnevatest väärtustest: ${values}`,
    en: (field, values) => `${fields[field].en} must be one of the following values: ${values}`,
  },
  dimensionsMissing: {
    et: () => 'Sõnarägastiku mõõtmed on puudu',
    en: () => 'Grid dimensions are missing',
  },
  dimensionsNotIntegers: {
    et: () => 'Sõnarägastiku mõõtmed peavad olema täisarvud',
    en: () => 'Grid dimensions must be integers',
  },
  dimensionsInvalidRange: {
    et: () => 'Sõnarägastiku mõõtmed peavad olema vahemikus 5-30',
    en: () => 'Grid dimensions must be in range 5-30',
  },
  boolType: {
    et: (field) => `${fields[field].et} peab olema tõeväärtus true/false`,
    en: (field) => `${fields[field].en} must be a boolean value true/false`,
  },
  wordListMissing: {
    et: () => 'Sõnade nimekiri on puudu',
    en: () => 'Word-list is missing',
  },
  invalidArray: {
    et: (field) => `Väli ${fields[field].et} peab olema massiiv`,
    en: (field) => `Field ${fields[field].en} must be an array`,
  },
  emptyArray: {
    et: (field) => `Väli ${fields[field].et} ei tohi olla tühi`,
    en: (field) => `Field ${fields[field].en} cannot be empty`,
  },
  wordListOnlyStrings: {
    et: () => 'Sõnade nimekiri peab koosnema ainult sõnedest',
    en: () => 'Word-list must contain only strings',
  },
  wordListWordLength: {
    et: () => 'Kõik sõnad peavad olema vähemalt kaks tähte pikad ning maksimaalselt sama pikad kui sõnarägastiku kõige suurem dimensioon',
    en: () => 'All words in the word-list must be at least two characters long and can not be longer than the biggest dimension of the word-search grid',
  },
  grid2D: {
    et: () => 'Sõnarägastik peab olema 2D massiiv',
    en: () => 'Word-search grid must be a 2D array',
  },
  gridRowsType: {
    et: () => 'Sõnarägastiku read peavad olema massiivid',
    en: () => 'Word-search grid rows must be arrays',
  },
  gridRowsLength: {
    et: () => 'Sõnarägastiku read peavad olema sama pikad',
    en: () => 'Word-search grid rows must all be the same length',
  },
  gridElementsType: {
    et: () => 'Sõnarägastiku elemendid peavad olema \'sõne\' tüüpi',
    en: () => 'Word-search grid elements must be strings',
  },
  gridElementsLength: {
    et: () => 'Sõnarägastiku elemendid peavad olema üksikud tähed',
    en: () => 'Word-search grid elements must be singular characters',
  },
  invalidAnswer: {
    et: (index) => `Vastus indeksil ${index} ei ole sobival kujul`,
    en: (index) => `Answer at index ${index} is invalid`,
  },
  wordNotInList: {
    et: (word) => `Sõna '${word}' ei ole sõnade nimekirjas`,
    en: (word) => `Word '${word}' is not in the word-list`,
  },
  answerCoordinates: {
    et: (index) => `Indeksil ${index} oleva vastuse koordinaadid ei ole korrektsel kujul`,
    en: (index) => `Coordinates of the answer at index ${index} are invalid`,
  },
  answerCoordinatesOutOfBounds: {
    et: (index) => `Indeksil ${index} oleva vastuse koordinaadid on rägastiku piiridest väljas.`,
    en: (index) => `Coordinates of the answer at index ${index} are out-of-bounds`,
  },
  answerLength: {
    et: (index) => `Indeksil ${index} oleva vastuse pikkus on vale`,
    en: (index) => `Length of the answer at index ${index} is invalid`,
  },
  answerGridMismatch: {
    et: (index) => `Indeksil ${index} olev vastus ei ole vastavuses rägastiku tähtedega`,
    en: (index) => `Answer at index ${index} does not match the letter in the grid`,
  },
  genericError: {
    et: () => 'Midagi läks valesti',
    en: () => 'Oops. Something went wrong'
  },
  invalidQuery: {
    et: () => 'Vigane päring. Mängu ID on puudu.',
    en: () => 'Incorrect query, Game ID is missing.',
  },
  gameNotFound: {
    et: (id) => `Ei leidnud mängi ID-ga ${id}`,
    en: (id) => `Game with ID ${id} not found`
  },
  topicAndListBothEmpty: {
    et: () => 'Sõnade nimekiri ja sisendteema ei saa samaaegselt tühjad olla',
    en: () => "Word-list and input topic can't be simultaneously empty",
  },
  serverBusy: {
    et: () => 'Server on hõivatud. Palun proovi hiljem uuesti.',
    en: () => 'Server is busy at the moment. Please try again later.'
  },
  gridGenerationTimeout: {
    et: () => 'Sõnarägastiku genereerimine aegus peale 10 sekundit',
    en: () => 'Grid generation timed out after 10 seconds',
  },
  gridGenerationFailure: {
    et: (message) => 'Sõnarägastiku genereerimine ebaõnnestus' + message ? (': ' + message) : '',
    en: (message) => 'Grid generation failed' + message ? (': ' + message) : '',
  },
  serverClosing: {
    et: () => 'Server sulgub',
    en: () => 'Server closing',
  },
  wordPlacementFailed: {
    et: (word) => `Ei suutnud paigutada sõna '${word}' rägastikku. Palun suurenda sõnarägastiku mõõtmeid või vähenda sõnade arvu.`,
    en: (word) => `Failed to place the word '${word}' to the grid. Please increase the grid dimensions or decrease the number of custom words.`
  },
  wordListGenerationFailed: {
    et: (topic) => `Sõnade nimekirja loomine sisendsõna '${topic}' põhjal ebaõnnestus`,
    en: (topic) => `Word-list generation for the input topic '${topic}' failed`,
  },
  wordNetNotInitialized: {
    et: () => 'WordNet pole veel laetud',
    en: () => 'WordNet is not yet initialized',
  },
  wordListGenerationTimeout: {
    et: () => 'Sõnade nimekirja loomine aegus peale 30 sekundit',
    en: () => 'Word-list generation timed out after 30 seconds'
  },
  autoCompleteTimeout: {
    et: (query) => `Lemmade nimekirja loomine prefiksi '${query}' põhjal aegus peale 30 sekundit`,
    en: (query) => `Fetching autocomplete results for prefix '${query}' timed out after 30 seconds`,
  }
};

const fields = {
  lang: {
    et: 'keel',
    en: 'language',
  },
  mode: {
    et: 'mängurežiim',
    en: 'mode',
  },
  casing: {
    et: 'tähtede suurus',
    en: 'casing',
  },
  overlap: {
    et: 'kattumine',
    en: 'overlap',
  },
  difficulty: {
    et: 'raskusaste',
    en: 'difficulty',
  },
  backwardsEnabled: {
    et: 'tagurpidi sõnad lubatud',
    en: 'backwardsEnabled',
  },
  diagonalsEnabled: {
    et: 'diagonaalis sõnad lubatud',
    en: 'diagonalsEnabled',
  },
  nonAlphaAllowed: {
    et: 'mitte-tähestikulised sümbolid lubatud',
    en: 'nonAlphaAllowed',
  },
  alphabetize: {
    et: 'tähestikuline järjekord',
    en: 'alphabetize',
  },
  inputTopic: {
    et: 'sisendteema',
    en: 'inputTopic',
  },
  wordClue: {
    et: 'sõna vihje',
    en: 'wordClue',
  },
  word: {
    et: 'sõnad',
    en: 'words',
  },
  wordHints: {
    et: 'sõna vihjed',
    en: 'wordHints',
  },
  grid: {
    et: 'rägastik',
    en: 'grid',
  },
  answers: {
    et: 'vastused',
    en: 'answers',
  },
  title: {
    et: 'pealkiri',
    en: 'title',
  }
}

export function getMessage(key, language, ...args) {
  if (messages[key] && messages[key][language]) {
    return messages[key][language](...args);
  }
  // fallback to Estonian
  return messages[key]?.et?.(...args) || "Tundmatu viga";
}