import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Constants } from '../../../shared/Constants.js'
import {getRandomColor, isOnlyLetters} from "../../../shared/Utils.js";
import {useLanguageStore} from "@/stores/languageStore.js";

const text = {
  empty: {
    et: 'Tühja sõna ei saa nimekirja lisada',
    en: 'You cannot add an empty word to the list',
  },
  addHint: {
    et: 'Palun lisa sõnale ka vihje',
    en: 'Please add a hint for the word',
  },
  alreadyInList: {
    et: 'See sõna on juba nimekirjas',
    en: 'This word is already in the list',
  },
  nonAlpha: {
    et: 'Sõnad, mis sisaldavad numbreid või sümboleid, ei ole lubatud',
    en: 'Words containing numbers or special characters are not allowed',
  },
  wordTooLong: {
    et: 'Sõna on liiga pikk. Suurenda sõnarägastiku mõõtmeid',
    en: 'The word is too long. Increase the size of the grid',
  },
}

export const useCreatorStore = defineStore('creator', () => {
  const languageStore = useLanguageStore()
  const selectedLanguage = computed({
    get: () => languageStore.currentLanguage,
    set: val => languageStore.setLanguage(val),
  })

  const width = ref(15)
  const height = ref(15)
  const overlap = ref(Constants.OVERLAP.NO_OVERLAP.value)
  const backwardsEnabled = ref(false)
  const diagonalsEnabled = ref(false)
  const casing = ref(Constants.CASING.UPPERCASE.value)
  const grid = ref([])
  const topic = ref('')
  const inputLanguage = ref(languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value)
  const outputLanguage = ref(languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value)
  const mode = ref(Constants.MODE.WORDS.value)
  const words = ref([])
  const customWords = ref([])
  const alphabetize = ref(false)
  const highlight = ref(false)
  const title = ref(null)
  const answers = ref([])
  const wordListCasing = ref(Constants.CASING.MAINTAIN_CASING.value)
  const nonAlphaAllowed = ref(false)
  const generateWordList = ref(false)
  const highlightColors = ref([])

  const getGrid = computed(() => {
    if (grid.value.length > 0) {
      return grid.value
    }
    return Array.from({ length: height.value }, () =>
      Array.from({ length: width.value }, () => '?'),
    )
  })

  const getWords = computed(() => {
    let formattedWords = words.value
    if (wordListCasing.value === Constants.CASING.UPPERCASE.value) {
      formattedWords = words.value.map(obj => ({
        ...obj,
        hint: obj.hint.toUpperCase(),
      }))
    } else if (wordListCasing.value === Constants.CASING.LOWERCASE.value) {
      formattedWords = words.value.map(obj => ({
        ...obj,
        hint: obj.hint.toLowerCase(),
      }))
    }
    return alphabetize.value
      ? formattedWords.slice().sort((a, b) => a.hint.localeCompare(b.hint))
      : formattedWords
  })

  const getCustomWords = computed(() => {
    let formattedWords = customWords.value
    if (wordListCasing.value === Constants.CASING.UPPERCASE.value) {
      formattedWords = customWords.value.map(obj => ({
        ...obj,
        hint: obj.hint.toUpperCase(),
      }))
    } else if (wordListCasing.value === Constants.CASING.LOWERCASE.value) {
      formattedWords = customWords.value.map(obj => ({
        ...obj,
        hint: obj.hint.toLowerCase(),
      }))
    }
    return alphabetize.value
      ? formattedWords.slice().sort((a, b) => a.hint.localeCompare(b.hint))
      : formattedWords
  })

  function addWord(input, validate) {

    if (!input.word) {
      return { success: false, message: text.empty[selectedLanguage.value] }
    }

    if (mode.value === Constants.MODE.HINTS.value) {
      if (!input.hint) {
        return { success: false, message: text.addHint[selectedLanguage.value] }
      }
    } else {
      input.hint = input.word
    }

    if (
      validate &&
      customWords.value.some(
        word =>
          word.word.toUpperCase() === input.word.toUpperCase() ||
          word.hint.toUpperCase() === input.hint.toUpperCase(),
      )
    ) {
      return { success: false, message: text.alreadyInList[selectedLanguage.value] }
    }
    if (validate && !nonAlphaAllowed.value && !isOnlyLetters(input.word)) {
      return {
        success: false,
        message: text.nonAlpha[selectedLanguage.value],
      }
    }
    if (validate && input.word.length > Math.max(width.value, height.value)) {
      return { success: false, message: text.wordTooLong[selectedLanguage.value] }
    }

    customWords.value.push(input)
    return { success: true }
  }

  function removeWord(word) {
    customWords.value = customWords.value.filter(
      item =>
        item.word.toUpperCase() !== word.word.toUpperCase() &&
        item.hint.toUpperCase() !== word.hint.toUpperCase(),
    )
  }

  function removeAllWords() {
    customWords.value = []
  }

  function generateGrid(data) {
    words.value = data.words
    grid.value = data.grid
    answers.value = data.answers

    highlightColors.value = []
    let lastColor = null
    for (let i = 0; i < data.words.length; i++) {
      lastColor = getRandomColor(lastColor);
      highlightColors.value.push(lastColor)
    }
  }

  function setTitle(newTitle) {
    title.value = newTitle
  }

  function clearData() {
    width.value = 15
    height.value = 15
    overlap.value = Constants.OVERLAP.NO_OVERLAP.value
    backwardsEnabled.value = false
    diagonalsEnabled.value = false
    casing.value = Constants.CASING.UPPERCASE.value
    grid.value = []
    topic.value = ''
    inputLanguage.value = languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value
    outputLanguage.value = languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value
    mode.value = Constants.MODE.WORDS.value
    words.value = []
    customWords.value = []
    alphabetize.value = false
    highlight.value = false
    title.value = null
    answers.value = []
    wordListCasing.value = Constants.CASING.MAINTAIN_CASING.value
    nonAlphaAllowed.value = false
    generateWordList.value = false
    highlightColors.value = []
  }

  return {
    width,
    height,
    overlap,
    backwardsEnabled,
    diagonalsEnabled,
    casing,
    topic,
    inputLanguage,
    outputLanguage,
    mode,
    alphabetize,
    highlight,
    title,
    answers,
    highlightColors,
    wordListCasing,
    nonAlphaAllowed,
    generateWordList,
    getGrid,
    getWords,
    getCustomWords,
    addWord,
    removeWord,
    removeAllWords,
    generateGrid,
    setTitle,
    clearData,
  }
})
