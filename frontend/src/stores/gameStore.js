import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    gameData: null,
  }),
  actions: {
    setGameData(data) {
      this.gameData = data
    },
    clearGameData() {
      this.gameData = null
    },
  },
})
