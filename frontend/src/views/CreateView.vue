<script setup>
import GameSettings from '@/components/GameSettings.vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { useCreatorStore } from '@/stores/creatorStore';
import { ref } from 'vue';

const title = ref(null);

const highlightWords = ref(true);

const creatorStore = useCreatorStore();

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
    <GameBoard :grid="grid" :playable="false" />
    <WordList :editable="true" /><br><br>
    <input type="checkbox" name="highlight-words-checkbox" id="highlight-words-checkbox" v-model="highlightWords" />
    <label for="highlight-words-checkbox">Kuva peidetud sõnad</label>
    <button @click="generate">Genereeri</button>
    <button @click="share">Jaga mängu</button>
    <button @click="print">Prindi mäng</button>
  </main>
</template>