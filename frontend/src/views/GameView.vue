<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import WordList from '@/components/WordList.vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useRouter } from 'vue-router'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { useDialogStore } from '@/stores/dialogStore.js'
import MainCard from '@/components/MainCard.vue'
import { calculateWordItemWidth } from '../../../shared/Utils.js'
import {useLanguageStore} from "@/stores/languageStore.js";

const boardRef = ref(null)

const gameStore = useGameStore()
const router = useRouter()

const dialogStore = useDialogStore()

const text = {
  gameOverTitle: {
    et: 'Kõik sõnad leitud!',
    en: 'All words found!',
  },
  gameOverSubtitle: {
    et: 'Oled sõnarägastiku lahendanud',
    en: 'You’ve completed the word search',
  },
  print: {
    et: 'Prindi mäng',
    en: 'Print puzzle',
  }
}

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const victory_audio = new Audio(
  new URL('@/assets/sounds/victory.wav', import.meta.url).href,
)

const goHome = () => {
  router.push({ path: ENDPOINTS.home.relative })
}

const print = () => {
  window.open(`${ENDPOINTS.printer.relative}/${gameStore.id}`, '_blank') // Open print page in a new tab
}

const handleSelect = async selectedWord => {
  let success = gameStore.selectWord(selectedWord)
  boardRef.value.resetSelection(success)

  if (gameStore.gameEnded) {
    victory_audio.play()
    dialogStore.showDialog(
      text.gameOverTitle[selectedLanguage.value],
      text.gameOverSubtitle[selectedLanguage.value],
      () => goHome(),
      () => {},
    )
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

const mainContainer = ref(null)
const availableWidth = ref(1200)

const hintMode = computed(() => {
  const words = gameStore.getWords
  return !!words.find(
    item => item.hint.toUpperCase() !== item.word.toUpperCase(),
  )
})

const gridRowCount = computed(() => {
  if (gameStore.getGrid && gameStore.getGrid.length > 0)
    return gameStore.getGrid.length

  return 0
})

const gridColumnCount = computed(() => {
  if (
    gameStore.getGrid &&
    gameStore.getGrid.length > 0 &&
    gameStore.getGrid[0] &&
    gameStore.getGrid[0].length > 0
  )
    return gameStore.getGrid[0].length

  return 0
})

const gridCellSize = ref(40)
const resizeTimeout = ref(null)

const updateGridCellSize = () => {
  const steps = [40, 30, 20]

  cancelAnimationFrame(resizeTimeout.value)

  resizeTimeout.value = requestAnimationFrame(() => {
    for (const size of steps) {
      const newGridWidth = gridColumnCount.value * size
      if (newGridWidth + 48 <= availableWidth.value) {
        if (gridRowCount.value > 25 && size === 40) continue
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
  return gridColumnCount.value * gridCellSize.value
})

const gridHeight = computed(() => {
  return gridRowCount.value * gridCellSize.value
})

const estimateWordItemHeight = 40

const maxItemWidth = 1000

const estimatedWordItemWidth = computed(() => {
  return calculateWordItemWidth(gameStore.getWords, hintMode.value)
})

const totalWords = computed(() => {
  return gameStore.getWords.length
})

const preferredColumnCount = computed(() => {
  return Math.ceil(
    (totalWords.value * estimateWordItemHeight) / gridHeight.value,
  )
})

const preferredWordListWidth = computed(() => {
  return preferredColumnCount.value * estimatedWordItemWidth.value + 24 // add 24 because of word-list left padding
})

const minimumWordListWidth = computed(() => {
  // calculate minimum width needed for the word-list (all words in one column)
  return Math.min(500, estimatedWordItemWidth.value + 24)
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

  const adjustedTargetWordItemWidth = Math.min(maxItemWidth, estimatedWordItemWidth.value);

  if (widthAvailableForWordlist.value < adjustedTargetWordItemWidth + 24) {
    return widthAvailableForWordlist.value - 24
  }

  return adjustedTargetWordItemWidth
})

const wordListWidth = computed(() => {
  if (stackedLayout.value) {
    if (window.innerWidth < 960) {
      return availableWidth.value - 48
    }

    if (estimatedWordItemWidth.value > gridWidth.value) {
      return realWordItemWidth.value
    }

    return gridWidth.value
  }

  return (
    columnCount.value * realWordItemWidth.value +
    24
  )
})

const cardWidth = computed(() => {
  if (stackedLayout.value) {
    return Math.min(
      availableWidth.value,
      Math.max(gridWidth.value, wordListWidth.value) + 48,
    )
  }

  // add 48 because of card padding
  return gridWidth.value + wordListWidth.value + 48
})

onMounted(() => {
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

  gameStore.startGame()
})
</script>

<template>
  <v-container
    class="d-flex justify-center pa-0 ma-0 mt-16"
    :class="{ 'py-4': $vuetify.display.mdAndUp }"
    ref="mainContainer"
    fluid
  >
    <main-card :width="cardWidth">
      <v-card-title
        :class="{ 'justify-center': $vuetify.display.mdAndUp }"
        class="text-h5 font-weight-bold d-flex align-center position-relative"
      >
        {{ gameStore.title }}
        <template v-if="$vuetify.display.smAndDown">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                class="print-button"
                color="primary"
                @click="print"
              >
                <v-icon>mdi-printer</v-icon>
              </v-btn>
            </template>
            <span>{{ text.print[selectedLanguage] }}</span>
          </v-tooltip>
        </template>
        <template v-else>
          <v-btn @click="print" color="primary" rounded class="print-button">
            <v-icon class="mr-2">mdi-printer</v-icon>
            {{ text.print[selectedLanguage] }}
          </v-btn>
        </template>
      </v-card-title>

      <v-divider class="mb-6" />

      <v-row
        no-gutters
        :class="stackedLayout ? 'stacked-layout' : 'side-by-side-layout'"
      >
        <v-col
          :cols="stackedLayout ? 12 : undefined"
          :style="!stackedLayout ? { width: gridWidth + 'px' } : undefined"
        >
          <div class="d-flex justify-center align-center pa-0 ma-0">
            <GameBoard
              mode="game"
              @select="handleSelect"
              ref="boardRef"
              :cell-size="gridCellSize"
              :width="gridWidth"
              :height="gridHeight"
            />
          </div>
        </v-col>
        <v-col
          :cols="stackedLayout ? 12 : undefined"
          :style="!stackedLayout ? { width: wordListWidth + 'px' } : undefined"
          class="pa-0 ma-0"
        >
          <WordList
            mode="game"
            :hintMode="estimatedWordItemWidth > 1000"
            :column-count="columnCount"
            :column-size="columnSize"
            :stacked-layout="stackedLayout"
            :word-item-width="realWordItemWidth"
            :width="wordListWidth"
          />
        </v-col>
      </v-row>
    </main-card>
  </v-container>
</template>

<style scoped>
.print-button {
  position: absolute;
  right: 0;
}
</style>
