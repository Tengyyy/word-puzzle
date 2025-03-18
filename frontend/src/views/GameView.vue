<script setup>
import {ref, onMounted} from 'vue'
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
  console.log('Routing home')
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
    );
  }
}

</script>

<template>
  <main>
    <h1>{{ gameStore.title }}</h1>
    <GameBoard mode="game" @select="handleSelect" ref="boardRef" />
    <WordList mode="game" />
    <br />
    <button @click="print" :disabled="loadingStore.isLoading">
      Prindi mäng
    </button>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
</style>
