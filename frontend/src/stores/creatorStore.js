import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Constants } from '../../../shared/Constants.js'

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
  const widthInput = ref(15)
  const heightInput = ref(15)
  const wordListCasing = ref(Constants.CASING.MAINTAIN_CASING.value)
  const spacesAllowed = ref(false)

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
    if (!input.hint && !input.word) {
      return { success: false, message: 'Tühja sõne ei saa lisada nimekirja' }
    }
    if (!input.hint) input.hint = input.word
    if (!input.word) input.word = input.hint
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
    if (validate && !spacesAllowed.value && /\s/.test(input.word)) {
      return {
        success: false,
        message: 'Tühikuid sisaldavad sõned pole lubatud',
      }
    }
    if (validate && input.word.length > Math.max(width.value, height.value)) {
      return { success: false, message: 'Sõna ei mahu rägastikku' }
    }
    const maxCharacters = Math.max(0, width.value * height.value * 0.8)
    const totalCharacters =
      words.value.reduce((sum, obj) => sum + obj.word.length, 0) +
      input.word.length
    if (validate && totalCharacters > maxCharacters) {
      return {
        success: false,
        message:
          'Nimekirjas on liiga palju sõnu. Suurenda rägastiku laiust või kõrgust',
      }
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
    width.value = widthInput.value
    height.value = heightInput.value
    grid.value = data.grid
    answers.value = data.answers
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
    widthInput.value = 15
    heightInput.value = 15
    wordListCasing.value = Constants.CASING.MAINTAIN_CASING.value
    spacesAllowed.value = false
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
    widthInput,
    heightInput,
    wordListCasing,
    spacesAllowed,
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
