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

const handleSelect = (selectedWord) => {
  const forwards = selectedWord.toUpperCase();
  const backwards = selectedWord.split('').reverse().join('').toUpperCase();
  let success = gameStore.selectWord(forwards, backwards);

  boardRef.value.resetSelection(success);
};

</script>

<template>
  <main>
    <template v-if="gameStore.gameInProgress">
      <h1>{{ gameStore.title }}</h1>
      <GameBoard :playable="true" @select="handleSelect" ref="boardRef" />
      <WordList :editable="false" />
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