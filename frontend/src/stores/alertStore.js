import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref('error')

  function showAlert(msg, alertType = 'error') {
    message.value = msg
    type.value = alertType
    visible.value = true
  }

  function hideAlert() {
    visible.value = false
  }

  return { visible, message, type, showAlert, hideAlert }
})
