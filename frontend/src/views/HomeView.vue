<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { Constants } from '../../../shared/Constants.js'
import { useAlertStore } from '@/stores/alertStore.js'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import { useLanguageStore } from '@/stores/languageStore.js'
import logo from '@/assets/logo_large.svg'
import logoEn from '@/assets/logo_large_en.svg'
import InfoTooltip from '@/components/InfoTooltip.vue'

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const difficulty = ref(Constants.DIFFICULTY.MEDIUM.value)

const inputLanguage = ref(languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value)
const outputLanguage = ref(languageStore.initialLanguage === Constants.LANGUAGE.ENGLISH.value ? Constants.LANGUAGE.ENGLISH.value : Constants.LANGUAGE.ESTONIAN.value)

const mode = ref(Constants.MODE.WORDS.value)

const router = useRouter()
const gameStore = useGameStore()
const alertStore = useAlertStore()

const loadingStore = useLoadingStore()

const tooltips = ref({
  topic: {
    et: `
Sisesta teemaks sõna, mille põhjal soovid sõnarägastikku luua.<br>
Sõna peab olema algvormis (nimetav kääne, ainsus).<br>
Sisestatud teema põhjal luuakse sõnarägastik sarnastest, teemasse kuuluvatest sõnadest.
`,
    en: `
Enter a word as a topic to generate the word-search puzzle.<br>
The word must be in its base form (nominative case, singular).<br>
Based on the entered topic, a word-search will be generated from similar, related words.
`,
  },
  inputLanguage: {
    et: `Sisendkeel määrab keele, milles kuvatakse sõnad sõnade nimekirjas rägastiku kõrval.`,
    en: `The input language determines the language in which the words are displayed in the word list next to the puzzle.`,
  },
  outputLanguage: {
    et: `Väljundkeel määrab keele, milles on sõnad, mis peidetakse sõnarägastikku.`,
    en: `The output language determines the language of the words that will be hidden in the word-search puzzle.`,
  },
  difficulty: {
    et: `
Määrab sõnarägastiku raskusastme:<br>
<b>Lihtne</b> – 10 × 10 ruudustik, kus sõnad paiknevad vaid vasakult paremale ja ülevalt alla. Sõnad ei tohi kattuda.<br>
<b>Keskmine</b> – 15 × 15 ruudustik, kus sõnad võivad kattuda ning paikneda ka vastupidises suunas ja diagonaalis.<br>
<b>Raske</b> – 20 × 20 ruudustik, kus sõnad võivad kattuda ning esineda vastupidises suunas ja diagonaalis. Vihjete asemel kuvatakse sõnade definitsioonid.
`,
    en: `
Determines the difficulty level of the word-search puzzle:<br>
<b>Easy</b> – 10 × 10 grid where words appear only left-to-right and top-to-bottom. Words cannot overlap.<br>
<b>Medium</b> – 15 × 15 grid where words may overlap and also appear in reverse or diagonal directions.<br>
<b>Hard</b> – 20 × 20 grid where words may overlap and appear in reverse or diagonal directions. Instead of showing the words, their definitions are displayed as clues.
`,
  },
})

const languageSpecificText = computed(() => {
  return item => item.text[selectedLanguage.value]
})

const text = {
  topic: {
    et: 'Sõnarägastiku teema',
    en: 'Puzzle topic',
  },
  inputLanguage: {
    et: 'Sisendkeel',
    en: 'Input language',
  },
  outputLanguage: {
    et: 'Väljundkeel',
    en: 'Output language',
  },
  play: {
    et: 'Mängi',
    en: 'Play',
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
    en: 'Please enter a topic for the word-search puzzle',
  },
}

const topic = ref('')
const searchText = ref('')
const suggestions = ref([])

const onSearch = val => {
  searchText.value = val
  fetchSuggestions(val)
}

const fetchSuggestions = async () => {
  if (!topic.value) {
    return
  }

  try {
    suggestions.value = await apiRequest(
      ENDPOINTS.autocomplete.full +
        '?' +
        new URLSearchParams({
          query: topic.value,
          language: inputLanguage.value,
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

const startGame = async () => {
  if (!topic.value) {
    alertStore.showAlert(text.pleaseEnterTopic[selectedLanguage.value], 'error')
    return
  }

  try {
    const response = await apiRequest(
      ENDPOINTS.getGame.full +
        '?' +
        new URLSearchParams({
          topic: topic.value,
          difficulty: difficulty.value,
          inputLanguage: inputLanguage.value,
          outputLanguage: outputLanguage.value,
          mode: mode.value,
        }),
    )

    gameStore.setGameData(response)
    await router.push({ path: `${ENDPOINTS.game.relative}/${response.id}` })
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const getButtonColor = value => {
  switch (value) {
    case Constants.DIFFICULTY.EASY.value:
      return 'green'
    case Constants.DIFFICULTY.MEDIUM.value:
      return 'yellow'
    case Constants.DIFFICULTY.HARD.value:
      return 'red'
    default:
      return 'gray'
  }
}
</script>
<template>
  <v-container class="d-flex align-center justify-center" style="flex: 1">
    <v-row class="w-100 d-flex align-center justify-center">
      <!-- Logo: Visible only on larger screens -->
      <v-col cols="12" md="6" class="d-none d-md-flex justify-center">
        <v-img :src="selectedLanguage === Constants.LANGUAGE.ENGLISH.value ? logoEn : logo" max-width="500" contain />
      </v-col>

      <v-col cols="12" md="6" class="d-flex flex-column align-center">
        <v-card
          class="control-panel px-4 py-16 d-flex controls-col background-light ga-4"
        >
          <div class="d-flex align-center justify-center" style="width: 80%">
            <v-combobox
              :label="text.topic[selectedLanguage]"
              v-model="topic"
              rounded
              variant="solo"
              @update:search="onSearch"
              :items="suggestions"
              auto-select-first
              hide-details
              :hide-no-data="false"
              :no-data-text="computedNoDataText"
            />
            <info-tooltip
              :text="tooltips.topic[selectedLanguage]"
              id="home-topic-tooltip"
              color="rgba(50, 50, 50, 0.7)"
            />
          </div>

          <div class="d-flex align-center justify-center" style="width: 80%">
            <v-select
              :label="text.inputLanguage[selectedLanguage]"
              v-model="inputLanguage"
              :items="Object.values(Constants.LANGUAGE)"
              :item-title="languageSpecificText"
              item-value="value"
              rounded
              variant="solo"
              hide-details
            />
            <info-tooltip
              :text="tooltips.inputLanguage[selectedLanguage]"
              id="home-input-language-tooltip"
              color="rgba(50, 50, 50, 0.7)"
            />
          </div>

          <div class="d-flex align-center justify-center" style="width: 80%">
            <v-select
              :label="text.outputLanguage[selectedLanguage]"
              v-model="outputLanguage"
              :items="Object.values(Constants.LANGUAGE)"
              :item-title="languageSpecificText"
              item-value="value"
              rounded
              variant="solo"
              hide-details
            />
            <info-tooltip
              :text="tooltips.outputLanguage[selectedLanguage]"
              id="home-output-language-tooltip"
              color="rgba(50, 50, 50, 0.7)"
            />
          </div>

          <div class="d-flex align-center justify-center">
            <v-btn-toggle
              v-model="difficulty"
              divided
              rounded="xl"
              mandatory
              class="my-4"
              variant="elevated"
            >
              <v-btn
                v-for="mode in Object.values(Constants.DIFFICULTY)"
                :key="mode.value"
                :value="mode.value"
                :color="getButtonColor(mode.value)"
              >
                {{ languageSpecificText(mode) }}
              </v-btn>
            </v-btn-toggle>
            <info-tooltip
              :text="tooltips.difficulty[selectedLanguage]"
              id="home-difficulty-tooltip"
              color="rgba(50, 50, 50, 0.7)"
            />
          </div>

          <v-divider class="my-2"></v-divider>

          <v-btn
            @click="startGame"
            :disabled="loadingStore.isLoading || searchText.trim() === ''"
            :loading="loadingStore.isLoading"
            class="w-50"
            color="primary"
            rounded
            size="x-large"
          >
            {{ text.play[selectedLanguage] }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
@import '@/assets/main.css';

.controls-col {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.control-panel {
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>