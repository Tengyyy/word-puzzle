<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { Constants } from '../../../shared/Constants.js'
import { useAlertStore } from '@/stores/alertStore.js'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import logo from '@/assets/logo_large.svg'


const topic = ref(null)

const difficulty = ref(Constants.DIFFICULTY.MEDIUM.value)

const inputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)
const outputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value)

const mode = ref(Constants.MODE.WORDS.value)

const router = useRouter()
const gameStore = useGameStore()
const alertStore = useAlertStore()

const loadingStore = useLoadingStore()

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
  <div class="background-wrapper">
    <div class="background-images">
      <div class="background-image"></div>
      <div class="background-image"></div>
    </div>
    <div class="background-overlay"></div>
  </div>

  <v-main class="d-flex align-center justify-center">
    <v-container class="d-flex align-center justify-center" style="flex: 1;">
      <v-row class="w-100 d-flex align-center justify-center">
        <!-- Logo: Visible only on larger screens -->
        <v-col cols="12" md="6" class="d-none d-md-flex justify-center">
          <v-img :src="logo" max-width="500" contain />
        </v-col>

        <!-- Controls -->
        <v-col cols="12" md="6" class="d-flex flex-column align-center">

          <v-card class="control-panel px-4 py-16 d-flex controls-col background-light">
            <v-text-field
                label="Sõnarägastiku teema"
                v-model="topic"
                :disabled="loadingStore.isLoading"
                class="w-75"
                @keyup.enter="startGame"
                rounded
                variant="solo"
            />

            <v-select
                label="Sisendkeel"
                v-model="inputLanguage"
                :disabled="loadingStore.isLoading"
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
                :disabled="loadingStore.isLoading"
                :items="Object.values(Constants.LANGUAGE)"
                item-title="text"
                item-value="value"
                class="w-75"
                rounded
                variant="solo"
            />

            <!-- Difficulty Toggle -->
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

            <!-- Start Button -->
            <v-btn @click="startGame" :disabled="loadingStore.isLoading" class="w-50" color="primary" rounded size="x-large">
              Mängi
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
@import '@/assets/main.css';

.controls-col {
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  width: 100%; /* Ensure it takes full space */
}

.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
}

.background-images {
  display: flex; /* Arrange images side by side */
  width: 200vw; /* Two images side by side */
  height: 100vh;
  animation: pan-background 30s linear infinite;
}

.background-image {
  width: 100vw;
  height: 100vh;
  background: url('@/assets/solved_puzzle.png') repeat-x center;
  background-size: 200% 100%;
  filter: blur(3px);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Light filter to soften contrast */
}

@keyframes pan-background {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100vw);
  }
}

.control-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>