<script setup>
import BoardSettings from '@/components/BoardSettings.vue'
import WordSettings from '@/components/WordSettings.vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useCreatorStore } from '@/stores/creatorStore.js'
import { useAlertStore } from '@/stores/alertStore.js'
import { ref, computed, onMounted } from 'vue'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'

const creatorStore = useCreatorStore()
const alertStore = useAlertStore()
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

const copyLink = () => {
  if (!link.value) {
    return
  }

  navigator.clipboard
    .writeText(link.value)
    .then(() => {
      linkCopied.value = true
    })
    .catch(err => {
      console.log('Lingi kopeerimine ebaõnnestus: ', err)
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
  return 40;
})

const gridWidth = computed(() => {
  return creatorStore.width * gridCellSize.value;
})

const gridHeight = computed(() => {
  return creatorStore.height * gridCellSize.value;
})

</script>

<template>
  <v-main>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>
          Sõnarägastiku sätted
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <BoardSettings />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>
          Sõnade sätted
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <WordSettings @generate-words="generateWords" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-text-field
      label="Pealkiri"
      v-model="creatorStore.title"
      @input="handleInput"
      @focus="userIsTyping = true"
      @blur="userIsTyping = false"
      ref="titleInput"
      :disabled="loadingStore.isLoading"
      class="mt-6"
    />

    <GameBoard mode="create" ref="boardRef" :cell-size="gridCellSize" :width="gridWidth" :height="gridHeight" />
    <WordList mode="create" />
    <v-switch
      label="Kuva peidetud sõnad"
      v-model="creatorStore.highlight"
      @change="boardRef.toggleHighlights()"
      :disabled="loadingStore.isLoading"
    />

    <v-btn @click="generate" :disabled="loadingStore.isLoading">
      Genereeri
    </v-btn>
    <v-btn
      @click="share"
      :disabled="!generated || gameSaved || loadingStore.isLoading"
    >
      Jaga mängu
    </v-btn>
    <template v-if="gameSaved">
      <v-text-field
        readonly
        :value="link"
      />
      <v-btn @click="copyLink">
        {{ linkCopied ? 'Kopeeritud' : 'Kopeeri' }}
      </v-btn>
    </template>
    <v-btn @click="print" :disabled="!generated || loadingStore.isLoading">
      Prindi mäng
    </v-btn>
  </v-main>
</template>

<style scoped></style>
