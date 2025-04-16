<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'
import {computed} from "vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {useLanguageStore} from "@/stores/languageStore.js";

const creatorStore = useCreatorStore()

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const tooltips = {
  dimensions: {
    et: `
<b>Laius</b> - Veergude arv sõnarägastikus<br />
<b>Kõrgus</b> - Ridade arv sõnarägastikus<br />
Mõõtmed peavad jääma vahemikku 5 - 30<br />
<b>NB!</b> Sõnarägastikud, mis on suuremad kui <b>15 × 15</b> ei pruugi olla hästi väljaprinditavad ega mugavalt lahendatavad väiksematel ekraanidel (nt telefonidel)
`,
    en: `
<b>Width</b> – Number of columns in the word-search<br />
<b>Height</b> – Number of rows in the word-search<br />
Dimensions must be between 5 and 30<br />
<b>Note:</b> Word-search grids larger than <b>15 × 15</b> may not print well or be easy to solve on smaller screens (like phones)
`
  }
}

const text = {
  dimensions: {
    et: 'Sõnarägastiku mõõtmed',
    en: 'Word search dimensions',
  },
  width: {
    et: 'Laius',
    en: 'Width',
  },
  height: {
    et: 'Kõrgus',
    en: 'Height',
  },
  overlap: {
    et: 'Sõnade kattumine',
    en: 'Word overlap',
  },
  direction: {
    et: 'Sõnade suund',
    en: 'Word directions',
  },
  backwards: {
    et: 'Luba sõnade esinemine vastupidises suunas',
    en: 'Allow words to appear backwards',
  },
  diagonal: {
    et: 'Luba sõnade esinemine diagonaalis',
    en: 'Allow words to appear diagonally',
  },
  letterSize: {
    et: 'Tähtede suurus sõnarägastikus',
    en: 'Letter casing in the grid',
  }
}

</script>

<template>
  <div>
    <div class="size-settings mt-4">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>{{ text.dimensions[selectedLanguage] }}</span>
        <info-tooltip :text="tooltips.dimensions[selectedLanguage]" id="dimensions-tooltip" />
      </div>

      <div class="settings-container mt-4">
        <v-number-input
            :label="text.width[selectedLanguage]"
            id="width-input"
            v-model="creatorStore.width"
            :min="5"
            :max="30"
            rounded
            variant="outlined"
            dense
        />

        <v-number-input
            :label="text.height[selectedLanguage]"
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

    <v-radio-group :label="text.overlap[selectedLanguage]" v-model="creatorStore.overlap" dense class="mt-4">
      <template v-for="option in Object.values(Constants.OVERLAP)" :key="option.value">
        <v-radio :value="option.value" :label="option.text[selectedLanguage]" />
      </template>
    </v-radio-group>

    <div>
      <span class="pl-4" style="color: rgba(0, 0, 0, 0.6)">{{ text.direction[selectedLanguage] }}</span>
      <div class="checkbox-group pl-2">
        <v-checkbox
            :label="text.backwards[selectedLanguage]"
            v-model="creatorStore.backwardsEnabled"
            dense
            class="mr-8"
        />
        <v-checkbox
            :label="text.diagonal[selectedLanguage]"
            v-model="creatorStore.diagonalsEnabled"
            dense
        />
      </div>
    </div>

    <v-radio-group :label="text.letterSize[selectedLanguage]" v-model="creatorStore.casing" dense>
      <template
          v-for="option in Object.values(Constants.CASING).filter(
        opt => opt.value !== 'maintain-casing',
      )"
          :key="option.value"
      >
        <v-radio :value="option.value" :label="option.text[selectedLanguage]" />
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
