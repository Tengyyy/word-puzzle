<script setup>
import {computed, ref} from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { Constants } from '../../../shared/Constants.js'
import { useAlertStore } from '@/stores/alertStore.js'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import logo from '@/assets/logo_large.svg'

const difficulty = ref(Constants.DIFFICULTY.MEDIUM.value)

const inputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)
const outputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)

const mode = ref(Constants.MODE.WORDS.value)

const router = useRouter()
const gameStore = useGameStore()
const alertStore = useAlertStore()

const loadingStore = useLoadingStore()

const topic = ref('')
const searchText = ref('')
const suggestions = ref([])

const onSearch = (val) => {
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
    searchText.value.trim() === '' ? 'Sisesta teema' : 'Lemma puudub'
);

const startGame = async () => {
  if (!topic.value) {
    alertStore.showAlert('Palun sisesta sõnarägastiku teema', 'error')
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

const getButtonColor = (value) => {
  switch (value) {
    case Constants.DIFFICULTY.EASY.value:
      return 'green';
    case Constants.DIFFICULTY.MEDIUM.value:
      return 'yellow';
    case Constants.DIFFICULTY.HARD.value:
      return 'red';
    default:
      return 'gray';
  }
};

</script>
<template>
  <v-container class="d-flex align-center justify-center" style="flex: 1;">
    <v-row class="w-100 d-flex align-center justify-center">
      <!-- Logo: Visible only on larger screens -->
      <v-col cols="12" md="6" class="d-none d-md-flex justify-center">
        <v-img :src="logo" max-width="500" contain />
      </v-col>

      <v-col cols="12" md="6" class="d-flex flex-column align-center">

        <v-card class="control-panel px-4 py-16 d-flex controls-col background-light">

          <v-combobox
              label="Sõnarägastiku teema"
              v-model="topic"
              class="w-75"
              rounded
              variant="solo"
              @update:search="onSearch"
              :items="suggestions"
              auto-select-first
              :hide-no-data="false"
              :no-data-text="computedNoDataText"
          />

          <v-select
              label="Sisendkeel"
              v-model="inputLanguage"
              :items="Object.values(Constants.LANGUAGE)"
              item-title="text"
              item-value="value"
              class="w-75"
              rounded
              variant="solo"
          />

          <v-select
              label="Väljundkeel"
              v-model="outputLanguage"
              :items="Object.values(Constants.LANGUAGE)"
              item-title="text"
              item-value="value"
              class="w-75"
              rounded
              variant="solo"
          />

          <v-btn-toggle v-model="difficulty" divided rounded="xl" mandatory class="my-4" variant="elevated">
            <v-btn
                v-for="mode in Object.values(Constants.DIFFICULTY)"
                :key="mode.value"
                :value="mode.value"
                :color="getButtonColor(mode.value)"
            >
              {{ mode.text }}
            </v-btn>
          </v-btn-toggle>

          <v-divider class="my-2"></v-divider>

          <v-btn @click="startGame" :disabled="loadingStore.isLoading" :loading="loadingStore.isLoading" class="w-50" color="primary" rounded size="x-large">
            Mängi
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