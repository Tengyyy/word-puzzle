import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    id: null,
    grid: null,
    words: null,
    title: null,
    topic: null,
    wordsToFind: [],
    foundWords: [],
    gameEnded: false,
    gameInProgress: false,
  }),
  getters: {
    getGrid: state => state.grid,
    getWords: state => state.words,
  },
  actions: {
    setGameData(data) {
      this.grid = data.grid
      this.words = data.words
      this.id = data.id
      this.title = data.title
      this.topic = data.topic
      this.wordsToFind = [...data.words]
      this.foundWords = []
    },
    clearGameData() {
      this.id = null
      this.grid = null
      this.words = null
      this.title = null
      this.topic = null
      this.wordsToFind = []
      this.foundWords = []
    },
    startGame() {
      this.gameInProgress = true
      this.gameEnded = false
    },
    endGame() {
      this.gameInProgress = false
      this.gameEnded = true
    },
    selectWord(selection) {
      const forwards = selection.toUpperCase()
      const backwards = selection.split('').reverse().join('').toUpperCase()
      let success = false
      for (let i = 0; i < this.wordsToFind.length; i++) {
        // Check if selected word matches any in the word list, either forwards or backwards
        const word = this.wordsToFind[i]
        const upper = word.toUpperCase()
        if (upper === forwards || upper === backwards) {
          this.wordsToFind.splice(i, 1)
          this.foundWords.push(word)
          success = true
          break
        }
      }

      if (this.foundWords.length === 0) {
        this.endGame()
      }

      return success
    },
  },
})
