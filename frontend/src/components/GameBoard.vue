<script setup>
import { ref, computed } from 'vue';
import GridCell from './GridCell.vue';
import { useCreatorStore } from '@/stores/creatorStore.js';
import { useGameStore } from '@/stores/gameStore.js';
import { usePrintStore } from '@/stores/printStore.js';

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
});

const GRID_CELL_SIZE = 40;

const DIRECTION = Object.freeze({
  EAST: 0,
  SOUTH_EAST: 45,
  SOUTH: 90,
  SOUTH_WEST: 135,
  WEST: 180,
  NORTH_WEST: 225,
  NORTH: 270,
  NORTH_EAST: 315,
});

const OFFSETS = Object.freeze({
  E: { x: 0, y: 0 },
  SE: { x: GRID_CELL_SIZE / 2, y: -GRID_CELL_SIZE / 5 },
  S: { x: GRID_CELL_SIZE, y: 0 },
  SW: { x: GRID_CELL_SIZE + GRID_CELL_SIZE / 5, y: GRID_CELL_SIZE / 2 },
  W: { x: GRID_CELL_SIZE, y: GRID_CELL_SIZE },
  NW: { x: GRID_CELL_SIZE / 2, y: GRID_CELL_SIZE + GRID_CELL_SIZE / 5 },
  N: { x: 0, y: GRID_CELL_SIZE },
  NE: { x: -GRID_CELL_SIZE / 5, y: GRID_CELL_SIZE / 2 },
});

let lastAngle = null;

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['game', 'create'].includes(value)
  },
  printView: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const playable = computed(() => {
  return props.mode === MODE.GAME && !props.printView;
});

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore();

const emit = defineEmits({
  select: (word) => {
    if (word) {
      return true;
    } else {
      console.warn('Invalid word selection');
      return false;
    }
  }
});

const correct_audio = new Audio(new URL("@/assets/sounds/correct.wav", import.meta.url).href);
const wrong_audio = new Audio(new URL("@/assets/sounds/wrong.wav", import.meta.url).href);

const highlights = ref([]); // Highlighted words

const selectedCells = ref([]);
const isDragging = ref(false);
const startCell = ref(null);
const activeDirection = ref(null);
const outlinePosition = ref({});
const lastProcessedCell = ref(null) // Track the last processed cell to avoid recalculations when moving mouse over the same cell
const lastColor = ref(null); // Store the last generated color to ensure sufficient difference

const toggleHighlights = () => {
  if (props.mode === MODE.GAME) {
    return;
  }

  if (!store.highlight && !props.printView) {
    highlights.value = [];
  } else {
    highlights.value = store.answers.map((pos) => {
      const direction = calculateDirection(pos.startRow, pos.startCol, pos.endRow, pos.endCol);
      const cells = calculateCellsToHighlight({ row: pos.startRow, col: pos.startCol }, { row: pos.endRow, col: pos.endCol }, direction);
      const outline = calculateOutline(cells, direction);
      outlineColor.value = getRandomColor()
      return {
        ...outline,
        border: 'none',
        backgroundColor: `rgba(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b}, 0.9)`
      };
    });
  }
};

// Utility function to get random rgb color, used to change the color of the highlight outline every time a word is found
const getRandomColor = (opacity = 1) => {
  const minRGB = 50; // Minimum RGB value to avoid very light colors
  const maxRGB = 200; // Maximum RGB value to avoid extremely bright colors
  const minDifference = 100; // Minimum difference between consecutive colors (sum of RGB differences)

  let r, g, b;

  let i = 0;
  do {
    r = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB;
    g = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB;
    b = Math.floor(Math.random() * (maxRGB - minRGB + 1)) + minRGB;

    // If there's no last color, accept the first generated color
    if (!lastColor.value) break;

    // Calculate the difference between the new color and the last color
    const diff = Math.abs(r - lastColor.value.r) + Math.abs(g - lastColor.value.g) + Math.abs(b - lastColor.value.b);
    if (diff >= minDifference) break; // Ensure the difference is significant enough
    i++
  } while (i < 5);

  lastColor.value = { r, g, b }; // Update the last color
  return { r, g, b, opacity };
};

const outlineColor = ref(getRandomColor()); // Default color

// Resets/clears selection, if the selected word was in the word list, then the selection will be highlighted
const resetSelection = (success) => {
  if (!playable.value) {
    return;
  }

  if (success) {
    // Add highlight with the same color as the outline but without a border
    highlights.value.push({
      ...outlinePosition.value,
      border: 'none',
      backgroundColor: `rgba(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b}, 0.9)` // Same color as outline with transparency
    });
    outlineColor.value = getRandomColor(); // Set a new random color

    if (!store.gameEnded) {
      correct_audio.play();
    }
  } else {
    wrong_audio.play();
  }

  selectedCells.value = [];
  outlinePosition.value = {};
};

defineExpose({ resetSelection, toggleHighlights });

// Calculate the direction based on the start and current position
const calculateDirection = (startRow, startCol, currentRow, currentCol) => {
  if (startRow === currentRow) {
    if (startCol < currentCol) {
      return DIRECTION.EAST;
    } else if (startCol > currentCol) {
      return DIRECTION.WEST;
    } else {
      return null;
    }
  }
  if (startCol === currentCol) {
    if (startRow < currentRow) {
      return DIRECTION.SOUTH;
    } else if (startRow > currentRow) {
      return DIRECTION.NORTH;
    } else {
      return null;
    }
  }
  if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) {
    if (startRow < currentRow) {
      return startCol < currentCol ? DIRECTION.SOUTH_EAST : DIRECTION.SOUTH_WEST;
    } else {
      return startCol < currentCol ? DIRECTION.NORTH_EAST : DIRECTION.NORTH_WEST;
    }
  }

  return null;
}

const gridDimensions = computed(() => {
  if (!store.getGrid || store.getGrid.length === 0) {
    return { rows: 0, cols: 0 }
  }

  return { rows: store.getGrid.length, cols: store.getGrid[0] ? store.getGrid[0].length : 0 }
});

const gridWidth = computed(() => {
  return gridDimensions.value.cols * GRID_CELL_SIZE;
});

const gridHeight = computed(() => {
  return gridDimensions.value.rows * GRID_CELL_SIZE;
});

// Calculate the cells to highlight based on the direction
const calculateCellsToHighlight = (start, current, direction) => {
  const cells = [];
  const [startRow, startCol] = [start.row, start.col];
  const [currentRow, currentCol] = [current.row, current.col];

  if (direction === DIRECTION.EAST) {
    for (let col = startCol; col <= currentCol; col++) {
      cells.push({ row: startRow, col });
    }
  } else if (direction === DIRECTION.WEST) {
    for (let col = startCol; col >= currentCol; col--) {
      cells.push({ row: startRow, col });

    }
  }
  else if (direction === DIRECTION.SOUTH) {
    for (let row = startRow; row <= currentRow; row++) {
      cells.push({ row, col: startCol });
    }
  } else if (direction === DIRECTION.NORTH) {
    for (let row = startRow; row >= currentRow; row--) {
      cells.push({ row, col: startCol });
    }
  }
  else {
    const rowStep = currentRow > startRow ? 1 : -1;
    const colStep = currentCol > startCol ? 1 : -1;

    // Correct the maxRowSteps and maxColSteps to avoid going outside the grid
    const maxRowSteps = rowStep === 1 ? gridDimensions.value.rows - startRow - 1 : startRow;
    const maxColSteps = colStep === 1 ? gridDimensions.value.cols - startCol - 1 : startCol;

    const maxSteps = Math.min(maxRowSteps, maxColSteps);
    const steps = Math.min(maxSteps, Math.max(Math.abs(currentRow - startRow), Math.abs(currentCol - startCol)));

    for (let i = 0; i <= steps; i++) {
      cells.push({ row: startRow + i * rowStep, col: startCol + i * colStep });
    }
  }

  return cells;
};

// Calculate the outline position and size based on the start and current cells
const calculateOutline = (highlightedCells, direction) => {
  if (!highlightedCells || highlightedCells.length === 0) {
    return null; // No outline if there are no highlighted cells
  }

  const startCell = highlightedCells[0];
  const endCell = highlightedCells[highlightedCells.length - 1];

  // Base starting position
  let startX = startCell.col * GRID_CELL_SIZE;
  let startY = startCell.row * GRID_CELL_SIZE;

  let width = 0;
  let height = GRID_CELL_SIZE;

  const transitionDuration = getTransitionDuration(direction);
  lastAngle = calculateAngle(direction)

  switch (direction) {
    case DIRECTION.EAST:
      width = highlightedCells.length * GRID_CELL_SIZE;
      startX += OFFSETS.E.x;
      startY += OFFSETS.E.y;
      break;
    case DIRECTION.WEST:
      width = highlightedCells.length * GRID_CELL_SIZE;
      startX += OFFSETS.W.x;
      startY += OFFSETS.W.y;
      break;
    case DIRECTION.NORTH:
      width = highlightedCells.length * GRID_CELL_SIZE;
      startX += OFFSETS.N.x;
      startY += OFFSETS.N.y;
      break;
    case DIRECTION.SOUTH:
      width = highlightedCells.length * GRID_CELL_SIZE;
      startX += OFFSETS.S.x;
      startY += OFFSETS.S.y;
      break;
    case DIRECTION.SOUTH_EAST: {
      const dx = endCell.col - startCell.col;
      const dy = endCell.row - startCell.row;
      const distance = Math.sqrt(dx * dx + dy * dy) * GRID_CELL_SIZE;
      width = distance + GRID_CELL_SIZE;
      startX += OFFSETS.SE.x;
      startY += OFFSETS.SE.y;
      break;
    }
    case DIRECTION.SOUTH_WEST: {
      const dx = endCell.col - startCell.col;
      const dy = endCell.row - startCell.row;
      const distance = Math.sqrt(dx * dx + dy * dy) * GRID_CELL_SIZE;
      width = distance + GRID_CELL_SIZE;
      startX += OFFSETS.SW.x;
      startY += OFFSETS.SW.y;
      break;
    }
    case DIRECTION.NORTH_WEST: {
      const dx = endCell.col - startCell.col;
      const dy = endCell.row - startCell.row;
      const distance = Math.sqrt(dx * dx + dy * dy) * GRID_CELL_SIZE;
      width = distance + GRID_CELL_SIZE;
      startX += OFFSETS.NW.x;
      startY += OFFSETS.NW.y;
      break;
    }
    case DIRECTION.NORTH_EAST: {
      const dx = endCell.col - startCell.col;
      const dy = endCell.row - startCell.row;
      const distance = Math.sqrt(dx * dx + dy * dy) * GRID_CELL_SIZE;
      width = distance + GRID_CELL_SIZE;
      startX += OFFSETS.NE.x;
      startY += OFFSETS.NE.y;
      break;
    }
  }

  const transform = `rotate(${lastAngle.adjusted}deg)`;
  const borderColor = `rgb(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b})`;
  const backgroundColor = `rgba(${outlineColor.value.r}, ${outlineColor.value.g}, ${outlineColor.value.b}, 0.7)`;

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
  };
};

function getTransitionDuration(direction) {
  if (lastAngle === null) {
    return 0;
  }

  if (Math.abs(direction - lastAngle.real) === 180) {
    return 0;
  }

  return 0.1
}

function calculateAngle(direction) {
  if (lastAngle === null) {
    return { real: direction, adjusted: direction }
  }
  const delta = direction - lastAngle.real;
  let adjusted = lastAngle.adjusted + delta;
  if (delta > 180) {
    adjusted -= 360;
  } else if (delta < -180) {
    adjusted += 360;
  }

  return { real: direction, adjusted: adjusted };
}


// Handle mouse down event to start dragging
const handleMouseDown = (row, col) => {
  if (!playable.value) {
    return;
  }

  isDragging.value = true;
  startCell.value = { row, col };
  selectedCells.value = [{ row, col }];
  activeDirection.value = null; // Reset direction on new selection
};

// Handle mouse move event for dragging selection
const handleMouseMove = (row, col) => {
  if (!playable.value) {
    return;
  }

  // If we're still in the same cell, do nothing
  if (lastProcessedCell.value && lastProcessedCell.value.row === row && lastProcessedCell.value.col === col) {
    return;
  }

  if (!isDragging.value || !startCell.value) return;

  // Calculate direction based on mouse movement
  const newDirection = calculateDirection(startCell.value.row, startCell.value.col, row, col);

  if (newDirection !== null && newDirection !== activeDirection.value) {
    activeDirection.value = newDirection;
  }

  if (activeDirection.value !== null) {
    const cellsToHighlight = calculateCellsToHighlight(
      startCell.value,
      { row, col },
      activeDirection.value
    );

    selectedCells.value = cellsToHighlight;
    outlinePosition.value = calculateOutline(cellsToHighlight, activeDirection.value);
  }
};

// Handle mouse up event to stop dragging
const handleMouseUp = () => {
  if (!isDragging.value || !playable.value)
    return;

  isDragging.value = false;
  activeDirection.value = null;
  startCell.value = null;

  lastAngle = null;

  handleSelection()
};

const handleSelection = () => {
  if (!playable.value) {
    return;
  }

  if (!selectedCells.value || selectedCells.value.length == 0)
    return;

  let str = '';

  selectedCells.value.forEach(cell => {
    str += store.getGrid[cell.row][cell.col]
  });

  emit('select', str);
};
</script>

<template>
  <div class="grid-container" @mouseup="handleMouseUp" @mouseleave="handleMouseUp"
    :style="{ width: gridWidth + 'px', height: gridHeight + 'px' }">
    <!--Highlighted/found words-->
    <div v-for="(highlight, index) in highlights" :key="`highlight-${index}`" :style="highlight" class="highlight">
    </div>

    <!-- Current selection outline -->
    <div v-if="outlinePosition" class="grid-outline" :style="outlinePosition"></div>

    <!-- Grid cells -->
    <div class="grid"
      :style="{ gridTemplateRows: `repeat(${store.getGrid ? store.getGrid.length : 0}, ${GRID_CELL_SIZE}px)`, gridTemplateColumns: `repeat(${store.getGrid && store.getGrid[0] ? store.getGrid[0].length : 0}, ${GRID_CELL_SIZE}px)` }">
      <template v-for="(row, rowIndex) in store.getGrid">
        <GridCell v-for="(char, colIndex) in row" :key="`cell-${rowIndex}-${colIndex}`" :char="char" :row="rowIndex"
          :col="colIndex" :isSelected="selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex)"
          @mousedown="() => handleMouseDown(rowIndex, colIndex)"
          @mousemove="() => handleMouseMove(rowIndex, colIndex)" />
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
  background-image: linear-gradient(to right, #ccc 1px, transparent 1px),
    linear-gradient(to bottom, #ccc 1px, transparent 1px);
  background-size: 40px 40px;
  /* Match grid cell size exactly */
  background-position: 0px 0px;
  /* Start at top-left corner */
  z-index: 0;
  /* Ensure grid lines are beneath everything */
  border: solid #ccc;
  border-width: 0px 1px 1px 0px;
}

.grid {
  position: relative;
  display: grid;
  background-color: transparent;
  gap: 0px;
  /* Remove spacing between grid cells */
}

.grid-outline {
  z-index: 1;
  /* Place above grid lines but below letters */
}

.grid-container .grid-cell {
  z-index: 2;
  /* Letters on top */
}
</style>
