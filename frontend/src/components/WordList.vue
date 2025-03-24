<script setup>
import { useAlertStore } from '@/stores/alertStore.js'
import { useCreatorStore } from '@/stores/creatorStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import { usePrintStore } from '@/stores/printStore.js'
import { ref, computed } from 'vue'

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
})

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['game', 'create'].includes(value),
  },
  printView: {
    type: Boolean,
    required: false,
    default: false,
  },
  answerList: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const editable = computed(() => {
  return props.mode === MODE.CREATE && !props.printView
})

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore()

const alertStore = useAlertStore()
const loadingStore = useLoadingStore()

const wordInput = ref(null)
const hintInput = ref(null)

const showAnswers = computed(() => {
  return editable.value || props.answerList
})

const addWord = () => {
  if (!editable.value) {
    return
  }

  const result = store.addWord(
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

const removeAllWords = () => {
  if (!editable.value) return

  store.removeAllWords()
}

const isFound = word =>
  props.mode === MODE.GAME &&
  !props.printView &&
  store.foundWords.some(
    foundWord => foundWord.word === word.word && foundWord.hint === word.hint,
  )

const shouldShowAnswer = (word, wordFound) => {
  return (
    (showAnswers.value || wordFound) &&
    word.word.toUpperCase() !== word.hint.toUpperCase()
  )
}
</script>

<template>
  <v-container>
    <v-list>
      <v-list-item
        v-for="(word, index) in store.getWords"
        :key="index"
        :class="{ 'text-decoration-line-through': isFound(word) }"
      >
        <v-list-item-title>
          {{ shouldShowAnswer(word, isFound(word)) ? `${word.hint} (${word.word})` : word.hint }}
        </v-list-item-title>
        <template v-slot:append v-if="editable">
          <v-btn icon="mdi-delete" color="red" @click="store.removeWord(word)"></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <template v-if="editable">
      <v-btn @click="removeAllWords" :disabled="loadingStore.isLoading" color="red" class="mb-4">
        Eemalda kõik sõnad
      </v-btn>

      <v-text-field
          label="Vihje"
          v-model="hintInput"
          @keyup.enter="addWord"
          :disabled="loadingStore.isLoading"
      />
      <v-text-field
          label="Sõna"
          v-model="wordInput"
          @keyup.enter="addWord"
          :disabled="loadingStore.isLoading"
      />
      <v-btn @click="addWord" color="blue" class="mt-2">Lisa</v-btn>
    </template>

  </v-container>
</template>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
