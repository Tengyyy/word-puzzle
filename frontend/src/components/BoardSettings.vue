<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js';
import { Constants } from '../../../shared/Constants.js';
import { useLoadingStore } from '@/stores/loadingStore.js';

const creatorStore = useCreatorStore();
const loadingStore = useLoadingStore();
</script>

<template>
  <main>
    <h4>Mängulaua sätted</h4>
    <label for="width-input">Laius:</label><br>
    <input type="number" id="width-input" name="width-input" v-model="creatorStore.widthInput"
      :disabled="loadingStore.isLoading" /><br><br>

    <label for="height-input">Kõrgus:</label><br>
    <input type="number" id="height-input" name="height-input" v-model="creatorStore.heightInput"
      :disabled="loadingStore.isLoading" /><br><br>

    <label>Sõnade kattumine:</label><br>
    <div v-for="(option, key) in Constants.OVERLAP" :key="key">
      <input type="radio" :id="`${option.value}-radio`" :value="option.value" v-model="creatorStore.overlap"
        :disabled="loadingStore.isLoading" />
      <label :for="`${option.value}-radio`">{{ option.text }}</label><br>
    </div>

    <br>
    <input type="checkbox" id="backwards-enabled-checkbox" v-model="creatorStore.backwardsEnabled"
      :disabled="loadingStore.isLoading" />
    <label for="backwards-enabled-checkbox">Sõnad võivad esineda vastupidises suunas</label><br>
    <input type="checkbox" id="diagonals-enabled-checkbox" v-model="creatorStore.diagonalsEnabled"
      :disabled="loadingStore.isLoading" />
    <label for="diagonals-enabled-checkbox">Sõnad võivad esineda diagonaalis</label><br><br>

    <label>Tähtede suurus:</label><br>
    <div v-for="option in Object.values(Constants.CASING).filter(opt => opt.value !== 'maintain-casing')"
      :key="option.value">
      <input type="radio" :id="`${option.value}-radio`" :value="option.value" v-model="creatorStore.casing"
        :disabled="loadingStore.isLoading" />
      <label :for="`${option.value}-radio`">{{ option.text }}</label><br>
    </div>
  </main>
</template>
