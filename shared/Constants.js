export const Constants = Object.freeze({
  OVERLAP: {
    NO_OVERLAP: { text: "Sõnad ei kattu", value: "no-overlap" },
    POSSIBLE_OVERLAP: {
      text: "Sõnad võivad kattuda",
      value: "possible-overlap",
    },
    FORCE_OVERLAP: {
      text: "Sõnad kattuvad võimalikult palju",
      value: "force-overlap",
    },
  },

  DIFFICULTY: {
    EASY: { text: "Lihtne", value: "easy" },
    MEDIUM: { text: "Keskmine", value: "medium" },
    HARD: { text: "Raske", value: "hard" },
  },

  CASING: {
    UPPERCASE: { text: "Suurtähed", value: "uppercase" },
    LOWERCASE: { text: "Väiketähed", value: "lowercase" },
    MAINTAIN_CASING: {
      text: "Säilita sisestatud sõnade kirjapilt",
      value: "maintain-casing",
    },
  },

  LANGUAGE: {
    ESTONIAN: { text: "Eesti keel", value: "et" },
    ENGLISH: { text: "Inglise keel", value: "en" },
    GERMAN: { text: "Saksa keel", value: "de" },
  },

  MODE: {
    WORDS: { text: "Otsitavad sõnad", value: "words" },
    HINTS: { text: "Vihjed ja definitsioonid", value: "hints" },
  },
});
