import { defineStore } from 'pinia'

export const useCreatorStore = defineStore('creator', {
  state: () => ({
    width: 15,
    height: 15,
    overlap: 'no-overlap',
    backwardsEnabled: false,
    diagonalsEnabled: false,
    casing: 'uppercase',
    grid: [],
    topic: '',
    words: [],
    alphabetize: false,
    highlight: false,
    title: null,
    answers: [],
    widthInput: 15,
    heightInput: 15,
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
      if (!state.alphabetize) {
        return state.words
      }

      return state.words.toSorted()
    },
  },
  actions: {
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
    generateGrid(data) {
      this.width = this.widthInput
      this.height = this.heightInput
      this.grid = data.grid
      this.answers = data.answers
    },
    clearData() {
      this.width = 15
      this.height = 15
      this.overlap = 'no-overlap'
      this.backwardsEnabled = false
      this.diagonalsEnabled = false
      this.casing = 'uppercase'
      this.grid = []
      this.topic = ''
      this.words = []
      this.alphabetize = false
      this.highlight = false
      this.title = null
      this.answers = []
      this.widthInput = 15
      this.heightInput = 15
    },
  },
})
