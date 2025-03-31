<script setup>
import BoardSettings from '@/components/BoardSettings.vue'
import WordSettings from '@/components/WordSettings.vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useCreatorStore } from '@/stores/creatorStore.js'
import { ref, computed, onMounted } from 'vue'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import CreatorWordList from "@/components/CreatorWordList.vue";

const creatorStore = useCreatorStore()
const loadingStore = useLoadingStore()

const boardRef = ref(null)
const id = ref(null)
const linkCopied = ref(false)
const gameSaved = ref(false)
const generated = ref(false)

const shareDialog = ref(false)

const link = computed(() => `${ENDPOINTS.game.full}/${id.value}`)

onMounted(() => {
  creatorStore.clearData()
})

const generate = async () => {
  try {
    const response = await apiRequest(ENDPOINTS.createCustomGame.full, 'POST', {
      width: creatorStore.width,
      height: creatorStore.height,
      overlap: creatorStore.overlap,
      backwardsEnabled: creatorStore.backwardsEnabled,
      diagonalsEnabled: creatorStore.diagonalsEnabled,
      casing: creatorStore.casing,
      wordListCasing: creatorStore.wordListCasing,
      words: creatorStore.getWords,
      topic: creatorStore.generateWordList ? creatorStore.topic : null,
      inputLanguage: creatorStore.inputLanguage,
      outputLanguage: creatorStore.outputLanguage,
      nonAlphaAllowed: creatorStore.nonAlphaAllowed,
      mode: creatorStore.mode,
      title: creatorStore.title,
    })

    const highlightsToggled = creatorStore.highlight
    if (highlightsToggled) {
      creatorStore.highlight = false
      boardRef.value.toggleHighlights()
    }
    creatorStore.generateGrid(response)
    if (highlightsToggled) {
      creatorStore.highlight = true
      boardRef.value.toggleHighlights()
    }
    generated.value = true
    linkCopied.value = false
    gameSaved.value = false
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const share = async () => {
  try {
    const response = await apiRequest(ENDPOINTS.persistGame.full, 'POST', {
      grid: creatorStore.getGrid,
      words: creatorStore.getWords,
      title: creatorStore.title,
      answers: creatorStore.answers,
    })

    id.value = response.id
    gameSaved.value = true
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const copyTooltipText = ref("Kopeeri")

const copyLink = () => {
  if (!link.value) return
  navigator.clipboard.writeText(link.value).then(() => {
    linkCopied.value = true
    copyTooltipText.value = "Link kopeeritud"

    setTimeout(() => {
      linkCopied.value = false
      copyTooltipText.value = "Kopeeri"
    }, 2000)
  })
}

const print = async () => {
  if (gameSaved.value) {
    window.open(
      `${ENDPOINTS.printer.relative}/${id.value}?showAnswers=1`,
      '_blank',
    ) // Open print page in a new tab
  } else {
    try {
      const response = await apiRequest(ENDPOINTS.saveGame.full, 'POST', {
        grid: creatorStore.getGrid,
        words: creatorStore.getWords,
        title: creatorStore.title,
        answers: creatorStore.answers,
        wordListCasing: creatorStore.wordListCasing,
      })

      id.value = response.id
      window.open(
        `${ENDPOINTS.printer.relative}/${id.value}?showAnswers=1`,
        '_blank',
      ) // Open print page in a new tab
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      /* empty */
    }
  }
}

const removeAllWords = () => {

  creatorStore.removeAllWords()
}

const gridCellSize = computed(() => {
  return 40
})

const gridWidth = computed(() => {
  return creatorStore.width * gridCellSize.value
})

const gridHeight = computed(() => {
  return creatorStore.height * gridCellSize.value
})
</script>

<template>

  <div class="background-wrapper">
    <div class="background-images">
      <div class="background-image"></div>
      <div class="background-image"></div>
    </div>
    <div class="background-overlay"></div>
  </div>

  <v-main class="pa-4">

    <v-container>
      <v-card class="px-6 py-8 mt-12 rounded-lg">
        <v-card-title class="text-h5 font-weight-bold">
          Loo oma sõnarägastik
        </v-card-title>

        <v-divider class="my-4" />

        <template v-if="!generated">

          <!-- Step 1: Title -->
          <div class="font-weight-bold py-4 text-h6">1. Pealkiri</div>
          <v-text-field
              placeholder="Pealkiri"
              v-model="creatorStore.title"
              variant="outlined"
              class="mt-2 mb-4"
              required
              rounded
          />

          <v-divider class="my-4" />

          <!-- Step 2: Board Settings -->
          <div class="font-weight-bold py-4 text-h6">2. Sõnarägastiku sätted</div>
          <BoardSettings class="mb-4" />

          <v-divider class="my-4" />

          <!-- Step 3: Word Settings -->
          <div class="font-weight-bold py-4 text-h6">3. Sõnade sätted</div>
          <WordSettings class="mb-4" />

          <v-divider class="my-4" />

          <!-- Step 4: Word List -->
          <div class="title-container py-4">
            <div class="font-weight-bold py-4 text-h6">
              4. Sõnad
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="30">mdi-information-outline</v-icon>
                </template>
                Kui valisid eelnevalt sisendteema põhjal sõnade nimekirja genereerimise, siis ei pea siia ühtegi sõna lisama,<br>
                kuid kõik lisatud sõnad peidetakse siiski lisaks automaatselt genereeritud sõnadele ka sõnarägastikku.<br>
                Kui sa ei valinud sisendteema põhjal sõnade nimekirja genereerimist, siis peab siia lisama kõik sõnad,<br>
                mida sa soovid sõnarägastikku peita.

              </v-tooltip>
            </div>

            <v-btn @click="removeAllWords" color="red" rounded :disabled="!creatorStore.getWords || creatorStore.getWords.length === 0">
              Eemalda kõik sõnad
            </v-btn>
          </div>
          <CreatorWordList class="mb-4" />

          <v-divider class="my-4" />

          <!-- Generate Button -->
          <v-btn @click="generate" color="primary" rounded class="generate-button">
            Genereeri sõnarägastik
          </v-btn>

        </template>

        <template v-else>
          <!-- Word Search Grid -->
          <div class="grid-container">
            <div class="grid-wrapper">
              <GameBoard
                  mode="create"
                  ref="boardRef"
                  :cell-size="gridCellSize"
                  :width="gridWidth"
                  :height="gridHeight"
              />

              <v-switch
                  label="Kuva peidetud sõnad"
                  v-model="creatorStore.highlight"
                  @change="boardRef.toggleHighlights()"
                  class="highlight-toggle"
              />
            </div>

            <WordList mode="create" />
          </div>

          <v-divider class="my-4" />

          <!-- Action Buttons -->
          <div class="button-container">
            <v-btn @click="generate" color="primary" rounded>
              Genereeri uuesti
            </v-btn>

            <v-btn @click="print" color="success" rounded>
              <v-icon left>mdi-printer</v-icon>
              Prindi
            </v-btn>

            <v-btn @click="copyLink" color="secondary" rounded>
              <v-icon left v-if="linkCopied">mdi-check</v-icon>
              <v-icon left v-else>mdi-content-copy</v-icon>
              Kopeeri link
            </v-btn>
          </div>
        </template>

      </v-card>
    </v-container>
  </v-main>
</template>

<style scoped>

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.grid-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.highlight-toggle {
  align-self: flex-start;
  margin-left: 0;
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
  display: flex;
  width: 400vw;
  height: 100vh;
}

.background-image {
  width: 200vw;
  height: 100vh;
  background: url('@/assets/solved_puzzle.png') repeat-x center;
  background-size: auto 100%;
  filter: blur(4px);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Light filter to soften contrast */
}

.generate-button {
  max-width: 300px;
  width: 100%; /* Ensures it doesn't shrink too much */
  margin: 0 auto; /* Centers it horizontally */
  display: flex; /* Ensures proper width behavior */
  justify-content: center; /* Centers text inside */
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
