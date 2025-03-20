import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    visible: false,
    message: '',
    title: '',
    onConfirm: null,
    onClose: null,
  }),
  actions: {
    showDialog(
      msg,
      title = 'Hoiatus',
      onConfirmCallback = null,
      onCloseCallback = null,
    ) {
      this.message = msg
      this.title = title
      this.onConfirm = onConfirmCallback
      this.onClose = onCloseCallback
      this.visible = true
    },
    confirm() {
      const callback = this.state.onConfirm
      this.hide()

      if (callback) callback()
    },
    close() {
      const callback = this.onClose
      this.hide()

      if (callback) callback()
    },
    hide() {
      this.visible = false
      this.message = ''
      this.title = ''
      this.onConfirm = null
      this.onClose = null
    },
  },
})
