<script setup>
import BoardSettings from '@/components/BoardSettings.vue'
import WordSettings from '@/components/WordSettings.vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useCreatorStore } from '@/stores/creatorStore.js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { apiRequest } from '@/api.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useLoadingStore } from '@/stores/loadingStore.js'
import CreatorWordList from '@/components/CreatorWordList.vue'
import InfoTooltip from '@/components/InfoTooltip.vue'
import MainCard from '@/components/MainCard.vue'
import { calculateWordItemWidth } from '../../../shared/Utils.js'
import { Constants } from '../../../shared/Constants.js'
import { useLanguageStore } from '@/stores/languageStore.js'

const tooltips = {
  words: {
    et: `
Kui valisid eelnevalt sõnade automaatse genereerimise sisendteema põhjal, siis ei pea siia sõnu lisama.<br>
Kuid kõik käsitsi lisatud sõnad lisatakse siiski sõnarägastikku automaatselt genereeritud sõnadele lisaks.<br>
Kui automaatset genereerimist ei valitud, siis tuleb siia lisada kõik sõnad, mida soovid sõnarägastikus peita.
`,
    en: `
If you chose to automatically generate a word list based on the input topic, you don’t need to add any words here.<br>
However, any words you do add manually will also be hidden in the puzzle alongside the generated ones.<br>
If you didn’t enable automatic word list generation, you must add all the words you want hidden in the puzzle here.
`,
  },
}

const text = {
  copy: {
    et: 'Kopeeri',
    en: 'Copy',
  },
  copied: {
    et: 'Link on kopeeritud',
    en: 'Link copied',
  },
  share: {
    et: 'Jaga',
    en: 'Share',
  },
  close: {
    et: 'Sulge',
    en: 'Close',
  },
  customPuzzle: {
    et: 'Loo oma sõnarägastik',
    en: 'Word-search creator',
  },
  title: {
    et: 'Pealkiri',
    en: 'Title',
  },
  boardSettings: {
    et: 'Sõnarägastiku seaded',
    en: 'Puzzle settings',
  },
  wordSettings: {
    et: 'Sõnade seaded',
    en: 'Word settings',
  },
  words: {
    et: 'Sõnad',
    en: 'Words',
  },
  removeAllWords: {
    et: 'Eemalda kõik sõnad',
    en: 'Remove all words',
  },
  generate: {
    et: 'Genereeri sõnarägastik',
    en: 'Generate word search',
  },
  toggleHighlights: {
    et: 'Kuva peidetud sõnu',
    en: 'Show hidden words',
  },
  regenerate: {
    et: 'Genereeri uuesti',
    en: 'Regenerate',
  },
  print: {
    et: 'Prindi',
    en: 'Print',
  },
}

const creatorStore = useCreatorStore()
const loadingStore = useLoadingStore()

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const boardRef = ref(null)
const id = ref(null)
const linkCopied = ref(false)
const gameSaved = ref(false)
const generated = ref(false)

const shareDialog = ref(false)

const link = computed(() => `${ENDPOINTS.game.full}/${id.value}`)

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
      words: creatorStore.getCustomWords,
      topic: creatorStore.generateWordList ? creatorStore.topic : null,
      inputLanguage: creatorStore.inputLanguage,
      outputLanguage: creatorStore.outputLanguage,
      nonAlphaAllowed: creatorStore.nonAlphaAllowed,
      mode: creatorStore.mode,
      title: creatorStore.title,
      alphabetize: creatorStore.alphabetize,
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
    if (gameSaved.value) {
      shareDialog.value = true
      return
    }

    const response = await apiRequest(ENDPOINTS.persistGame.full, 'POST', {
      grid: creatorStore.getGrid,
      words: creatorStore.getWords,
      title: creatorStore.title,
      answers: creatorStore.answers,
      difficulty: creatorStore.diagonalsEnabled
        ? Constants.DIFFICULTY.MEDIUM.value
        : Constants.DIFFICULTY.EASY.value,
    })

    id.value = response.id
    gameSaved.value = true
    shareDialog.value = true
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* empty */
  }
}

const copyTooltipText = ref(text.copy[selectedLanguage.value])

const copyLink = () => {
  if (!link.value) return
  navigator.clipboard.writeText(link.value).then(() => {
    linkCopied.value = true
    copyTooltipText.value = text.copied[selectedLanguage.value]

    setTimeout(() => {
      linkCopied.value = false
      copyTooltipText.value = text.copy[selectedLanguage.value]
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
        difficulty: creatorStore.diagonalsEnabled
          ? Constants.DIFFICULTY.MEDIUM.value
          : Constants.DIFFICULTY.EASY.value,
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

const scrollbarWidth = ref(0)

const measureScrollbarWidth = () => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.visibility = 'hidden'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  document.body.appendChild(scrollDiv)

  const inner = document.createElement('div')
  inner.style.width = '100%'
  scrollDiv.appendChild(inner)

  scrollbarWidth.value = scrollDiv.offsetWidth - inner.offsetWidth

  document.body.removeChild(scrollDiv)
}

const removeAllWords = () => {
  creatorStore.removeAllWords()
}

const mainContainer = ref(null)
const availableWidth = ref(1200)

const hintMode = computed(() => {
  const words = creatorStore.getWords
  return !!words.find(
    item => item.hint.toUpperCase() !== item.word.toUpperCase(),
  )
})

const gridCellSize = ref(40)
const resizeTimeout = ref(null)

const updateGridCellSize = () => {
  const steps = [40, 30, 20]

  cancelAnimationFrame(resizeTimeout.value)

  resizeTimeout.value = requestAnimationFrame(() => {
    for (const size of steps) {
      const newGridWidth = creatorStore.width * size
      if (newGridWidth + 48 <= availableWidth.value) {
        if (creatorStore.height > 25 && size === 40) continue
        if (gridCellSize.value !== size) {
          gridCellSize.value = size
        }
        return
      }
    }
    if (gridCellSize.value !== 20) {
      gridCellSize.value = 20
    }
  })
}

const gridWidth = computed(() => {
  return creatorStore.width * gridCellSize.value
})

const gridHeight = computed(() => {
  return creatorStore.height * gridCellSize.value
})

const estimateWordItemHeight = 40

const maxItemWidth = 1000

const estimatedWordItemWidth = computed(() => {
  return calculateWordItemWidth(creatorStore.getWords, hintMode.value)
})

const totalWords = computed(() => {
  return creatorStore.getWords.length
})

const preferredColumnCount = computed(() => {
  return Math.ceil(
    (totalWords.value * estimateWordItemHeight) / gridHeight.value,
  )
})

const preferredWordListWidth = computed(() => {
  return preferredColumnCount.value * estimatedWordItemWidth.value + 24 // add 24 because of word-list left margin
})

const minimumWordListWidth = computed(() => {
  // calculate minimum width needed for the word-list (all words in one column)
  return Math.min(500, estimatedWordItemWidth.value) + 24
})

const widthAvailableForWordlist = computed(() => {
  return availableWidth.value - gridWidth.value - 48 // 48px card padding
})

const stackedLayout = computed(() => {
  return minimumWordListWidth.value > widthAvailableForWordlist.value
})

const columnCount = computed(() => {
  if (stackedLayout.value) {
    if (window.innerWidth < 960) {
      return Math.max(
        1,
        Math.min(
          totalWords.value,
          Math.floor(
            (availableWidth.value - 48) / estimatedWordItemWidth.value,
          ),
        ),
      )
    }

    return Math.max(
      1,
      Math.min(
        totalWords.value,
        Math.floor(gridWidth.value / estimatedWordItemWidth.value),
      ),
    )
  }

  if (preferredWordListWidth.value <= widthAvailableForWordlist.value) {
    // preferred layout can be used
    return preferredColumnCount.value
  }

  // fit as many columns as we can
  return Math.max(
    1,
    Math.min(
      totalWords.value,
      Math.floor(
        (widthAvailableForWordlist.value - 24) /
          Math.min(maxItemWidth, estimatedWordItemWidth.value),
      ),
    ),
  )
})

const columnSize = computed(() => {
  return Math.ceil(totalWords.value / columnCount.value)
})

const realWordItemWidth = computed(() => {
  if (stackedLayout.value) {
    if (estimatedWordItemWidth.value > gridWidth.value) {
      return Math.min(availableWidth.value - 48, estimatedWordItemWidth.value)
    }

    return Math.min(maxItemWidth, estimatedWordItemWidth.value)
  }

  if (preferredWordListWidth.value <= widthAvailableForWordlist.value) {
    return estimatedWordItemWidth.value
  }

  const adjustedTargetWordItemWidth = Math.min(
    maxItemWidth,
    estimatedWordItemWidth.value,
  )

  if (widthAvailableForWordlist.value < adjustedTargetWordItemWidth + 24) {
    return widthAvailableForWordlist.value - 24
  }

  return adjustedTargetWordItemWidth
})

const wordListWidth = computed(() => {
  if (stackedLayout.value) {
    if (window.innerWidth < 960) {
      return availableWidth.value
    }

    if (estimatedWordItemWidth.value > gridWidth.value) {
      return realWordItemWidth.value
    }

    return gridWidth.value
  }

  return columnCount.value * realWordItemWidth.value + 24
})

const cardWidth = computed(() => {
  if (stackedLayout.value) {
    return Math.min(
      availableWidth.value,
      Math.max(
        window.innerWidth > 600 ? 550 : 400,
        Math.max(gridWidth.value, wordListWidth.value),
      ) + 48,
    )
  }

  // add 48 because of card padding
  return (
    Math.max(
      window.innerWidth > 600 ? 550 : 400,
      gridWidth.value + wordListWidth.value,
    ) + 48
  )
})

onMounted(() => {
  creatorStore.clearData()

  measureScrollbarWidth()

  const el = mainContainer.value?.$el
  if (el instanceof HTMLElement) {
    availableWidth.value = Math.min(
      window.innerWidth - scrollbarWidth.value,
      el.clientWidth,
    )

    const resizeObserver = new ResizeObserver(() => {
      availableWidth.value = Math.min(
        window.innerWidth - scrollbarWidth.value,
        el.clientWidth,
      )
      updateGridCellSize()
    })

    resizeObserver.observe(el)

    onBeforeUnmount(() => {
      resizeObserver.disconnect()
    })
  }
})
</script>

<template>
  <v-dialog v-model="shareDialog" max-width="700">
    <v-card class="py-4 px-2">
      <v-card-title class="text-h5">{{
        text.share[selectedLanguage]
      }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="link"
          readonly
          rounded
          variant="outlined"
          @click:append-inner="copyLink"
        >
          <template #append-inner>
            <v-tooltip top>
              <template #activator="{ props }">
                <v-icon v-bind="props" @click="copyLink" v-if="!linkCopied"
                  >mdi-content-copy</v-icon
                >
                <v-icon v-bind="props" @click="copyLink" v-else
                  >mdi-check</v-icon
                >
              </template>
              <span>{{ copyTooltipText }}</span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="shareDialog = false"
          rounded
          variant="flat"
          class="px-4"
          >{{ text.close[selectedLanguage] }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-container
    :class="{
      'd-flex': generated,
      'align-center': generated,
      'justify-center': generated,
      'pa-0': generated,
      'ma-0': generated,
      'py-4': $vuetify.display.mdAndUp,
    }"
    class="mt-16"
    ref="mainContainer"
    :fluid="generated"
  >
    <main-card :width="generated ? cardWidth : undefined">
      <v-card-title class="title-bar">
        <template v-if="!generated">
          <div class="title-text">
            {{ text.customPuzzle[selectedLanguage] }}
          </div>
        </template>
        <template v-else>
          <v-btn
            icon
            size="large"
            variant="text"
            class="back-button"
            @click="generated = false"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div class="title-text">{{ creatorStore.title }}</div>
        </template>
      </v-card-title>

      <v-divider class="my-4" />

      <template v-if="!generated">
        <!-- Step 1: Title -->
        <div class="font-weight-bold py-4 text-h6">
          1. {{ text.title[selectedLanguage] }}
        </div>
        <v-text-field
          :placeholder="text.title[selectedLanguage]"
          v-model="creatorStore.title"
          variant="outlined"
          class="mt-2 mb-4"
          required
          rounded
        />

        <v-divider class="my-4" />

        <!-- Step 2: Board Settings -->
        <div class="font-weight-bold py-4 text-h6">
          2. {{ text.boardSettings[selectedLanguage] }}
        </div>
        <BoardSettings class="mb-4" />

        <v-divider class="my-4" />

        <!-- Step 3: Word Settings -->
        <div class="font-weight-bold py-4 text-h6">
          3. {{ text.wordSettings[selectedLanguage] }}
        </div>
        <WordSettings class="mb-4" />

        <v-divider class="my-4" />

        <!-- Step 4: Word List -->
        <div class="title-container py-4">
          <div class="font-weight-bold py-4 text-h6">
            4. {{ text.words[selectedLanguage] }}
            <info-tooltip
              :text="tooltips.words[selectedLanguage]"
              id="words-tooltip"
            />
          </div>

          <template v-if="$vuetify.display.smAndUp">
            <v-btn
              @click="removeAllWords"
              color="red"
              rounded
              :disabled="
                !creatorStore.getWords || creatorStore.getWords.length === 0
              "
            >
              {{ text.removeAllWords[selectedLanguage] }}
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              @click="removeAllWords"
              color="red"
              variant="outlined"
              icon
              :disabled="
                !creatorStore.getWords || creatorStore.getWords.length === 0
              "
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </div>
        <CreatorWordList class="mb-4" />

        <v-divider class="my-4" />

        <!-- Generate Button -->
        <v-btn
          @click="generate"
          color="primary"
          rounded
          class="generate-button"
          :disabled="loadingStore.isLoading"
          :loading="loadingStore.isLoading"
        >
          {{ text.generate[selectedLanguage] }}
        </v-btn>
      </template>

      <template v-else>
        <!-- Word Search Grid -->

        <v-row
          no-gutters
          :class="stackedLayout ? 'stacked-layout' : 'side-by-side-layout'"
        >
          <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="!stackedLayout ? { width: gridWidth + 'px' } : undefined"
          >
            <div class="grid-wrapper">
              <GameBoard
                mode="create"
                ref="boardRef"
                :cell-size="gridCellSize"
                :width="gridWidth"
                :height="gridHeight"
              />

              <v-switch
                :label="text.toggleHighlights[selectedLanguage]"
                v-model="creatorStore.highlight"
                @change="boardRef.toggleHighlights()"
                class="highlight-toggle"
              />
            </div>
          </v-col>
          <v-col
            :cols="stackedLayout ? 12 : undefined"
            :style="
              !stackedLayout ? { width: wordListWidth + 'px' } : undefined
            "
            class="pa-0 ma-0"
          >
            <WordList
              mode="create"
              :hintMode="estimatedWordItemWidth > 1000"
              :column-count="columnCount"
              :column-size="columnSize"
              :stacked-layout="stackedLayout"
              :word-item-width="realWordItemWidth"
              :width="wordListWidth"
            />
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Action Buttons -->
        <div class="button-container">
          <v-btn
            @click="generate"
            color="primary"
            rounded
            :disabled="loadingStore.isLoading"
            :loading="loadingStore.isLoading"
            :class="{
              'mr-16': $vuetify.display.mdAndUp,
              'mr-8': $vuetify.display.sm,
              'mr-4': $vuetify.display.xs,
            }"
          >
            {{ text.regenerate[selectedLanguage] }}
          </v-btn>

          <template v-if="$vuetify.display.smAndUp">
            <v-btn
              @click="print"
              color="primary"
              rounded
              variant="outlined"
              :disabled="loadingStore.isLoading"
            >
              <v-icon class="mr-2">mdi-printer</v-icon>
              {{ text.print[selectedLanguage] }}
            </v-btn>

            <v-btn
              @click="share"
              color="primary"
              rounded
              variant="outlined"
              :disabled="loadingStore.isLoading"
            >
              <v-icon class="mr-2">mdi-share</v-icon>
              {{ text.share[selectedLanguage] }}
            </v-btn>
          </template>
          <template v-else>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="outlined"
                  color="primary"
                  @click="print"
                  :disabled="loadingStore.isLoading"
                >
                  <v-icon>mdi-printer</v-icon>
                </v-btn>
              </template>
              <span>{{ text.print[selectedLanguage] }}</span>
            </v-tooltip>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="outlined"
                  color="primary"
                  @click="share"
                  :disabled="loadingStore.isLoading"
                >
                  <v-icon>mdi-share</v-icon>
                </v-btn>
              </template>
              <span>{{ text.share[selectedLanguage] }}</span>
            </v-tooltip>
          </template>
        </div>
      </template>
    </main-card>
  </v-container>
</template>

<style scoped>
.grid-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.highlight-toggle {
  align-self: flex-start;
  margin-left: 0;
}

.generate-button {
  max-width: 300px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-wrap: wrap;
  min-height: 56px;
  text-align: center;
  padding: 0 32px; /* leaves room for back button */
}

.back-button {
  position: absolute;
  left: 0;
}

.title-text {
  flex: 1 1 auto;
  max-width: 100%;
  font-weight: bold;
  font-size: 1.25rem; /* matches text-h5 */
  text-align: center;
  word-break: break-word;
  padding: 0 16px;
}
</style>
