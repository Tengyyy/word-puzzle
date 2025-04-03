<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'
import {ref} from "vue";
import InfoTooltip from "@/components/InfoTooltip.vue";

const creatorStore = useCreatorStore()

const tooltips = ref({
  dimensions: `
<b>Laius</b> - Veergude arv sõnarägastikus<br />
<b>Kõrgus</b> - Ridade arv sõnarägastikus<br />
Mõõtmed peavad jääma vahemikku 5 - 30<br />
<b>NB!</b> Sõnarägastikud suuremad kui <b>15 x 15</b> ei pruugi olla väljaprinditavad ega lahendatavad väiksematel ekraanidel (telefonidel)
`
})

</script>

<template>
  <div>
    <div class="size-settings mt-4">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>Sõnarägastiku mõõtmed</span>
        <InfoTooltip :text="tooltips.dimensions" />
      </div>

      <div class="settings-container mt-4">
        <v-number-input
            label="Laius"
            id="width-input"
            v-model="creatorStore.width"
            :min="5"
            :max="30"
            rounded
            variant="outlined"
            dense
        />

        <v-number-input
            label="Kõrgus"
            id="height-input"
            v-model="creatorStore.height"
            :min="5"
            :max="30"
            rounded
            variant="outlined"
            dense
        />
      </div>
    </div>

    <v-radio-group label="Sõnade kattumine" v-model="creatorStore.overlap" dense class="mt-4">
      <template v-for="option in Constants.OVERLAP" :key="option.value">
        <v-radio :value="option.value" :label="option.text" />
      </template>
    </v-radio-group>

    <div>
      <span class="pl-4" style="color: rgba(0, 0, 0, 0.6)">Sõnade suund</span>
      <div class="checkbox-group pl-2">
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
    </div>

    <v-radio-group label="Tähtede suurus sõnarägastikus" v-model="creatorStore.casing" dense>
      <template
          v-for="option in Object.values(Constants.CASING).filter(
        opt => opt.value !== 'maintain-casing',
      )"
          :key="option.value"
      >
        <v-radio :value="option.value" :label="option.text" />
      </template>
    </v-radio-group>
  </div>
</template>

<style scoped>
.size-settings {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sub-setting-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  gap: 6px;
}

.checkbox-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
}

.settings-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
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
