import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  const visible = ref(false)
  const message = ref('')
  const title = ref('')
  const onConfirm = ref(null)
  const onClose = ref(null)

  function showDialog(
    msg,
    dialogTitle = 'Hoiatus',
    onConfirmCallback = null,
    onCloseCallback = null,
  ) {
    message.value = msg
    title.value = dialogTitle
    onConfirm.value = onConfirmCallback
    onClose.value = onCloseCallback
    visible.value = true
  }

  function confirm() {
    const callback = onConfirm.value
    hide()

    if (callback) callback()
  }

  function close() {
    const callback = onClose.value
    hide()

    if (callback) callback()
  }

  function hide() {
    visible.value = false
    message.value = ''
    title.value = ''
    onConfirm.value = null
    onClose.value = null
  }

  return {
    visible,
    message,
    title,
    onConfirm,
    onClose,
    showDialog,
    confirm,
    close,
  }
})
