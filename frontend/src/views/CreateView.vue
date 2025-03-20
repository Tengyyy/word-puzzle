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
    if (!creatorStore.title || !titleSetByUser.value)
      creatorStore.title = creatorStore.topic
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
</script>

<template>
  <main>
    <BoardSettings />
    <WordSettings @generate-words="generateWords" />
    <label for="title-input">Pealkiri:</label><br />
    <input
      type="text"
      id="title-input"
      name="title-input"
      v-model="creatorStore.title"
      @input="handleInput"
      @focus="userIsTyping = true"
      @blur="userIsTyping = false"
      ref="titleInput"
      :disabled="loadingStore.isLoading"
    /><br /><br />
    <GameBoard mode="create" ref="boardRef" />
    <WordList mode="create" />
    <br /><br />
    <input
      type="checkbox"
      name="highlight-checkbox"
      id="highlight-checkbox"
      v-model="creatorStore.highlight"
      @change="boardRef.toggleHighlights()"
      :disabled="loadingStore.isLoading"
    />
    <label for="highlight-checkbox">Kuva peidetud sõnad</label>
    <button @click="generate" :disabled="loadingStore.isLoading">
      Genereeri
    </button>
    <button
      @click="share"
      :disabled="!generated || gameSaved || loadingStore.isLoading"
    >
      Jaga mängu
    </button>
    <template v-if="gameSaved">
      <input
        type="text"
        id="link-field"
        name="link-field"
        readonly
        :value="link"
        ref="linkFieldRef"
        :disabled="loadingStore.isLoading"
      />
      <button @click="copyLink" :disabled="loadingStore.isLoading">
        {{ linkCopied ? 'Kopeeritud' : 'Kopeeri' }}
      </button>
    </template>
    <button @click="print" :disabled="!generated || loadingStore.isLoading">
      Prindi mäng
    </button>
  </main>
</template>

<style scoped></style>
