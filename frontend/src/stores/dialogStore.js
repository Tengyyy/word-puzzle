import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {useLanguageStore} from "@/stores/languageStore.js";

const text = {
  defaultTitle: {
    et: 'Hoiatus',
    en: 'Warning',
  }
}

export const useDialogStore = defineStore('dialog', () => {
  const visible = ref(false)
  const message = ref('')
  const title = ref('')
  const onConfirm = ref(null)
  const onClose = ref(null)

  const languageStore = useLanguageStore()
  const selectedLanguage = computed({
    get: () => languageStore.currentLanguage,
    set: val => languageStore.setLanguage(val),
  })

  function showDialog(
    msg,
    dialogTitle = text.defaultTitle[selectedLanguage.value],
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
