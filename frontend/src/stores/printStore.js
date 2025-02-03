import { defineStore } from 'pinia'

export const usePrintStore = defineStore('print', {
  state: () => ({
    id: null,
    grid: null,
    words: null,
    title: null,
    wordPositions: [],
  }),
  actions: {
    setGameData(data) {
      this.grid = data.grid
      this.words = data.words
      this.id = data.id
      this.title = data.title
      this.wordPositions = data.wordPositions || []
    },
    clearGameData() {
      this.id = null
      this.grid = null
      this.words = null
      this.title = null
      this.wordPositions = []
    },
  },
})
