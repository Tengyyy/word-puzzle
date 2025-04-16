<script setup>
import {ref, computed, onMounted, nextTick, onBeforeUnmount} from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { usePrintStore } from '@/stores/printStore.js'
import MainCard from "@/components/MainCard.vue";
import {calculateWordItemWidth} from "../../../shared/Utils.js";
import {useLanguageStore} from "@/stores/languageStore.js";

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
})

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const text = {
  printPuzzle: {
    et: 'Prindi sõnarägastik',
    en: 'Print puzzle',
  },
  printAnswers: {
    et: 'Prindi vastused',
    en: 'Print answers',
  }
}

const answerBoard = ref(null)

const printMode = ref('puzzle')

const printStore = usePrintStore()
const mode = computed(() => {
  return printStore.isCreateView ? MODE.CREATE : MODE.GAME
})

const printPuzzle = () => {
  printMode.value = 'puzzle'
  nextTick(() => window.print())
}

const printSolutions = () => {
  if (mode.value !== MODE.CREATE) {
    return
  }
  printMode.value = 'answers'
  nextTick(() => window.print())
}

onMounted(() => {
  if (answerBoard.value) {
    answerBoard.value.toggleHighlights()
  }

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
})

const hintMode = computed(() => {
  const words = printStore.getWords;
  return !!words.find((item) => item.hint.toUpperCase() !== item.word.toUpperCase());
})

const gridRowCount = computed(() => {
  if (printStore.getGrid && printStore.getGrid.length > 0) return printStore.getGrid.length

  return 0
})

const gridColumnCount = computed(() => {
  if (printStore.getGrid && printStore.getGrid.length > 0 && printStore.getGrid[0] && printStore.getGrid[0].length > 0) return printStore.getGrid[0].length;

  return 0
})

const gridCellSize = computed(() => {
  if (gridColumnCount.value > 20) {
    return 25
  }

  if (gridColumnCount.value > 15) {
    return 30
  }

  return 40;
})

const gridWidth = computed(() => {
  return gridColumnCount.value * gridCellSize.value;
})

const gridHeight = computed(() => {
  return gridRowCount.value * gridCellSize.value;
})

const estimatedWordItemWidth = computed(() => {
  return calculateWordItemWidth(printStore.getWords, false)
})

const estimatedAnswerItemWidth = computed(() => {
  return calculateWordItemWidth(printStore.getWords, hintMode.value)
})

const mainContainer = ref(null)
const availableWidth = ref(1200)

const totalWords = computed(() => {
  return printStore.getWords.length
})

const cardWidth = computed(() => {
  return Math.max(gridWidth.value, 500) + 48
})

const realWordItemWidth = computed(() => {
  return Math.min(estimatedWordItemWidth.value, cardWidth.value - 48)
})

const realAnswerItemWidth = computed(() => {
  return Math.min(estimatedAnswerItemWidth.value, cardWidth.value - 48)
})

const wordColumnCount = computed(() => {
  return Math.min(totalWords.value, Math.floor(gridWidth.value / realWordItemWidth.value))
})

const answerColumnCount = computed(() => {
  return Math.min(totalWords.value, Math.floor(gridWidth.value / realAnswerItemWidth.value))
})

const wordColumnSize = computed(() => {
  return Math.ceil(totalWords.value / wordColumnCount.value)
})

const answerColumnSize = computed(() => {
  return Math.ceil(totalWords.value / answerColumnCount.value)
})

</script>

<template>

  <v-container
      class="d-flex flex-column justify-center align-center full-page"
      ref="mainContainer"
  >
    <div class="ma-0 mt-16 pa-0 pt-8 hide-on-print d-flex align-center justify-center ga-4" :class="{ 'flex-column': $vuetify.display.xs }">
      <v-btn @click="printPuzzle" color="primary" rounded class="print-button">
        <v-icon class="mr-2">mdi-printer</v-icon>
        {{ text.printPuzzle[selectedLanguage] }}
      </v-btn>

      <v-btn v-if="mode === MODE.CREATE" @click="printSolutions" color="primary" variant="outlined" rounded class="print-button">
        <v-icon class="mr-2">mdi-printer-check</v-icon>
        {{ text.printAnswers[selectedLanguage] }}
      </v-btn>
    </div>

    <main-card
        :width="cardWidth"
        class="elevation-0 print-section"
        :class="printMode === 'answers' ? 'hide-on-print' : ''"
    >
      <v-card-title class="text-h5 font-weight-bold d-flex align-center justify-center position-relative">
        {{ printStore.title }}
      </v-card-title>

      <v-divider class="mb-6" />

      <v-row no-gutters class="stacked-layout">
        <v-col
            :cols="12"
        >
          <GameBoard
              :mode="mode"
              :print-view="true"
              :cell-size="gridCellSize"
              :width="gridWidth"
              :height="gridHeight"
          />
        </v-col>
        <v-col
            :cols="12"
        >
          <WordList
              :mode="mode"
              :print-view="true"
              :hintMode="estimatedWordItemWidth > 1000"
              :column-count="wordColumnCount"
              :column-size="wordColumnSize"
              :word-item-width="realWordItemWidth"
              stacked-layout
              :width="cardWidth - 48"
          />
        </v-col>
      </v-row>

    </main-card>

    <main-card
        v-if="printStore.isCreateView"
        :width="cardWidth"
        class="elevation-0 print-section "
        :class="printMode === 'puzzle' ? 'hide-on-print' : ''"
    >
      <v-card-title class="text-h5 font-weight-bold d-flex align-center justify-center position-relative">
        {{ printStore.title }}
      </v-card-title>

      <v-divider class="mb-6" />

      <v-row no-gutters class="stacked-layout">
        <v-col
            :cols="12"
        >
          <GameBoard
              :mode="mode"
              :print-view="true"
              ref="answerBoard"
              :cell-size="gridCellSize"
              :width="gridWidth"
              :height="gridHeight"
          />
        </v-col>
        <v-col
            :cols="12"
        >
          <WordList
              :mode="mode"
              :print-view="true"
              :hintMode="estimatedAnswerItemWidth > 1000"
              :column-count="answerColumnCount"
              :column-size="answerColumnSize"
              stacked-layout
              :word-item-width="realAnswerItemWidth"
              :answer-list="true"
              :width="cardWidth - 48"
          />
        </v-col>
      </v-row>

    </main-card>

  </v-container>
</template>

<style scoped>

.full-page {
  min-height: 100vh;
  box-sizing: border-box;
}

@media print {
  .hide-on-print {
    display: none !important;
  }
}

@page {
  margin: 0;
  size: A4;
}

</style>
