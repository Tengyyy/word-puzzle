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
  hintMode: {
    type: Boolean,
    required: false
  },
  stackedLayout: {
    type: Boolean,
    required: false
  },
  columnCount: {
    type: Number,
    required: true,
  },
  columnSize: {
    type: Number,
    required: true,
  },
  wordItemWidth: {
    type: Number,
    required: false,
  }
})

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore()

const showAnswers = computed(() => {
  return (!props.printView && props.mode === MODE.CREATE) || props.answerList
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

const columns = computed(() => {

  const arr = Array.from({ length: props.columnCount }, (_, colIdx) =>
      store.getWords.slice(colIdx * props.columnSize, (colIdx + 1) * props.columnSize)
  )

  console.log(arr)

  return arr
})

</script>

<template>


  <div
      :class="{ 'ml-6': !stackedLayout, 'mt-6': stackedLayout }"
      class="d-flex flex-row word-list-wrap pa-0 justify-center"
  >
    <div
        v-for="(column, colIdx) in columns"
        :key="colIdx"
        class="d-flex flex-column ma-0 pa-0"
    >
      <div
          v-for="(word, index) in column"
          :key="index"
          :class="{ 'my-2': hintMode }"
          :style="{
            color: getColorForWord(word, colIdx * columnSize + index),
            height: hintMode ? {} : '40px',
            width: hintMode ? '100%' : wordItemWidth + 'px',
            whiteSpace: hintMode ? 'normal' : 'nowrap',
            wordBreak: hintMode ? 'break-word' : 'normal',
          }"
      >
        <span
            :class="{
            'text-decoration-line-through': isFound(word),
            'font-weight-bold': !isFound(word),
          }"
        >
          {{
            shouldShowAnswer(word, isFound(word))
                ? `${word.hint} (${word.word})`
                : word.hint
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
}

.word-list-wrap {
  flex-wrap: wrap;
}

</style>
