<script setup>
import { ref } from 'vue';

const width = ref(15);
const height = ref(15);
const overlap = ref('no-overlap')

const backwardsEnabled = ref(false);
const diagonalsEnabled = ref(false);

const casing = ref('uppercase');
</script>

<template>
  <main>
    <h4>Mängu sätted</h4>
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
    <label for="force-overlap-radio">Sõnad kattuvad võimalikult palju</label><br><br>
    <input type="checkbox" id="backwards-enabled-checkbox" v-model="backwardsEnabled" />
    <label for="backwards-enabled-checkbox">Sõnad võivad esineda vastupidises suunas</label><br>
    <input type="checkbox" id="diagonals-enabled-checkbox" v-model="diagonalsEnabled" />
    <label for="diagonals-enabled-checkbox">Sõnad võivad esineda diagonaalis</label><br><br>
    <label>Tähtede suurus:</label><br>
    <input type="radio" id="uppercase-radio" value="uppercase" v-model="casing" />
    <label for="uppercase-radio">Suurtähed</label><br>
    <input type="radio" id="lowercase-radio" value="lowercase" v-model="casing" />
    <label for="lowercase-radio">Väiketähed</label><br><br>
  </main>
</template>