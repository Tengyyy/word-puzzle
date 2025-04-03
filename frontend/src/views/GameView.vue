<script setup>
import { ref, onMounted, computed } from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useRouter } from 'vue-router'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import { useDialogStore } from '@/stores/dialogStore.js'

const boardRef = ref(null)

const gameStore = useGameStore()
const router = useRouter()

const loadingStore = useLoadingStore()
const dialogStore = useDialogStore()

const victory_audio = new Audio(
  new URL('@/assets/sounds/victory.wav', import.meta.url).href,
)

onMounted(() => {
  gameStore.startGame()
})

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

</script>

<template>
  <v-main>
    <v-container>
      <v-card class="px-6 py-4 rounded-lg">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center justify-center position-relative">
          {{ gameStore.title }}
          <v-btn @click="print" color="primary" rounded class="print-button">
            <v-icon class="mr-2">mdi-printer</v-icon>
            Prindi mäng
          </v-btn>
        </v-card-title>

        <v-divider class="mb-6" />


        <v-row>
            <!-- Game Grid on Left -->
            <v-col cols="12" md="6">
              <GameBoard mode="game" @select="handleSelect" ref="boardRef" :cell-size="gridCellSize" :width="gridWidth" :height="gridHeight" />
            </v-col>
            <!-- Word List on Right (initially, can move to bottom on smaller screens) -->
            <v-col cols="12" md="6">
              <WordList mode="game" />
            </v-col>
          </v-row>
      </v-card>
    </v-container>
  </v-main>
</template>

<style scoped>
.print-button {
  position: absolute;
  right: 0;
}

.v-row {
  transition: flex-direction 0.3s ease;
}

/* Adjust layout for smaller screens */
@media (max-width: 960px) {
  .v-row {
    flex-direction: column;
  }
  .v-col {
    margin-bottom: 20px;
  }
}
</style>
