<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { usePrintStore } from '@/stores/printStore.js'

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
})

const answerBoard = ref(null)

const printStore = usePrintStore()
const mode = computed(() => {
  return printStore.isCreateView ? MODE.CREATE : MODE.GAME
})

onMounted(() => {
  if (printStore.isCreateView) {
    answerBoard.value.toggleHighlights()
  }
  nextTick(() => {
    showPrintModal()
  })
})

const showPrintModal = () => {
  window.print()
}

const gridCellSize = computed(() => {
  return 40;
})

const gridWidth = computed(() => {
  let firstRow = [];
  const grid = printStore.getGrid;
  if (grid && grid.length > 0 && grid[0] && grid[0].length > 0) firstRow = grid[0];

  return firstRow.length * gridCellSize.value;
})

const gridHeight = computed(() => {
  let grid = []
  if (printStore.getGrid && printStore.getGrid.length > 0) grid = printStore.getGrid

  return grid.length * gridCellSize.value;
})

</script>

<template>
  <v-main>
    <h1>{{ printStore.title }}</h1>
    <v-btn @click="showPrintModal" class="no-print">Prindi</v-btn>
    <GameBoard :mode="mode" :printView="true" :cell-size="gridCellSize" :width="gridWidth" :height="gridHeight" />
    <WordList :mode="mode" :printView="true" />
    <template v-if="printStore.isCreateView">
      <h1 class="page-break">{{ printStore.title }}</h1>
      <GameBoard :mode="mode" :printView="true" ref="answerBoard" :cell-size="gridCellSize" :width="gridWidth" :height="gridHeight" />
      <WordList :mode="mode" :printView="true" :answerList="true" />
    </template>
  </v-main>
</template>

<style scoped>
@page {
  margin: 0;
  size: A4;
}
</style>
