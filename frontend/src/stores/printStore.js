import { defineStore } from 'pinia'

export const usePrintStore = defineStore('print', {
  state: () => ({
    id: null,
    grid: null,
    words: null,
    title: null,
    answers: [],
  }),
  getters: {
    getGrid: () => this.state.grid,
    getWords: () => this.state.words,
    isCreateView: () => this.state.answers && this.state.answers.length > 0,
  },
  actions: {
    setGameData(data) {
      this.grid = data.grid
      this.words = data.words
      this.id = data.id
      this.title = data.title
      this.answers = data.answers || []
    },
    clearGameData() {
      this.id = null
      this.grid = null
      this.words = null
      this.title = null
      this.answers = []
    },
  },
})
