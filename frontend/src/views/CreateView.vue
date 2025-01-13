<script setup>
import { ref } from 'vue';

const title = ref(null);
const width = ref(15);
const height = ref(15);
const overlap = ref('no-overlap')

const backwardsEnabled = ref(false);
const diagonalsEnabled = ref(false);

const casing = ref('upper');

//TODO: move the controls/settings to a separate component

//TODO: for the word list a toggle to alphabetize the word list
//TODO: grid/board, wordlist with input to enter more words, button to regenereta grid
//TODO: button to create game/link
//TODO: button to print game
</script>


<template>
  <main>
    <label for="title-input">Pealkiri:</label><br>
    <input type="text" id="title-input" name="title-input" v-model="title" /><br><br>
    <label for="width-input">Laius:</label><br>
    <input type="number" id="width-input" name="width-input" v-model="width" /><br><br>
    <label for="height-input">Kõrgus:</label><br>
    <input type="number" id="height-input" name="height-input" v-model="height" /><br><br>
    <label>Sõnade kattumine:</label><br>
    <input type="radio" id="no-overlap-radio" value="no-overlap" v-model="overlap" />
    <label for="no-overlap-radio">Sõnad ei kattu</label><br>
    <input type="radio" id="possible-overlap-radio" value="possible-overlap" v-model="overlap" />
    <label for="possible-overlap-radio">Sõnad võivad kattuda</label><br>
    <input type="radio" id="force-overlap-radio" value="force-overlap" v-model="overlap" />
    <label for="force-overlap-radio">Sõnad kattuvad võimalikult palju</label><br>

  </main>
</template>