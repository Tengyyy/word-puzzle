import { defineStore } from 'pinia'
import { Constants } from '../../../shared/Constants.js'

export const useCreatorStore = defineStore('creator', {
  state: () => ({
    width: 15,
    height: 15,
    overlap: Constants.OVERLAP.NO_OVERLAP.value,
    backwardsEnabled: false,
    diagonalsEnabled: false,
    casing: Constants.CASING.UPPERCASE.value,
    grid: [],
    topic: '',
    inputLanguage: Constants.LANGUAGE.ESTONIAN.value,
    outputLanguage: Constants.LANGUAGE.ESTONIAN.value,
    mode: Constants.MODE.WORDS.value,
    words: [],
    alphabetize: false,
    highlight: false,
    title: null,
    answers: [],
    widthInput: 15,
    heightInput: 15,
    wordListCasing: Constants.CASING.MAINTAIN_CASING.value,
    spacesAllowed: false,
  }),
  getters: {
    getGrid: state => {
      if (state.grid && state.grid.length > 0) {
        return state.grid
      }

      return Array.from({ length: state.height }, () =>
        Array.from({ length: state.width }, () => '?'),
      )
    },
    getWords: state => {
      let formattedWords

      if (state.wordListCasing === Constants.CASING.MAINTAIN_CASING.value) {
        formattedWords = state.words
      } else if (state.wordListCasing === Constants.CASING.UPPERCASE.value) {
        formattedWords = state.words.map(obj => ({
          ...obj,
          hint: obj.hint.toUpperCase(),
        }))
      } else if (state.wordListCasing === Constants.CASING.LOWERCASE.value) {
        formattedWords = state.words.map(obj => ({
          ...obj,
          hint: obj.hint.toLowerCase(),
        }))
      }

      if (!state.alphabetize) {
        return formattedWords
      }

      return formattedWords.slice().sort((a, b) => a.hint.localeCompare(b.hint))
    },
  },
  actions: {
    addWord(input, validate) {
      if (!input.hint && !input.word) {
        return { success: false, message: 'Tühja sõne ei saa lisada nimekirja' }
      }

      if (!input.hint) {
        input.hint = input.word
      } else if (!input.word) {
        input.word = input.hint
      }

      if (
        validate &&
        this.words.some(
          word =>
            word.word.toUpperCase() === input.word.toUpperCase() ||
            word.hint.toUpperCase() === input.hint.toUpperCase(),
        )
      ) {
        return { success: false, message: 'See sõna juba on nimekirjas' }
      }

      if (validate && !this.spacesAllowed && /\s/.test(input.word)) {
        return {
          success: false,
          message: 'Tühikuid sisaldavad sõned pole lubatud',
        }
      }

      if (validate && input.word.length > Math.max(this.width, this.height)) {
        return { success: false, message: 'Sõna ei mahu rägastikku' }
      }

      const maxCharacters = Math.max(0, this.width * this.height * 0.8)
      const totalCharacters =
        this.words.reduce((sum, obj) => sum + obj.word.length, 0) +
        input.word.length
      if (validate && totalCharacters > maxCharacters) {
        return {
          success: false,
          message:
            'Nimekirjas on liiga palju sõnu. Suurenda rägastiku laiust või kõrgust',
        }
      }

      this.words.push(input)
      return { success: true }
    },
    removeWord(word) {
      this.words = this.words.filter(
        item =>
          item.word.toUpperCase() !== word.word.toUpperCase() &&
          item.hint.toUpperCase() !== word.hint.toUpperCase(),
      )
    },
    removeAllWords() {
      this.words = []
    },
    generateGrid(data) {
      this.width = this.widthInput
      this.height = this.heightInput
      this.grid = data.grid
      this.answers = data.answers
    },
    clearData() {
      this.width = 15
      this.height = 15
      this.overlap = Constants.OVERLAP.NO_OVERLAP.value
      this.backwardsEnabled = false
      this.diagonalsEnabled = false
      this.casing = Constants.CASING.UPPERCASE.value
      this.grid = []
      this.topic = ''
      this.inputLanguage = Constants.LANGUAGE.ESTONIAN.value
      this.outputLanguage = Constants.LANGUAGE.ESTONIAN.value
      this.mode = Constants.MODE.WORDS.value
      this.words = []
      this.alphabetize = false
      this.highlight = false
      this.title = null
      this.answers = []
      this.widthInput = 15
      this.heightInput = 15
      this.wordListCasing = Constants.CASING.MAINTAIN_CASING.value
      this.spacesAllowed = false
    },
  },
})
