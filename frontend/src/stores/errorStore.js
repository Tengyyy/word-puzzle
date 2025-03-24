import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErrorStore = defineStore('error', () => {
  const text = ref('')

  function setError(newText) {
    text.value = newText
  }

  function resetError() {
    text.value = ''
  }


  return {
    text,
    setError,
    resetError
  }
})
