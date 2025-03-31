import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Constants } from '../../../shared/Constants.js'
import {getRandomColor} from "../../../shared/Utils.js";

export const useCreatorStore = defineStore('creator', () => {
  const width = ref(15)
  const height = ref(15)
  const overlap = ref(Constants.OVERLAP.NO_OVERLAP.value)
  const backwardsEnabled = ref(false)
  const diagonalsEnabled = ref(false)
  const casing = ref(Constants.CASING.UPPERCASE.value)
  const grid = ref([])
  const topic = ref('')
  const inputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)
  const outputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)
  const mode = ref(Constants.MODE.WORDS.value)
  const words = ref([])
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

  function addWord(input, validate) {

    if (!input.word) {
      return { success: false, message: 'Tühja sõne ei saa lisada nimekirja' }
    }

    if (mode.value === Constants.MODE.HINTS.value) {
      if (!input.hint) {
        return { success: false, message: 'Palun lisa sõnale vihje' }
      }
    } else {
      input.hint = input.word
    }

    if (
      validate &&
      words.value.some(
        word =>
          word.word.toUpperCase() === input.word.toUpperCase() ||
          word.hint.toUpperCase() === input.hint.toUpperCase(),
      )
    ) {
      return { success: false, message: 'See sõna juba on nimekirjas' }
    }
    if (validate && !nonAlphaAllowed.value && /\s/.test(input.word)) {
      return {
        success: false,
        message: 'Tühikuid sisaldavad sõned pole lubatud',
      }
    }
    if (validate && input.word.length > Math.max(width.value, height.value)) {
      return { success: false, message: 'Sõna on liiga pikk. Suurenda sõnarägastiku mõõtmeid' }
    }

    words.value.push(input)
    return { success: true }
  }

  function removeWord(word) {
    words.value = words.value.filter(
      item =>
        item.word.toUpperCase() !== word.word.toUpperCase() &&
        item.hint.toUpperCase() !== word.hint.toUpperCase(),
    )
  }

  function removeAllWords() {
    words.value = []
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
    inputLanguage.value = Constants.LANGUAGE.ESTONIAN.value
    outputLanguage.value = Constants.LANGUAGE.ESTONIAN.value
    mode.value = Constants.MODE.WORDS.value
    words.value = []
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
    addWord,
    removeWord,
    removeAllWords,
    generateGrid,
    setTitle,
    clearData,
  }
})
