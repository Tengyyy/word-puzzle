<script setup>
import { useAlertStore } from '@/stores/alertStore.js'
import { useCreatorStore } from '@/stores/creatorStore.js'
import {computed, ref} from 'vue'
import {Constants} from "../../../shared/Constants.js";
import {useLanguageStore} from "@/stores/languageStore.js";

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const text = {
  removeWord: {
    et: 'Eemalda sõne',
    en: 'Remove word',
  },
  hint: {
    et: 'Vihje',
    en: 'Hint',
  },
  word: {
    et: 'Sõna',
    en: 'Word',
  },
  add: {
    et: 'Lisa',
    en: 'Add',
  }
}

const creatorStore = useCreatorStore()

const alertStore = useAlertStore()

const wordInput = ref(null)
const hintInput = ref(null)

const isHintMode = computed(() => creatorStore.mode === Constants.MODE.HINTS.value)


const addWord = () => {
  const result = creatorStore.addWord(
      { word: wordInput.value, hint: hintInput.value },
      true,
  )
  if (!result.success) {
    alertStore.showAlert(result.message)
  } else {
    wordInput.value = ''
    hintInput.value = ''
  }
}

</script>

<template>
  <v-container>

    <v-container class="word-list">
      <v-row>
        <v-col
            v-for="(word, index) in creatorStore.getCustomWords"
            :key="index"
            :cols="isHintMode ? 12 : 12"
            :md="isHintMode ? 12 : 6"
            :lg="isHintMode ? 12 : 4"
        >
          <v-card class="word-item">
            <v-card-text class="word-text">
              {{ word.word.toUpperCase() !== word.hint.toUpperCase() ? `${word.hint} (${word.word})` : word.hint }}
            </v-card-text>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-close" color="black" @click="creatorStore.removeWord(word)" variant="text"></v-btn>
              </template>
              {{ text.removeWord[selectedLanguage] }}
            </v-tooltip>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <div class="mt-10">
      <div class="input-container">
        <div
          class="input-inner-container"
          :style="{ maxWidth: isHintMode ? '1200px' : '600px' }"
        >
          <v-text-field
              v-if="isHintMode"
              :label="text.hint[selectedLanguage]"
              v-model="hintInput"
              @keyup.enter="addWord"
              class="input-field"
              variant="outlined"
              dense
              hide-details
          />
          <v-text-field
              :label="text.word[selectedLanguage]"
              v-model="wordInput"
              @keyup.enter="addWord"
              class="input-field"
              variant="outlined"
              dense
              hide-details
          />
        </div>
        <v-btn @click="addWord" color="blue" class="add-button" :disabled="!wordInput" rounded>
          <v-icon class="pr-4">mdi-plus</v-icon>
          {{ text.add[selectedLanguage] }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>

.input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: start;
  margin-top: 16px;
}

.input-inner-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-grow: 1;
  max-width: 600px;
}

.input-field {
  min-width: 250px;
  max-width: 600px;
}

.word-list {
  margin: 0;
  gap: 0;
  padding: 0;
}

.word-item {
  background-color: rgb(220, 220, 220);
  min-width: 200px;
  text-align: left;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-text {
  flex-grow: 1;
  text-align: left;
  padding: 10px;
  font-weight:  bold;
}
</style>
