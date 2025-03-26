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

const creatorStore = useCreatorStore()
const loadingStore = useLoadingStore()

const boardRef = ref(null)
const id = ref(null)
const linkCopied = ref(false)
const gameSaved = ref(false)
const generated = ref(false)

const link = computed(() => `${ENDPOINTS.game.full}/${id.value}`)
const userIsTyping = ref(false)
const titleSetByUser = ref(false)

onMounted(() => {
  creatorStore.clearData()
})

const handleInput = () => {
  if (userIsTyping.value) {
    titleSetByUser.value = true
  }
}

const generateWords = async () => {
  try {
    const words = await apiRequest(ENDPOINTS.createWordList.full, 'POST', {
      width: creatorStore.widthInput,
      height: creatorStore.heightInput,
      topic: creatorStore.topic,
      inputLanguage: creatorStore.inputLanguage,
      outputLanguage: creatorStore.outputLanguage,
      mode: creatorStore.mode,
      spacesAllowed: creatorStore.spacesAllowed,
    })

    words.forEach(word => creatorStore.addWord(word, false))
    if (!creatorStore.title || !titleSetByUser.value) {
      creatorStore.setTitle(creatorStore.topic)
    }
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const generate = async () => {
  try {
    const response = await apiRequest(ENDPOINTS.createCustomGame.full, 'POST', {
      width: creatorStore.widthInput,
      height: creatorStore.heightInput,
      overlap: creatorStore.overlap,
      backwardsEnabled: creatorStore.backwardsEnabled,
      diagonalsEnabled: creatorStore.diagonalsEnabled,
      casing: creatorStore.casing,
      language: creatorStore.outputLanguage,
      words: creatorStore.getWords.map(word => word.word),
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
      wordListCasing: creatorStore.wordListCasing,
    })

    id.value = response.id
    gameSaved.value = true
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const copyTooltip = ref(false)
const copyTooltipText = ref("Kopeeri")

const copyLink = () => {
  if (!link.value) return
  navigator.clipboard.writeText(link.value).then(() => {
    linkCopied.value = true
    copyTooltipText.value = "Link kopeeritud"
    copyTooltip.value = true

    setTimeout(() => {
      linkCopied.value = false
      copyTooltipText.value = "Kopeeri"
      copyTooltip.value = false
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
  <v-main class="pa-4">
    <div class="container">
      <div class="settings-panel">

        <v-text-field
            label="Pealkiri"
            v-model="creatorStore.title"
            @input="handleInput"
            @focus="userIsTyping = true"
            @blur="userIsTyping = false"
            ref="titleInput"
            class="title-input mx-auto mt-4"
            rounded
            variant="solo"
        />

        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <h3 class="font-weight-bold">Sõnarägastiku sätted</h3>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <BoardSettings />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title><h3 class="font-weight-bold">Sõnade sätted</h3></v-expansion-panel-title>
            <v-expansion-panel-text>
              <WordSettings @generate-words="generateWords" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

      </div>

      <div class="game-container">
        <div class="gameboard-wrapper">
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

      <div class="buttons">
        <v-btn
          @click="generate"
          :disabled="loadingStore.isLoading"
          color="primary"
          class="mr-2"
          rounded
        >
          Genereeri
        </v-btn>

        <v-btn
          @click="share"
          :disabled="!generated || gameSaved || loadingStore.isLoading"
          color="secondary"
          class="mr-2"
          rounded
        >
          <v-icon left>mdi-share-variant</v-icon>
          Jaga
        </v-btn>

        <v-btn
          @click="print"
          :disabled="!generated || loadingStore.isLoading"
          color="success"
          rounded
        >
          <v-icon left>mdi-printer</v-icon>
          Prindi
        </v-btn>
      </div>

      <template v-if="id">
        <div class="share-container mt-4">
          <v-text-field
              readonly
              :value="link"
              class="share-link"
              rounded
              variant="solo"
              hide-details
          />

          <v-tooltip :model-value="copyTooltip" location="top">
            <template #activator="{ props }">
              <v-btn icon v-bind="props" @click="copyLink" class="copy-button">
                <v-icon v-if="linkCopied">mdi-check</v-icon>
                <v-icon v-else>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>{{ copyTooltipText }}</span>
          </v-tooltip>
        </div>
      </template>
    </div>
  </v-main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.settings-panel {
  width: 80%;
  max-width: 900px;
  margin-bottom: 20px;
}


.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

@media (min-width: 1024px) {
  .game-container {
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
  }
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.share-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
}

.share-link {
  flex-grow: 1;
  max-width: 500px;
  min-width: 200px;
}

.copy-button {
  margin-left: 10px;
}

.highlight-toggle {
  align-self: flex-start;
  margin-left: 0;
}
</style>
