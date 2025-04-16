<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { Constants } from '../../../shared/Constants.js'
import {computed, ref} from "vue";
import {apiRequest} from "@/api.js";
import {ENDPOINTS} from "../../../shared/ApiEndpoints.js";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {useLanguageStore} from "@/stores/languageStore.js";

const creatorStore = useCreatorStore()

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const tooltips = {
  generateWordList: {
    et: `
Kui see valik on lubatud, luuakse sõnade nimekiri automaatselt sisendteema põhjal.<br />
Kui valik on keelatud, tuleb kõik soovitud sõnad sisestada käsitsi.
`,
    en: `
If enabled, the word list will be generated automatically based on the input topic.<br />
If disabled, all desired words must be entered manually.
`,
  },
  topic: {
    et: `
Sisendsõna, mille põhjal koostatakse sõnarägastiku sõnade nimekiri sarnastest sõnadest.<br />
Teema peab olema sisendkeeles ning algvormis (ainsus, nimetav).
`,
    en: `
The input word used to generate the word list from related words for the word search.<br />
The topic must be in the input language and in base form (singular, nominative).
`,
  },
  language: {
    et: `
<b>Sisendkeel</b> – keel, milles on sõnade nimekirjas olevad sõnad sõnarägastiku kõrval<br />
<b>Väljundkeel</b> – keel, milles on peidetud sõnad sõnarägastikus
`,
    en: `
<b>Input language</b> – the language used for the words in the word list displayed beside the puzzle<br />
<b>Output language</b> – the language used for the hidden words inside the puzzle grid
`,
  },
  mode: {
    et: `
Valik määrab, kas sõnarägastiku kõrval kuvatakse otsitavad sõnad või nende definitsioonid.
`,
    en: `
This setting determines whether the words beside the puzzle are the words to find or their definitions.
`,
  },
  nonAlphaAllowed: {
    et: `
Valik määrab, kas sõnades võivad esineda tühikud, numbrid ja muud sümbolid, mis ei ole tähed.
`,
    en: `
This setting determines whether words may include spaces, numbers, or other non-letter characters.
`,
  }
}

const text = {
  generateWordList: {
    et: 'Genereeri sõnade nimekiri sisendteema põhjal automaatselt',
    en: 'Automatically generate word list based on topic',
  },
  topic: {
    et: 'Sõnarägastiku teema',
    en: 'Topic for the word search',
  },
  topicShort: {
    et: 'Teema',
    en: 'Topic',
  },
  enterTopic: {
    et: 'Sisesta teema',
    en: 'Enter a topic',
  },
  wordNotFound: {
    et: 'Sõna ei leitud',
    en: 'Word not found',
  },
  pleaseEnterTopic: {
    et: 'Palun sisesta sõnarägastiku teema',
    en: 'Please enter a topic for the word search',
  },
  language: {
    et: 'Sõnarägastiku keel',
    en: 'Puzzle language',
  },
  inputLanguage: {
    et: 'Sisendkeel',
    en: 'Input language',
  },
  outputLanguage: {
    et: 'Väljundkeel',
    en: 'Output language',
  },
  mode: {
    et: 'Kuvamisviis sõnade nimekirjas',
    en: 'Display mode for word list',
  },
  letterSize: {
    et: 'Tähtede suurus sõnade nimekirjas',
    en: 'Letter casing in the word list',
  },
  nonAlpha: {
    et: 'Luba mitte-tähestikulised märgid sõnades',
    en: 'Allow non-letter characters in words',
  },
  alphabetize: {
    et: 'Kuva sõnad tähestikulises järjekorras',
    en: 'Sort words alphabetically',
  }
}

const searchText = ref('')
const suggestions = ref([])

const onSearch = val => {
  searchText.value = val
  fetchSuggestions(val)
}

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

const computedNoDataText = computed(() =>
    searchText.value.trim() === ''
        ? text.enterTopic[selectedLanguage.value]
        : text.wordNotFound[selectedLanguage.value],
)

const languageSpecificText = computed(() => {
  return item => item.text[selectedLanguage.value]
})

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
        {{ text.generateWordList[selectedLanguage] }}
        <info-tooltip :text="tooltips.generateWordList[selectedLanguage]" id="generate-word-list-tooltip" />
      </span>
    </div>

    <div class="topic-container">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>{{ text.topic[selectedLanguage] }}</span>
        <info-tooltip :text="tooltips.topic[selectedLanguage]" id="topic-tooltip" />
      </div>
    </div>
    <v-combobox
      :disabled="!creatorStore.generateWordList"
      :placeholder="text.topicShort[selectedLanguage]"
      v-model="creatorStore.topic"
      rounded
      @update:search="fetchSuggestions"
      :items="suggestions"
      variant="outlined"
      dense
      auto-select-first
      :hide-no-data="false"
      :no-data-text="computedNoDataText"
    />

    <div class="mt-4">
      <div class="sub-setting-title pl-4" style="color: rgba(0, 0, 0, 0.6)">
        <span>{{ text.language[selectedLanguage] }}</span>
        <info-tooltip :text="tooltips.language[selectedLanguage]" id="language-tooltip" />
      </div>
      <div class="language-controls mt-4">
        <v-select
          :label="text.inputLanguage[selectedLanguage]"
          v-model="creatorStore.inputLanguage"
          :items="Object.values(Constants.LANGUAGE)"
          :item-title="languageSpecificText"
          item-value="value"
          rounded
          variant="outlined"
          dense
        />

        <v-select
          :label="text.outputLanguage[selectedLanguage]"
          v-model="creatorStore.outputLanguage"
          :items="Object.values(Constants.LANGUAGE)"
          :item-title="languageSpecificText"
          item-value="value"
          rounded
          variant="outlined"
          dense
        />
      </div>
    </div>

    <v-radio-group class="mt-4" v-model="creatorStore.mode" dense>
      <template #label>
        <span>{{ text.mode[selectedLanguage] }}</span>
        <info-tooltip :text="tooltips.mode[selectedLanguage]" id="mode-tooltip" />
      </template>
      <template v-for="mode in Object.values(Constants.MODE)" :key="mode.value">
        <v-radio :value="mode.value" :label="mode.text[selectedLanguage]" />
      </template>
    </v-radio-group>

    <v-radio-group
      :label="text.letterSize[selectedLanguage]"
      v-model="creatorStore.wordListCasing"
      dense
    >
      <template v-for="mode in Object.values(Constants.CASING)" :key="mode.value">
        <v-radio :value="mode.value" :label="mode.text[selectedLanguage]" />
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
        {{ text.nonAlpha[selectedLanguage] }}
        <info-tooltip class="ml-1" :text="tooltips.nonAlphaAllowed[selectedLanguage]" id="non-alpha-allowed-tooltip" />
      </span>
    </div>

    <v-switch
      :label="text.alphabetize[selectedLanguage]"
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
