import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref('error')

  function showAlert(msg, alertType = 'error', duration = 3000) {
    message.value = msg
    type.value = alertType
    visible.value = true

    setTimeout(() => {
      visible.value = false
    }, duration)
  }

  function hideAlert() {
    visible.value = false
  }

  return { visible, message, type, showAlert, hideAlert }
})
