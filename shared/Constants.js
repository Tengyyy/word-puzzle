export const Constants = Object.freeze({
  OVERLAP: {
    NO_OVERLAP: {
      text: {
        et: "Sõnad ei kattu",
        en: "Words don't overlap",
      },
      value: "no-overlap"
    },
    POSSIBLE_OVERLAP: {
      text: {
        et: "Sõnad võivad kattuda",
        en: "Words can overlap",
      },
      value: "possible-overlap",
    },
    FORCE_OVERLAP: {
      text: {
        et: "Sõnad kattuvad võimalikult palju",
        en: "Words overlap as much as possible",
      },
      value: "force-overlap",
    },
  },

  DIFFICULTY: {
    EASY: {
      text: {
        et: "Lihtne",
        en: "Easy",
      },
      value: "easy"
    },
    MEDIUM: {
      text: {
        et: "Keskmine",
        en: "Medium",
      },
      value: "medium"
    },
    HARD: {
      text: {
        et: "Raske",
        en: "Hard",
      },
      value: "hard"
    },
  },

  CASING: {
    UPPERCASE: {
      text: {
        et: "Suurtähed",
        en: "Capital letters",
      },
      value: "uppercase"
    },
    LOWERCASE: {
      text: {
        et: "Väiketähed",
        en: "Lowercase letters",
      },
      value: "lowercase"
    },
    MAINTAIN_CASING: {
      text: {
        et: "Säilita sisestatud sõnade kirjapilt",
        en: "Maintain original casing of inserted words",
      },
      value: "maintain-casing",
    },
  },

  LANGUAGE: {
    ESTONIAN: {
      text: {
        et: "Eesti keel",
        en: "Estonian",
      },
      value: "et"
    },
    ENGLISH: {
      text: {
        et: "Inglise keel",
        en: "English",
      },
      value: "en"
    },
    GERMAN: {
      text: {
        et: "Saksa keel",
        en: "German",
      },
      value: "de"
    },
  },

  MODE: {
    WORDS: {
      text: {
        et: "Otsitavad sõnad",
        en: "Hidden words",
      },
      value: "words"
    },
    HINTS: {
      text: {
        et: "Vihjed ja definitsioonid",
        en: "Hints and definitions",
      },
      value: "hints"
    },
  },
});
