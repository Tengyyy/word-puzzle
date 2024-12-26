<script setup>
import { ref } from 'vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';

const grid = [
  ['E', 'F', 'U', 'U', 'B', 'I', 'A', 'C', 'X', 'G', 'S', 'Y', 'T', 'B', 'A'],
  ['B', 'L', 'O', 'I', 'R', 'N', 'G', 'T', 'L', 'Z', 'J', 'N', 'I', 'E', 'H'],
  ['U', 'N', 'E', 'U', 'G', 'A', 'N', 'J', 'O', 'T', 'J', 'O', 'I', 'L', 'P'],
  ['J', 'U', 'S', 'V', 'U', 'I', 'K', 'F', 'P', 'K', 'E', 'I', 'G', 'D', 'W'],
  ['G', 'Õ', 'H', 'B', 'A', 'T', 'V', 'Ä', 'W', 'E', 'Z', 'P', 'E', 'K', 'K'],
  ['G', 'M', 'E', 'I', 'O', 'N', 'O', 'Õ', 'Ä', 'H', 'K', 'R', 'R', 'I', 'C'],
  ['V', 'U', 'L', 'H', 'X', 'Q', 'T', 'E', 'L', 'J', 'A', 'O', 'D', 'V', 'L'],
  ['F', 'W', 'Z', 'M', 'O', 'N', 'E', 'F', 'B', 'C', 'E', 'K', 'J', 'R', 'T'],
  ['W', 'I', 'O', 'O', 'B', 'B', 'R', 'A', 'X', 'G', 'L', 'S', 'Y', 'A', 'F'],
  ['F', 'F', 'W', 'Q', 'T', 'S', 'U', 'Y', 'U', 'I', 'K', 'R', 'Q', 'S', 'K'],
  ['B', 'Z', 'Y', 'C', 'M', 'H', 'P', 'W', 'M', 'P', 'I', 'P', 'K', 'A', 'C'],
  ['B', 'B', 'A', 'S', 'J', 'G', 'F', 'H', 'I', 'D', 'R', 'C', 'R', 'N', 'D'],
  ['M', 'T', 'D', 'V', 'A', 'M', 'G', 'R', 'R', 'N', 'J', 'Q', 'E', 'I', 'S'],
  ['H', 'X', 'L', 'M', 'A', 'D', 'U', 'C', 'B', 'L', 'A', 'B', 'E', 'N', 'D'],
  ['E', 'V', 'O', 'I', 'K', 'Q', 'T', 'O', 'A', 'I', 'K', 'S', 'Y', 'K', 'I']
];

const words = [
  'elevant',
  'kaelkirjak',
  'ninasarvik',
  'jääkaru',
  'lõvi',
  'skorpion',
  'jõehobu',
  'madu',
  'tiiger'
];

const wordsToFind = ref([...words]);
const foundWords = ref([]);

const handleSelect = (selectedWord) => {
  const forwards = selectedWord.toUpperCase();
  const backwards = selectedWord.split('').reverse().join('').toUpperCase();
  for (let i = 0; i < wordsToFind.value.length; i++) {
    // Check if selected word matches any in the word list, either forwards or backwards
    const word = wordsToFind.value[i];
    const upper = word.toUpperCase();
    if (upper === forwards || upper === backwards) {
      console.log(selectedWord);
      wordsToFind.value.splice(i, 1);
      foundWords.value.push(word);
      break;
    }
  }
}

</script>

<template>
  <main>
    <GameBoard :grid="grid" :words="words" @select="handleSelect" />
    <WordList :words="words" :foundWords="foundWords" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
</style>