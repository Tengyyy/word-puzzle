<script setup>
import {ref, onMounted, computed, onBeforeUnmount} from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useRouter } from 'vue-router'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useDialogStore } from '@/stores/dialogStore.js'
import MainCard from "@/components/MainCard.vue";
import {calculateWordItemWidth} from "../../../shared/Utils.js";

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

const scrollbarWidth = ref(0)

const measureScrollbarWidth = () => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.visibility = 'hidden'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  document.body.appendChild(scrollDiv)

  const inner = document.createElement('div')
  inner.style.width = '100%'
  scrollDiv.appendChild(inner)

  scrollbarWidth.value = scrollDiv.offsetWidth - inner.offsetWidth

  document.body.removeChild(scrollDiv)
}

const mainContainer = ref(null)
const availableWidth = ref(1200)

const hintMode = computed(() => {
  const words = gameStore.getWords;
  return !!words.find((item) => item.hint.toUpperCase() !== item.word.toUpperCase());
})

const gridRowCount = computed(() => {
  if (gameStore.getGrid && gameStore.getGrid.length > 0) return gameStore.getGrid.length

  return 0
})

const gridColumnCount = computed(() => {
  if (gameStore.getGrid && gameStore.getGrid.length > 0 && gameStore.getGrid[0] && gameStore.getGrid[0].length > 0) return gameStore.getGrid[0].length;

  return 0
})

const gridCellSize = ref(40)
const resizeTimeout = ref(null)

const updateGridCellSize = () => {
  const steps = [40, 30, 20];

  cancelAnimationFrame(resizeTimeout.value)

  resizeTimeout.value = requestAnimationFrame(() => {
    for (const size of steps) {
      const newGridWidth = gridColumnCount.value * size
      if (newGridWidth + 48 <= availableWidth.value) {
        if (gridRowCount.value > 25 && size === 40) continue
        if (gridCellSize.value !== size) {
          gridCellSize.value = size
        }
        return
      }
    }
    if (gridCellSize.value !== 20) {
      gridCellSize.value = 20
    }
  })
}

const gridWidth = computed(() => {
  return gridColumnCount.value * gridCellSize.value;
})

const gridHeight = computed(() => {
  return gridRowCount.value * gridCellSize.value;
})

const estimateWordItemHeight = 40
const estimatedWordItemWidth = computed(() => {
  return calculateWordItemWidth(gameStore.getWords)
})

const minHintModeListWidth = 1000

const totalWords = computed(() => {
  return gameStore.getWords.length
})

const estimatedColumnCount = computed(() => {
  return Math.ceil((totalWords.value * estimateWordItemHeight) / gridHeight.value)
})

const estimatedWordListWidth = computed(() => {
  return estimatedColumnCount.value * estimatedWordItemWidth.value
})

const stackedLayout = computed(() => {
  const totalEstimatedWidth = gridWidth.value + (hintMode.value ? minHintModeListWidth : estimatedWordListWidth.value)
  // add 48 because of card padding and 24 because of word-list left margin
  return totalEstimatedWidth + 48 + 24 + 36 > availableWidth.value
})

const wordListWidth = computed(() => {
  if (stackedLayout.value) {
    if (window.innerWidth < 960) {
      return availableWidth.value
    }

    return gridWidth.value
  }

  return hintMode.value ? minHintModeListWidth + 24 + 36 : estimatedWordListWidth.value + 24 + 36
})

const cardWidth = computed(() => {
  if (stackedLayout.value) {
    return Math.min(availableWidth.value, Math.max(gridWidth.value, 500) + 48)
  }

  // add 48 because of card padding
  return gridWidth.value + wordListWidth.value + 48
})

const columnCount = computed(() => {
  if (hintMode.value) {
    return 1
  }

  if (stackedLayout.value) {
    if (window.innerWidth < 960) {
      return Math.min(totalWords.value, Math.floor(availableWidth.value / estimatedWordItemWidth.value))
    }

    return Math.min(totalWords.value, Math.floor(gridWidth.value / estimatedWordItemWidth.value))
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

  measureScrollbarWidth()

  const el = mainContainer.value?.$el
  if (el instanceof HTMLElement) {
    availableWidth.value = Math.min(window.innerWidth, el.clientWidth + scrollbarWidth.value)

    const resizeObserver = new ResizeObserver(() => {
      availableWidth.value = Math.min(window.innerWidth, el.clientWidth + scrollbarWidth.value)
      updateGridCellSize()
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
  <v-container
      :class="$vuetify.display.smAndDown ? 'pa-0 ma-0' : undefined"
      class="d-flex justify-center mt-16"
      ref="mainContainer"
      fluid
  >
    <main-card
        :width="cardWidth"
    >
      <v-card-title
          :class="{ 'justify-center': $vuetify.display.mdAndUp }"
          class="text-h5 font-weight-bold d-flex align-center position-relative"
      >
        {{ gameStore.title }}
        <template v-if="$vuetify.display.smAndDown">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                  v-bind="props"
                  icon
                  class="print-button"
                  color="primary"
                  @click="print"
              >
                <v-icon>mdi-printer</v-icon>
              </v-btn>
            </template>
            <span>Prindi mäng</span>
          </v-tooltip>
        </template>
        <template v-else>
          <v-btn @click="print" color="primary" rounded class="print-button">
            <v-icon class="mr-2">mdi-printer</v-icon>
            Prindi mäng
          </v-btn>
        </template>
      </v-card-title>

      <v-divider class="mb-6" />

      <v-row no-gutters :class="stackedLayout ? 'stacked-layout' : 'side-by-side-layout'">
        <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="!stackedLayout ? { width: gridWidth + 'px' } : undefined"
        >
          <div class="d-flex justify-center align-center pa-0 ma-0">
            <GameBoard
                mode="game"
                @select="handleSelect"
                ref="boardRef"
                :cell-size="gridCellSize"
                :width="gridWidth"
                :height="gridHeight"
            />
          </div>
        </v-col>
        <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="!stackedLayout ? { width: wordListWidth + 'px' } : undefined"
            class="pa-0 ma-0"
        >
          <WordList
              mode="game"
              :hintMode="hintMode"
              :column-count="columnCount"
              :column-size="columnSize"
              :stacked-layout="stackedLayout"
              :word-item-width="estimatedWordItemWidth"
              :width="wordListWidth"
          />
        </v-col>
      </v-row>

    </main-card>

  </v-container>
</template>

<style scoped>

.print-button {
  position: absolute;
  right: 0;
}
</style>
