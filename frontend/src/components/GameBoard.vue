<script setup>
import { ref, computed } from 'vue'
import { useCreatorStore } from '@/stores/creatorStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { usePrintStore } from '@/stores/printStore.js'
import { getRandomColor } from "../../../shared/Utils.js";

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['game', 'create'].includes(value),
  },
  printView: {
    type: Boolean,
    required: false,
    default: false,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  cellSize: {
    type: Number,
    required: false,
    default: 40,
  },
})

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
})

const DIRECTION = Object.freeze({
  EAST: 0,
  SOUTH_EAST: 45,
  SOUTH: 90,
  SOUTH_WEST: 135,
  WEST: 180,
  NORTH_WEST: 225,
  NORTH: 270,
  NORTH_EAST: 315,
})

let lastAngle = null

const OFFSETS = computed(() => ({
  E: { x: 0, y: 0 },
  SE: { x: props.cellSize / 2, y: -props.cellSize / 5 },
  S: { x: props.cellSize, y: 0 },
  SW: { x: props.cellSize + props.cellSize / 5, y: props.cellSize / 2 },
  W: { x: props.cellSize, y: props.cellSize },
  NW: { x: props.cellSize / 2, y: props.cellSize + props.cellSize / 5 },
  N: { x: 0, y: props.cellSize },
  NE: { x: -props.cellSize / 5, y: props.cellSize / 2 },
}))

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore()

const playable = computed(() => {
  return (
    props.mode === MODE.GAME &&
    !props.printView &&
    !store.gameEnded &&
    store.gameInProgress
  )
})

const emit = defineEmits({
  select: word => {
    return !!word
  },
})

const correct_audio = new Audio(
  new URL('@/assets/sounds/correct.wav', import.meta.url).href,
)
const wrong_audio = new Audio(
  new URL('@/assets/sounds/wrong.wav', import.meta.url).href,
)

const highlights = ref([]) // Highlighted words

const selectedCells = ref([])
const isDragging = ref(false)
const startCell = ref(null)
const activeDirection = ref(null)
const outlinePosition = ref({})
const lastColor = ref(null) // Store the last generated color to ensure sufficient difference

const toggleHighlights = () => {
  if (props.mode === MODE.GAME) {
    return
  }

  if (!props.printView && !store.highlight) {
    highlights.value = []
  } else {
    highlights.value = store.answers.map((pos, index) => {
      const direction = calculateDirection(
        pos.startRow,
        pos.startCol,
        pos.endRow,
        pos.endCol,
      )
      const cells = calculateCellsToHighlight(
        { row: pos.startRow, col: pos.startCol },
        {
          row: pos.endRow,
          col: pos.endCol,
        },
        direction,
      )

      const color = store.highlightColors[index];

      return {
        direction: direction,
        cells: cells,
        color: color,
      }
    })
  }
}

const computedHighlights = computed(() => {
  return highlights.value.map(highlight => {
    const color = highlight.color
    const outline = calculateOutline(highlight.cells, highlight.direction)
    return {
      ...outline,
      border: 'none',
      backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`,
      transition: 'none',
    }
  });
})

const outlineColor = ref(getRandomColor()) // Default color

// Resets/clears selection, if the selected word was in the word list, then the selection will be highlighted
const resetSelection = success => {

  if (success) {
    // Add highlight with the same color as the outline but without a border

    highlights.value.push({
      direction: activeDirection.value,
      cells: selectedCells.value,
      color: outlineColor.value,
    })

    lastColor.value = outlineColor.value
    store.setLastHighlightColor(outlineColor.value)

    outlineColor.value = getRandomColor(lastColor.value) // Set a new random color

    if (!store.gameEnded) {
      correct_audio.play()
    }
  } else {
    wrong_audio.play()
  }

  selectedCells.value = []
  outlinePosition.value = {}
}

defineExpose({ resetSelection, toggleHighlights })

// Calculate the direction based on the start and current position
const calculateDirection = (startRow, startCol, currentRow, currentCol) => {
  if (startRow === currentRow) {
    if (startCol < currentCol) {
      return DIRECTION.EAST
    } else if (startCol > currentCol) {
      return DIRECTION.WEST
    } else {
      return null
    }
  }
  if (startCol === currentCol) {
    if (startRow < currentRow) {
      return DIRECTION.SOUTH
    } else if (startRow > currentRow) {
      return DIRECTION.NORTH
    } else {
      return null
    }
  }
  if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) {
    if (startRow < currentRow) {
      return startCol < currentCol ? DIRECTION.SOUTH_EAST : DIRECTION.SOUTH_WEST
    } else {
      return startCol < currentCol ? DIRECTION.NORTH_EAST : DIRECTION.NORTH_WEST
    }
  }

  return null
}

const gridDimensions = computed(() => {
  if (!store.getGrid || store.getGrid.length === 0) {
    return { rows: 0, cols: 0 }
  }

  return {
    rows: store.getGrid.length,
    cols: store.getGrid[0] ? store.getGrid[0].length : 0,
  }
})

// Calculate the cells to highlight based on the direction
const calculateCellsToHighlight = (start, current, direction) => {
  const cells = []
  const [startRow, startCol] = [start.row, start.col]
  const [currentRow, currentCol] = [current.row, current.col]

  if (direction === DIRECTION.EAST) {
    for (let col = startCol; col <= currentCol; col++) {
      cells.push({ row: startRow, col })
    }
  } else if (direction === DIRECTION.WEST) {
    for (let col = startCol; col >= currentCol; col--) {
      cells.push({ row: startRow, col })
    }
  } else if (direction === DIRECTION.SOUTH) {
    for (let row = startRow; row <= currentRow; row++) {
      cells.push({ row, col: startCol })
    }
  } else if (direction === DIRECTION.NORTH) {
    for (let row = startRow; row >= currentRow; row--) {
      cells.push({ row, col: startCol })
    }
  } else {
    const rowStep = currentRow > startRow ? 1 : -1
    const colStep = currentCol > startCol ? 1 : -1

    // Correct the maxRowSteps and maxColSteps to avoid going outside the grid
    const maxRowSteps =
      rowStep === 1 ? gridDimensions.value.rows - startRow - 1 : startRow
    const maxColSteps =
      colStep === 1 ? gridDimensions.value.cols - startCol - 1 : startCol

    const maxSteps = Math.min(maxRowSteps, maxColSteps)
    const steps = Math.min(
      maxSteps,
      Math.max(
        Math.abs(currentRow - startRow),
        Math.abs(currentCol - startCol),
      ),
    )

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: startRow + i * rowStep,
        col: startCol + i * colStep,
      })
    }
  }

  return cells
}

const calculateDiagonalLength = (startCell, endCell) => {
  const dx = endCell.col - startCell.col
  const dy = endCell.row - startCell.row
  return Math.sqrt(dx * dx + dy * dy) * props.cellSize + props.cellSize
}

// Calculate the outline position and size based on the start and current cells
const calculateOutline = (highlightedCells, direction) => {
  if (!highlightedCells || highlightedCells.length === 0) {
    return null // No outline if there are no highlighted cells
  }

  const startCell = highlightedCells[0]
  const endCell = highlightedCells[highlightedCells.length - 1]

  // Base starting position
  let startX = startCell.col * props.cellSize
  let startY = startCell.row * props.cellSize

  let width = 0
  let height = props.cellSize

  const transitionDuration = getTransitionDuration(direction)
  lastAngle = calculateAngle(direction)

  switch (direction) {
    case DIRECTION.EAST:
      width = highlightedCells.length * props.cellSize
      startX += OFFSETS.value.E.x
      startY += OFFSETS.value.E.y
      break
    case DIRECTION.WEST:
      width = highlightedCells.length * props.cellSize
      startX += OFFSETS.value.W.x
      startY += OFFSETS.value.W.y
      break
    case DIRECTION.NORTH:
      width = highlightedCells.length * props.cellSize
      startX += OFFSETS.value.N.x
      startY += OFFSETS.value.N.y
      break
    case DIRECTION.SOUTH:
      width = highlightedCells.length * props.cellSize
      startX += OFFSETS.value.S.x
      startY += OFFSETS.value.S.y
      break
    case DIRECTION.SOUTH_EAST: {
      width = calculateDiagonalLength(startCell, endCell)
      startX += OFFSETS.value.SE.x
      startY += OFFSETS.value.SE.y
      break
    }
    case DIRECTION.SOUTH_WEST: {
      width = calculateDiagonalLength(startCell, endCell)
      startX += OFFSETS.value.SW.x
      startY += OFFSETS.value.SW.y
      break
    }
    case DIRECTION.NORTH_WEST: {
      width = calculateDiagonalLength(startCell, endCell)
      startX += OFFSETS.value.NW.x
      startY += OFFSETS.value.NW.y
      break
    }
    case DIRECTION.NORTH_EAST: {
      width = calculateDiagonalLength(startCell, endCell)
      startX += OFFSETS.value.NE.x
      startY += OFFSETS.value.NE.y
      break
    }
  }

  const transform = `rotate(${lastAngle.adjusted}deg)`
  const borderColor = `rgb(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b})`
  const backgroundColor = `rgba(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b}, 0.7)`

  return {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: `4px solid ${borderColor}`,
    backgroundColor,
    borderRadius: '50px',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 0,
    transform,
    transformOrigin: 'top left',
    transition: `all ${transitionDuration}s ease`,
  }
}

function getTransitionDuration(direction) {
  if (lastAngle === null) {
    return 0
  }

  if (Math.abs(direction - lastAngle.real) === 180) {
    return 0
  }

  return 0.1
}

function calculateAngle(direction) {
  if (lastAngle === null) {
    return { real: direction, adjusted: direction }
  }
  const delta = direction - lastAngle.real
  let adjusted = lastAngle.adjusted + delta
  if (delta > 180) {
    adjusted -= 360
  } else if (delta < -180) {
    adjusted += 360
  }

  return { real: direction, adjusted: adjusted }
}

// Handle mouse down event to start dragging
const handleMouseDown = (row, col) => {
  if (!playable.value) {
    return
  }

  isDragging.value = true
  startCell.value = { row, col }
  selectedCells.value = [{ row, col }]
  activeDirection.value = null // Reset direction on new selection
}

let lastProcessedTime = 0
const throttleMs = 16 // ~60fps

// Handle mouse enter event for dragging selection
const handleMouseEnter = (row, col) => {
  if (!playable.value) {
    return
  }

  if (!isDragging.value || !startCell.value) return

  const now = Date.now()
  if (now - lastProcessedTime < throttleMs) return

  // Calculate direction based on mouse movement
  const newDirection = calculateDirection(
    startCell.value.row,
    startCell.value.col,
    row,
    col,
  )

  if (newDirection !== null && newDirection !== activeDirection.value) {
    activeDirection.value = newDirection
  }

  if (activeDirection.value !== null) {
    const cellsToHighlight = calculateCellsToHighlight(
      startCell.value,
      { row, col },
      activeDirection.value,
    )

    selectedCells.value = cellsToHighlight
    outlinePosition.value = calculateOutline(
      cellsToHighlight,
      activeDirection.value,
    )
  }
}

// Handle mouse up event to stop dragging
const handleMouseUp = () => {
  if (!isDragging.value || !playable.value) return

  isDragging.value = false
  startCell.value = null

  lastAngle = null

  handleSelection()
}

const handleSelection = () => {
  if (!playable.value) {
    return
  }

  if (!selectedCells.value || selectedCells.value.length === 0) return

  let str = ''

  selectedCells.value.forEach(cell => {
    str += store.getGrid[cell.row][cell.col]
  })

  emit('select', str)
}

const handlePointerMove = (event) => {
  if (!store.getGrid?.length) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const col = Math.floor(x / props.cellSize)
  const row = Math.floor(y / props.cellSize)

  // Make sure we're within bounds
  if (
      row >= 0 &&
      col >= 0 &&
      row < store.getGrid.length &&
      col < store.getGrid[0].length
  ) {
    handleMouseEnter(row, col)
  }
}

</script>

<template>
  <div
    class="grid-container"
    @pointerup="handleMouseUp"
    @pointerleave="handleMouseUp"
    @pointercancel="handleMouseUp"
    @pointermove="handlePointerMove"
    :style="{
      backgroundSize: `${props.cellSize}px ${props.cellSize}px`,
      width: props.width + 'px',
      height: props.height + 'px',
    }"
  >
    <!--Highlighted/found words-->
    <div
      v-for="(highlight, index) in computedHighlights"
      :key="`highlight-${index}`"
      :style="highlight"
      class="highlight"
    ></div>

    <!-- Current selection outline -->
    <div
      v-if="outlinePosition"
      class="grid-outline"
      :style="outlinePosition"
    ></div>

    <!-- Grid cells -->
    <div
      class="grid"
      :style="{
        gridTemplateRows: `repeat(${store.getGrid ? store.getGrid.length : 0}, ${props.cellSize}px)`,
        gridTemplateColumns: `repeat(${store.getGrid && store.getGrid[0] ? store.getGrid[0].length : 0}, ${props.cellSize}px)`,
      }"
    >
      <template v-for="(row, rowIndex) in store.getGrid">
        <div
            class="grid-cell"
            v-for="(char, colIndex) in row"
            :key="`cell-${rowIndex}-${colIndex}`"
            @pointerdown="handleMouseDown(rowIndex, colIndex)"
            @pointerenter="handleMouseEnter(rowIndex, colIndex)"
            :style="{
              width: `${props.cellSize}px`,
              height: `${props.cellSize}px`,
              fontSize: `${props.cellSize < 30 ? 14 : 18}px`,
              cursor: playable ? 'pointer' : 'default',
            }"

        >
          {{ char }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to right, #000 1px, transparent 1px),
    linear-gradient(to bottom, #000000 1px, transparent 1px) !important;
  background-repeat: repeat;
  background-position: 0 0;
  /* Start at top-left corner */
  z-index: 0;
  /* Ensure grid lines are beneath everything */
  border: solid #000000;
  border-width: 0 1px 1px 0;
  touch-action: none;
}

.grid {
  position: relative;
  display: grid;
  background-color: transparent;
  gap: 0;
}

.grid-outline {
  z-index: 1;
  /* Place above grid lines but below letters */
}

.grid-container .grid-cell {
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  position: relative;
  font-weight: bold;
  background-color: transparent;
  transition: background-color 0.2s ease;
  touch-action: none;
}
</style>
