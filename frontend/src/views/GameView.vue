<script setup>
import { ref, watch, onMounted } from 'vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { useGameStore } from '@/stores/gameStore';
import { useRouter } from 'vue-router';



const gameEnded = ref(false);
const gameInProgress = ref(false);

const boardRef = ref(null);

const title = ref(null);

const grid = ref(null);
const words = ref(null);
const wordsToFind = ref(null);
const foundWords = ref([]);

const gameStore = useGameStore();
const router = useRouter();

onMounted(() => {
  loadGame(gameStore.gameData);
});

const loadGame = (data) => {
  title.value = data.title;
  grid.value = data.grid;
  words.value = data.words;
  wordsToFind.value = [...data.words];
  foundWords.value = [];
  gameInProgress.value = true;
  gameEnded.value = false;
};

const endGame = () => {
  gameEnded.value = true;
  gameInProgress.value = false;
};

const goHome = () => {
  router.push({ path: `/` });

};

watch(() => wordsToFind.value,
  (newArr) => {
    if (newArr.length === 0) { // No words left to find, show congratulation message and button to play again
      endGame();
    }
  },
  { deep: true }
);

const handleSelect = (selectedWord) => {
  const forwards = selectedWord.toUpperCase();
  const backwards = selectedWord.split('').reverse().join('').toUpperCase();
  let success = false;
  for (let i = 0; i < wordsToFind.value.length; i++) {
    // Check if selected word matches any in the word list, either forwards or backwards
    const word = wordsToFind.value[i];
    const upper = word.toUpperCase();
    if (upper === forwards || upper === backwards) {
      wordsToFind.value.splice(i, 1);
      foundWords.value.push(word);
      success = true;
      break;
    }
  }

  boardRef.value.resetSelection(success);
};

</script>

<template>
  <main>
    <template v-if="gameInProgress">
      <h1>{{ title }}</h1>
      <GameBoard :grid="grid" :words="words" @select="handleSelect" ref="boardRef" />
      <WordList :words="words" :foundWords="foundWords" />
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