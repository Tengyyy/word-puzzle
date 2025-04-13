<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'
import {ref} from "vue";
import {apiRequest} from "@/api.js";
import {ENDPOINTS} from "../../../shared/ApiEndpoints.js";
import InfoTooltip from "@/components/InfoTooltip.vue";

const creatorStore = useCreatorStore()

const tooltips = ref({
  generateWordList: `
Kui see valik on lubatud, luuakse sõnade nimekiri automaatselt
    sisendteema põhjal.<br />
    Vastasel korral peab kõik soovitud sõnad sisestama manuaalselt.
`,
  topic: `
Sisendsõna, mille põhjal genereeritakse sarnastest sõnadest
sõnarägastiku sõnade nimekiri<br />
Sisendteema peab olema sisendkeeles.<br />
Teema peab olema algvormis (ainsuses ja nimetavas käändes).
`,
  language: `
<b>Sisendkeel</b> - selles keeles on sõnad sõnade nimekirjas
sõnarägastiku kõrval<br />
<b>Väljundkeel</b> - selles keeles on peidetud sõnad sõnarägastikus<br />
`,
  mode: `
Valik määrab, kas sõnarägastiku kõrval kuvatakse samad sõnad, mida
peab otsima, või nende sõnade definitsioonid.
`,
  nonAlphaAllowed: `
Valik määrab, kas sõnad võivad sisaldada tühikuid, numbreid ja muid
sümboleid, mis ei ole tähed.
`
})

const suggestions = ref([])
const fetchSuggestions = async () => {
  if (!creatorStore.topic) {
    return
  }

  try {
    suggestions.value = await apiRequest(
        ENDPOINTS.autocomplete.full +
        '?' +
        new URLSearchParams({
          query: creatorStore.topic,
          language: creatorStore.inputLanguage,
        }),
    )
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

</script>

<template>
  <div>

    <div class="d-flex align-center pl-2 py-2">

      <v-switch
          v-model="creatorStore.generateWordList"
          dense
          class="mr-4"
          hide-details
          :label="null"
      />
      <span class="d-flex align-center">
        Genereeri automaatselt sisendteema põhjal sõnade nimekiri
        <info-tooltip :text="tooltips.generateWordList" id="generate-word-list-tooltip" />
      </span>
    </div>

    <div class="topic-container">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>Sõnarägastiku teema</span>
        <info-tooltip :text="tooltips.topic" id="topic-tooltip" />
      </div>
    </div>
    <v-combobox
      :disabled="!creatorStore.generateWordList"
      placeholder="Teema"
      v-model="creatorStore.topic"
      rounded
      @update:search="fetchSuggestions"
      :items="suggestions"
      variant="outlined"
      dense
      auto-select-first
      :hide-no-data="false"
      no-data-text="Lemma puudub"
    />

    <div class="mt-4">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>Sõnarägastiku keel</span>
        <info-tooltip :text="tooltips.language" id="language-tooltip" />
      </div>
      <div class="language-controls mt-4">
        <v-select
          label="Sisendkeel"
          v-model="creatorStore.inputLanguage"
          :items="Object.values(Constants.LANGUAGE)"
          item-title="text"
          item-value="value"
          rounded
          variant="outlined"
          dense
        />

        <v-select
          label="Väljundkeel"
          v-model="creatorStore.outputLanguage"
          :items="Object.values(Constants.LANGUAGE)"
          item-title="text"
          item-value="value"
          rounded
          variant="outlined"
          dense
        />
      </div>
    </div>

    <v-radio-group class="mt-4" v-model="creatorStore.mode" dense>
      <template #label>
        <span>Kuva sõnarägastiku kõrval</span>
        <info-tooltip :text="tooltips.mode" id="mode-tooltip" />
      </template>
      <template v-for="mode in Constants.MODE" :key="mode.value">
        <v-radio :value="mode.value" :label="mode.text" />
      </template>
    </v-radio-group>

    <v-radio-group
      label="Tähtede suurus sõnade nimekirjas"
      v-model="creatorStore.wordListCasing"
      dense
    >
      <template v-for="mode in Constants.CASING" :key="mode.value">
        <v-radio :value="mode.value" :label="mode.text" />
      </template>
    </v-radio-group>

    <div class="d-flex align-center pl-2 py-2">
      <v-checkbox
          v-model="creatorStore.nonAlphaAllowed"
          density="compact"
          class="mr-4"
          hide-details
          :label="null"
      />
      <span class="d-flex align-center">
        Luba mitte-tähestikulised märgid sõnedes
        <info-tooltip class="ml-1" :text="tooltips.nonAlphaAllowed" id="non-alpha-allowed-tooltip" />
      </span>
    </div>

    <v-switch
      label="Kuva sõnad tähestikulises järjekorras"
      class="pl-2"
      v-model="creatorStore.alphabetize"
      dense
    />
  </div>
</template>

<style scoped>
.topic-container {
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

.language-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
