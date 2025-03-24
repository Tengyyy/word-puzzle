<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'
import { useLoadingStore } from '@/stores/loadingStore.js'

const creatorStore = useCreatorStore()
const loadingStore = useLoadingStore()
</script>

<template>
  <v-number-input
    label="Laius"
    id="width-input"
    v-model="creatorStore.widthInput"
    :disabled="loadingStore.isLoading"
    :min="5"
    :max="30"
  />

  <v-number-input
    label="Kõrgus"
    id="height-input"
    v-model="creatorStore.heightInput"
    :disabled="loadingStore.isLoading"
    :min="5"
    :max="30"
  />

  <v-radio-group label="Sõnade kattumine" v-model="creatorStore.overlap">
    <template v-for="option in Constants.OVERLAP" :key="option.value">
      <v-radio
        :value="option.value"
        :label="option.text"
        :disabled="loadingStore.isLoading"
      />
    </template>
  </v-radio-group>

  <v-checkbox
    label="Sõnad võivad esineda vastupidises suuna"
    v-model="creatorStore.backwardsEnabled"
    :disabled="loadingStore.isLoading"
  />

  <v-checkbox
    label="Sõnad võivad esineda diagonaalis"
    v-model="creatorStore.diagonalsEnabled"
    :disabled="loadingStore.isLoading"
  />

  <v-radio-group label="Tähtede suurus" v-model="creatorStore.casing">
    <template
      v-for="option in Object.values(Constants.CASING).filter(
        opt => opt.value !== 'maintain-casing',
      )"
      :key="option.value"
    >
      <v-radio
        :value="option.value"
        :label="option.text"
        :disabled="loadingStore.isLoading"
      />
    </template>
  </v-radio-group>
</template>
