import { defineStore } from 'pinia'

export const useCreatorStore = defineStore('creator', {
  state: () => ({
    width: 15,
    height: 15,
    grid: [],
    words: [],
    alphabetize: false,
  }),
  getters: {
    getGrid: state => {
      if (state.grid && state.grid.length() > 0) {
        return state.grid
      }

      return Array.from({ length: state.height }, () =>
        Array.from({ length: state.width }, () => '?'),
      )
    },
    getWords: state => {
      if (!state.alphabetize) {
        return state.words
      }

      return state.words.toSorted()
    },
  },
  actions: {
    setWidth(width) {
      this.width = width
    },
    setHeight(height) {
      this.height = height
    },
    setGrid(grid) {
      this.grid = grid
    },
    addWord(input) {
      if (this.words.some(word => word === input)) {
        return false
      }
      this.words.push(input)
      return true
    },
    removeWord(word) {
      this.words = this.words.filter(item => item !== word)
    },
    setAlphabetize(alphabetize) {
      this.alphabetize = alphabetize
    },
    clearData() {
      this.width = 15
      this.height = 15
      this.grid = []
      this.words = []
      this.alphabetize = false
    },
  },
})
