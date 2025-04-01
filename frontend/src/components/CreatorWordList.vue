<script setup>
import { useAlertStore } from '@/stores/alertStore.js'
import { useCreatorStore } from '@/stores/creatorStore.js'
import {computed, ref} from 'vue'
import {Constants} from "../../../shared/Constants.js";

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

    <!-- Word List -->
    <v-container class="word-list">
      <v-row>
        <v-col
            v-for="(word, index) in creatorStore.getCustomWords"
            :key="index"
            :cols="isHintMode ? 12 : 12"
            :sm="isHintMode ? 12 : 6"
            :md="isHintMode ? 12 : 4"
            :lg="isHintMode ? 12 : 3"
        >
          <v-card class="word-item">
            <v-card-text class="word-text">
              {{ word.word.toUpperCase() !== word.hint.toUpperCase() ? `${word.hint} (${word.word})` : word.hint }}
            </v-card-text>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-close" color="black" @click="creatorStore.removeWord(word)" variant="text"></v-btn>
              </template>
              Eemalda sõna
            </v-tooltip>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Input Fields & Add Button -->
    <div class="mt-10">
      <div class="input-container">
        <div
          class="input-inner-container"
          :style="{ maxWidth: isHintMode ? '1200px' : '600px' }"
        >
          <v-text-field
              v-if="isHintMode"
              label="Vihje"
              v-model="hintInput"
              @keyup.enter="addWord"
              class="input-field"
              variant="outlined"
              dense
          />
          <v-text-field
              label="Sõna"
              v-model="wordInput"
              @keyup.enter="addWord"
              class="input-field"
              variant="outlined"
              dense
          />
        </div>
        <div class="add-button-container">
          <v-btn @click="addWord" color="blue" class="add-button" :disabled="!wordInput" rounded>
            <v-icon class="pr-4">mdi-plus</v-icon>
            Lisa
          </v-btn>
        </div>

      </div>
    </div>
  </v-container>
</template>

<style scoped>

/* Input Field and Add Button Flex Layout */
.input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: start;
  margin-top: 16px; /* Gap between word list and inputs */
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

/* Button moves to new row before inputs wrap */
.add-button-container {
  flex-shrink: 0;
  flex-grow: 1;
  align-items: center; /* Center button vertically */
}

.add-button {
  min-width: 120px;
  translate: 0 -10px;
  padding: 20px 0 35px 0;
}

/* Word List Items Layout */
.word-list {
  margin: 0;
  gap: 0;
  padding: 0;
}

/* Word Items: Minimum Size & Padding */
.word-item {
  background-color: rgb(220, 220, 220);
  min-width: 200px;
  text-align: left;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Align text to the left */
.word-text {
  flex-grow: 1;
  text-align: left;
  padding: 10px;
  font-weight:  bold;
}
</style>
