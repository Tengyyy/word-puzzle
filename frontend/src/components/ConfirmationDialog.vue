<template>
  <Teleport to="body">
    <v-dialog v-model="dialogStore.visible" max-width="500px" persistent>
      <v-card class="pa-3">
        <v-card-title class="font-weight-bold">{{ dialogStore.title }}</v-card-title>
        <v-card-text>{{ dialogStore.message }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" rounded variant="flat" @click="confirm">{{ text.continue[selectedLanguage] }}</v-btn>
          <v-btn color="primary" rounded variant="outlined" @click="close">{{ text.close[selectedLanguage] }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </Teleport>
</template>

<script setup>
import { useDialogStore } from '@/stores/dialogStore.js'
import {useLanguageStore} from "@/stores/languageStore.js";
import {computed} from "vue";

const text = {
  continue: {
    et: 'Jätka',
    en: 'Continue',
  },
  close: {
    et: 'Sulge',
    en: 'Close',
  }
}

const dialogStore = useDialogStore()

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const confirm = () => {
  dialogStore.confirm()
}

const close = () => {
  dialogStore.close()
}
</script>
