import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const id = ref(null)
  const grid = ref(null)
  const words = ref(null)
  const title = ref(null)
  const topic = ref(null)
  const wordsToFind = ref([])
  const foundWords = ref([])
  const gameEnded = ref(false)
  const gameInProgress = ref(false)

  const getGrid = computed(() => {
    return grid.value
  })

  const getWords = computed(() => {
    return words.value
  })

  function setGameData(data) {
    grid.value = data.grid
    words.value = data.words
    id.value = data.id
    title.value = data.title
    topic.value = data.topic
    wordsToFind.value = [...data.words]
    foundWords.value = []
  }

  function clearGameData() {
    id.value = null
    grid.value = null
    words.value = null
    title.value = null
    topic.value = null
    wordsToFind.value = []
    foundWords.value = []
  }

  function resetGame() {
    wordsToFind.value = [...words.value]
    foundWords.value = []
    gameEnded.value = false
    gameInProgress.value = false
  }

  function startGame() {
    resetGame()
    gameInProgress.value = true
    gameEnded.value = false
  }

  function endGame() {
    gameInProgress.value = false
    gameEnded.value = true
  }

  function selectWord(selection) {
    const forwards = selection.toUpperCase()
    const backwards = selection.split('').reverse().join('').toUpperCase()
    let success = false
    for (let i = 0; i < wordsToFind.value.length; i++) {
      // Check if selected word matches any in the word list, either forwards or backwards
      const word = wordsToFind.value[i]
      const upper = word.word.toUpperCase()
      if (upper === forwards || upper === backwards) {
        wordsToFind.value.splice(i, 1)
        foundWords.value.push(word)
        success = true
        break
      }
    }

    if (wordsToFind.value.length === 0) {
      endGame()
    }

    return success
  }

  return {
    id,
    title,
    topic,
    wordsToFind,
    foundWords,
    gameEnded,
    gameInProgress,
    getGrid,
    getWords,
    setGameData,
    clearGameData,
    startGame,
    selectWord,
  }
})
