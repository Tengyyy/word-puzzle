<script setup>
import GameSettings from '@/components/GameSettings.vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { ref } from 'vue';

const title = ref(null);

// should be a openable/closeable component on the top, in the middle left should be the grid, right the word list and input box, 
// bottom the button regenerate grid, and share/get code/print. 
// title input should be moved outside of the grid control component, should be below that, 
// the topic input for generation should be on top of the word list


//TODO: for the word list a toggle to alphabetize the word list
//TODO: grid/board, wordlist with input to enter more words, button to regenereta grid
//TODO: button to create game/link
//TODO: button to print game
</script>


<template>
  <main>
    <GameSettings />
    <label for="title-input">Pealkiri:</label><br>
    <input type="text" id="title-input" name="title-input" v-model="title" /><br><br>
    <GameBoard />
    <WordList />
  </main>
</template>