<script setup>
import { ref, onMounted } from 'vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { useGameStore } from '@/stores/gameStore';
import { useRouter } from 'vue-router';

const boardRef = ref(null);

const gameStore = useGameStore();
const router = useRouter();

onMounted(() => {
  gameStore.startGame();
});

const goHome = () => {
  router.push({ path: `/` });
};

const print = () => {
  //TODO: route with gameId param, target _blank
  router.push({ path: `/print` });
}


const handleSelect = (selectedWord) => {
  let success = gameStore.selectWord(selectedWord);

  boardRef.value.resetSelection(success);
};

</script>

<template>
  <main>
    <template v-if="gameStore.gameInProgress">
      <h1>{{ gameStore.title }}</h1>
      <GameBoard mode="game" @select="handleSelect" ref="boardRef" />
      <WordList mode="game" />
    </template>
    <template v-else>
      <p>Kõik sõnad leitud!</p>
      <button @click="goHome">Jätka</button>
    </template>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
</style>