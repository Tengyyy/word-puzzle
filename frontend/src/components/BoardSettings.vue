<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'

const creatorStore = useCreatorStore()
</script>

<template>
  <div class="settings-group">
    <v-number-input
        label="Laius"
        id="width-input"
        v-model="creatorStore.widthInput"
        :min="5"
        :max="30"
        rounded
        variant="solo"
        dense
    />

    <v-number-input
        label="Kõrgus"
        id="height-input"
        v-model="creatorStore.heightInput"
        :min="5"
        :max="30"
        rounded
        variant="solo"
        dense
    />
  </div>

  <v-radio-group label="Sõnade kattumine" v-model="creatorStore.overlap" dense>
    <template v-for="option in Constants.OVERLAP" :key="option.value">
      <v-radio :value="option.value" :label="option.text" />
    </template>
  </v-radio-group>

  <div class="checkbox-group">
    <v-checkbox
        label="Sõnad võivad esineda vastupidises suunas"
        v-model="creatorStore.backwardsEnabled"
        dense
        class="mr-8"
    />
    <v-checkbox
        label="Sõnad võivad esineda diagonaalis"
        v-model="creatorStore.diagonalsEnabled"
        dense
    />
  </div>

  <v-radio-group label="Tähtede suurus" v-model="creatorStore.casing" dense>
    <template
        v-for="option in Object.values(Constants.CASING).filter(
        opt => opt.value !== 'maintain-casing'
      )"
        :key="option.value"
    >
      <v-radio :value="option.value" :label="option.text" />
    </template>
  </v-radio-group>
</template>

<style scoped>
.settings-group {
  display: flex;
  gap: 16px;
  margin-bottom: 0px;
}

.checkbox-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
}

v-number-input,
v-radio-group,
v-checkbox {
  margin-bottom: 0;
}

v-radio-group {
  margin-bottom: 0;
}

</style>