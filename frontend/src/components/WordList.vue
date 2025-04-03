<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { usePrintStore } from '@/stores/printStore.js'
import { computed } from 'vue'

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

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore()

const showAnswers = computed(() => {
  return props.mode === MODE.CREATE || props.answerList
})

const isFound = word =>
  props.mode === MODE.GAME &&
  !props.printView &&
  store.foundWords.some(
    foundWord => foundWord.word.toUpperCase() === word.word.toUpperCase(),
  )

const shouldShowAnswer = (word, wordFound) => {
  return (
    (showAnswers.value || wordFound) &&
    word.word.toUpperCase() !== word.hint.toUpperCase()
  )
}

const getColorForWord = (word, idx) => {
  if (props.printView) {
    if (props.answerList) {
      const color = store.highlightColors[idx];
      if (!color) return 'rgb(0, 0, 0)'
      return `rgb(${color.r}, ${color.g}, ${color.b})`
    }

    return 'rgb(0, 0, 0)'

  } else if (props.mode === MODE.GAME) {
    const foundIdx = store.foundWords.findIndex(foundWord => foundWord.word.toUpperCase() === word.word.toUpperCase())
    if (foundIdx < 0) return 'rgb(0, 0, 0)'
    const color = store.highlightColors[foundIdx];
    if (!color) return 'rgb(0, 0, 0)'

    return `rgb(${color.r}, ${color.g}, ${color.b})`
  } else {
    if (store.highlight) {
      const color = store.highlightColors[idx];
      if (!color) return 'rgb(0, 0, 0)'
      return `rgb(${color.r}, ${color.g}, ${color.b})`

    }

    return 'rgb(0, 0, 0)'
  }
}

</script>

<template>
  <v-container>
    <v-list>
      <v-list-item
        v-for="(word, index) in store.getWords"
        :key="index"
        :style="{ 'color': getColorForWord(word, index) }"
      >
        <v-list-item-title
            :class="{ 'text-decoration-line-through': isFound(word), 'font-weight-bold': !isFound(word) }"
        >
          {{ shouldShowAnswer(word, isFound(word)) ? `${word.hint} (${word.word})` : word.hint }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
