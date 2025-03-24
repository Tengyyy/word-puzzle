import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const usePrintStore = defineStore('print', () => {
  const id = ref(null)
  const grid = ref(null)
  const words = ref(null)
  const title = ref(null)
  const answers = ref([])

  const getGrid = computed(() => {
    return grid.value
  })

  const getWords = computed(() => {
    return words.value
  })

  const isCreateView = computed(() => {
    return answers.value && answers.value.length > 0
  })

  function setGameData(data) {
    grid.value = data.grid
    words.value = data.words
    id.value = data.id
    title.value = data.title
    answers.value = data.answers ? [...data.answers] : []
  }

  function clearGameData() {
    id.value = null
    grid.value = null
    words.value = null
    title.value = null
    answers.value = []
  }

  return {
    id,
    title,
    answers,
    getGrid,
    getWords,
    isCreateView,
    setGameData,
    clearGameData,
  }
})
