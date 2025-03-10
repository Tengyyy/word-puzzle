<script setup>
import { useCreatorStore } from '@/stores/creatorStore';

const creatorStore = useCreatorStore();
</script>

<template>
  <main>
    <h4>Mängulaua sätted</h4>
    <label for="width-input">Laius:</label><br>
    <input type="number" id="width-input" name="width-input" v-model="creatorStore.widthInput" /><br><br>
    <label for="height-input">Kõrgus:</label><br>
    <input type="number" id="height-input" name="height-input" v-model="creatorStore.heightInput" /><br><br>
    <label>Sõnade kattumine:</label><br>
    <input type="radio" id="no-overlap-radio" value="no-overlap" v-model="creatorStore.overlap" />
    <label for="no-overlap-radio">Sõnad ei kattu</label><br>
    <input type="radio" id="possible-overlap-radio" value="possible-overlap" v-model="creatorStore.overlap" />
    <label for="possible-overlap-radio">Sõnad võivad kattuda</label><br>
    <input type="radio" id="force-overlap-radio" value="force-overlap" v-model="creatorStore.overlap" />
    <label for="force-overlap-radio">Sõnad kattuvad võimalikult palju</label><br><br>
    <input type="checkbox" id="backwards-enabled-checkbox" v-model="creatorStore.backwardsEnabled" />
    <label for="backwards-enabled-checkbox">Sõnad võivad esineda vastupidises suunas</label><br>
    <input type="checkbox" id="diagonals-enabled-checkbox" v-model="creatorStore.diagonalsEnabled" />
    <label for="diagonals-enabled-checkbox">Sõnad võivad esineda diagonaalis</label><br><br>
    <label>Tähtede suurus:</label><br>
    <input type="radio" id="uppercase-radio" value="uppercase" v-model="creatorStore.casing" />
    <label for="uppercase-radio">Suurtähed</label><br>
    <input type="radio" id="lowercase-radio" value="lowercase" v-model="creatorStore.casing" />
    <label for="lowercase-radio">Väiketähed</label><br><br>
  </main>
</template>