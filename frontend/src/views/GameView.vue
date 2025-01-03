<script setup>
import { ref, watch } from 'vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';

const gameEnded = ref(false);
const gameInProgress = ref(false);

const boardRef = ref(null);

const grid = ref(null);
const words = ref(null);
const wordsToFind = ref(null);
const foundWords = ref([]);

const loadGame = () => {
  fetch("http://127.0.0.1:8081/random-game", { method: "GET" })
    .then((response) => response.json())
    .then((response) => {
      grid.value = response.grid;
      words.value = response.words;
      wordsToFind.value = [...response.words];
      foundWords.value = [];
      gameInProgress.value = true;
      gameEnded.value = false;
    })
    .catch((e) => {
      console.log(e);
    });
};

const endGame = () => {
  gameEnded.value = true;
  gameInProgress.value = false;
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
    <p v-if="gameEnded">Congratulations! You found all the words!</p>
    <template v-if="gameInProgress">
      <GameBoard :grid="grid" :words="words" @select="handleSelect" ref="boardRef" />
      <WordList :words="words" :foundWords="foundWords" />
    </template>
    <button v-else @click="loadGame">Play</button>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
</style>