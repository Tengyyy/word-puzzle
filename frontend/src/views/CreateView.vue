<script setup>
import GameSettings from '@/components/GameSettings.vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { ref } from 'vue';

const title = ref(null);

const generate = () => {

};

const share = () => {

};

const print = () => {

};
</script>


<template>
  <main>
    <GameSettings />
    <label for="title-input">Pealkiri:</label><br>
    <input type="text" id="title-input" name="title-input" v-model="title" /><br><br>
    <GameBoard :playable="false" />
    <WordList :editable="true" /><br>
    <button @click="generate">Genereeri</button>
    <button @click="share">Jaga mängu</button>
    <button @click="print">Prindi mäng</button>
  </main>
</template>