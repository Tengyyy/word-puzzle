<script setup>
import {ref, onMounted, computed, onBeforeUnmount, nextTick, watch} from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useRouter } from 'vue-router'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useDialogStore } from '@/stores/dialogStore.js'

const boardRef = ref(null)

const gameStore = useGameStore()
const router = useRouter()

const dialogStore = useDialogStore()

const victory_audio = new Audio(
  new URL('@/assets/sounds/victory.wav', import.meta.url).href,
)

const goHome = () => {
  router.push({ path: ENDPOINTS.home.relative })
}

const print = () => {
  window.open(`${ENDPOINTS.printer.relative}/${gameStore.id}`, '_blank') // Open print page in a new tab
}

const handleSelect = async selectedWord => {
  let success = gameStore.selectWord(selectedWord)
  boardRef.value.resetSelection(success)

  if (gameStore.gameEnded) {
    victory_audio.play()
    dialogStore.showDialog(
      'Leidsid kõik sõnad!',
      'Sõnarägastik lahendatud',
      () => goHome(),
      () => {},
    )
  }
}

const hintMode = computed(() => {
  const words = gameStore.getWords;
  return !!words.find((item) => item.hint.toUpperCase() !== item.word.toUpperCase());
})

const gridCellSize = computed(() => {
  return 40;
})

const gridWidth = computed(() => {
  let firstRow = [];
  const grid = gameStore.getGrid;
  if (grid && grid.length > 0 && grid[0] && grid[0].length > 0) firstRow = grid[0];

  return firstRow.length * gridCellSize.value;
})

const gridHeight = computed(() => {
  let grid = []
  if (gameStore.getGrid && gameStore.getGrid.length > 0) grid = gameStore.getGrid

  return grid.length * gridCellSize.value;
})

const estimateWordItemHeight = 40
const estimatedWordItemWidth = 150

const mainContainer = ref(null)
const availableWidth = ref(1200)

const minHintModeListWidth = 1000

const totalWords = computed(() => {
  return gameStore.getWords.length
})

const estimatedColumnCount = computed(() => {
  return Math.ceil((totalWords.value * estimateWordItemHeight) / gridHeight.value)
})

const estimatedWordListWidth = computed(() => {
  return estimatedColumnCount.value * estimatedWordItemWidth
})

const stackedLayout = computed(() => {
  const totalEstimatedWidth = gridWidth.value + (hintMode.value ? minHintModeListWidth : estimatedWordListWidth.value)
  // add 48 because of card padding and 24 because of word-list left margin
  return totalEstimatedWidth + 48 + 24 > availableWidth.value
})

const wordListWidth = computed(() => {
  if (stackedLayout.value) {
    return Math.max(gridWidth.value, 500)
  }

  return hintMode.value ? minHintModeListWidth + 24 : estimatedWordListWidth.value + 24
})

const cardWidth = computed(() => {
  if (stackedLayout.value) {
    return Math.max(gridWidth.value, 500) + 48
  }

  // add 48 because of card padding
  return gridWidth.value + wordListWidth.value + 48
})

const columnCount = computed(() => {
  if (hintMode.value) {
    return 1
  }

  if (stackedLayout.value) {
    return Math.floor(totalWords.value, Math.floor(gridWidth.value / estimatedWordItemWidth))
  }

  return estimatedColumnCount.value
})

const columnSize = computed(() => {
  if (hintMode.value) {
    return totalWords.value
  }

  if (stackedLayout.value) {
    return Math.ceil(totalWords.value / columnCount.value)
  }

  return Math.floor(gridHeight.value / estimateWordItemHeight)
})



onMounted(() => {
  const el = mainContainer.value?.$el
  if (el instanceof HTMLElement) {
    availableWidth.value = el.getBoundingClientRect().width

    const resizeObserver = new ResizeObserver(() => {
      availableWidth.value = el.getBoundingClientRect().width
    })

    resizeObserver.observe(el)

    onBeforeUnmount(() => {
      resizeObserver.disconnect()
    })
  }

  gameStore.startGame()
})


</script>

<template>
  <v-container class="d-flex justify-center" ref="mainContainer">
    <v-card :width="cardWidth" elevation="6" class="py-4 px-6 rounded-xl">
      <v-card-title class="text-h5 font-weight-bold d-flex align-center justify-center position-relative">
        {{ gameStore.title }}
        <v-btn @click="print" color="primary" rounded class="print-button">
          <v-icon class="mr-2">mdi-printer</v-icon>
          Prindi mäng
        </v-btn>
      </v-card-title>

      <v-divider class="mb-6" />

      <v-row no-gutters :class="stackedLayout ? 'stacked-layout' : 'side-by-side-layout'">
        <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="!stackedLayout ? { width: gridWidth + 'px' } : undefined"
        >
          <GameBoard
              mode="game"
              @select="handleSelect"
              ref="boardRef"
              :cell-size="gridCellSize"
              :width="gridWidth"
              :height="gridHeight"
          />
        </v-col>
        <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="!stackedLayout ? { width: wordListWidth + 'px' } : undefined"
        >
          <WordList
              mode="game"
              :hintMode="hintMode"
              :column-count="columnCount"
              :column-size="columnSize"
              :stacked-layout="stackedLayout"
          />
        </v-col>
      </v-row>

    </v-card>

  </v-container>
</template>

<style scoped>
.print-button {
  position: absolute;
  right: 0;
}
</style>
