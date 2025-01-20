<script setup>
import { ref, computed } from 'vue';
import GridCell from './GridCell.vue';
import correct_sound from '../assets/sounds/correct.wav'
import wrong_sound from '../assets/sounds/wrong.wav'
import { useCreatorStore } from '@/stores/creatorStore';
import { useGameStore } from '@/stores/gameStore';


const props = defineProps({
  playable: {
    type: Boolean,
    required: true
  }
});

const store = props.playable ? useGameStore() : useCreatorStore();

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

const correct_audio = new Audio(correct_sound);
const wrong_audio = new Audio(wrong_sound);

const highlights = ref([]); // Highlighted words

const selectedCells = ref([]);
const isDragging = ref(false);
const startCell = ref(null);
const activeDirection = ref(null);
const outlinePosition = ref({});
const gridCellSize = 40; // Grid cell size
const lastProcessedCell = ref(null) // Track the last processed cell to avoid recalculations when moving mouse over the same cell

const lastColor = ref(null); // Store the last generated color to ensure sufficient difference

const toggleHighlights = () => {
  if (props.playable) {
    return;
  }

  if (!store.highlight) {
    highlights.value = [];
  } else {
    highlights.value = store.wordPositions.map((pos) => {
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
  if (!props.playable) {
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

    correct_audio.play();
  } else {
    wrong_audio.play();
  }

  selectedCells.value = [];
  outlinePosition.value = {};
};

defineExpose({ resetSelection, toggleHighlights });

// Calculate the direction based on the start and current position
const calculateDirection = (startRow, startCol, currentRow, currentCol) => {
  if (startRow === currentRow) return 'horizontal';   // horizontal if rows are the same
  if (startCol === currentCol) return 'vertical';     // vertical if columns are the same
  if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) return 'diagonal';  // diagonal if row/col difference is the same
  return null;
};

const gridDimensions = computed(() => {
  if (!store.getGrid() || store.getGrid().length() === 0) {
    return { rows: 0, cols: 0 }
  }

  return { rows: store.getGrid().length, cols: store.getGrid()[0] ? store.getGrid()[0].length : 0 }
});

// Calculate the cells to highlight based on the direction
const calculateCellsToHighlight = (start, current, direction) => {
  const cells = [];
  const [startRow, startCol] = [start.row, start.col];
  const [currentRow, currentCol] = [current.row, current.col];

  if (direction === 'horizontal') {
    const colStart = Math.min(startCol, currentCol);
    const colEnd = Math.max(startCol, currentCol);
    for (let col = colStart; col <= colEnd; col++) {
      cells.push({ row: startRow, col });
    }
  } else if (direction === 'vertical') {
    const rowStart = Math.min(startRow, currentRow);
    const rowEnd = Math.max(startRow, currentRow);
    for (let row = rowStart; row <= rowEnd; row++) {
      cells.push({ row, col: startCol });
    }
  } else if (direction === 'diagonal') {
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
  let startX = startCell.col * gridCellSize;
  let startY = startCell.row * gridCellSize;

  let width, height, transform = 'none';

  if (direction === 'horizontal') {
    width = highlightedCells.length * gridCellSize;
    height = gridCellSize;
  } else if (direction === 'vertical') {
    width = gridCellSize;
    height = highlightedCells.length * gridCellSize;
  } else if (direction === 'diagonal') {
    const dx = endCell.col - startCell.col;
    const dy = endCell.row - startCell.row;
    const distance = Math.sqrt(dx * dx + dy * dy) * gridCellSize;
    width = distance + gridCellSize; // Ensure it covers one cell width
    height = gridCellSize; // Thin outline
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Adjust start position based on the diagonal direction
    const diagonalOffsets = {
      SE: { x: gridCellSize / 2, y: -gridCellSize / 5 },
      NW: { x: gridCellSize / 2, y: gridCellSize + gridCellSize / 5 },
      NE: { x: -gridCellSize / 5, y: gridCellSize / 2 },
      SW: { x: gridCellSize + gridCellSize / 5, y: gridCellSize / 2 }
    };

    if (dx > 0 && dy > 0) {
      // South-East
      startX += diagonalOffsets.SE.x;
      startY += diagonalOffsets.SE.y;
    } else if (dx < 0 && dy < 0) {
      // North-West
      startX += diagonalOffsets.NW.x;
      startY += diagonalOffsets.NW.y;
    } else if (dx > 0 && dy < 0) {
      // North-East
      startX += diagonalOffsets.NE.x;
      startY += diagonalOffsets.NE.y;
    } else if (dx < 0 && dy > 0) {
      // South-West
      startX += diagonalOffsets.SW.x;
      startY += diagonalOffsets.SW.y;
    }

    transform = `rotate(${angle}deg)`;
  }

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
    transition: 'all 0.1s ease',
  };
};


// Handle mouse down event to start dragging
const handleMouseDown = (row, col) => {
  if (!props.playable) {
    return;
  }

  isDragging.value = true;
  startCell.value = { row, col };
  selectedCells.value = [{ row, col }];
  activeDirection.value = null; // Reset direction on new selection
};

// Handle mouse move event for dragging selection
const handleMouseMove = (row, col) => {
  if (!props.playable) {
    return;
  }

  // If we're still in the same cell, do nothing
  if (lastProcessedCell.value && lastProcessedCell.value.row === row && lastProcessedCell.value.col === col) {
    return;
  }

  if (!isDragging.value || !startCell.value) return;

  // Calculate direction based on mouse movement
  const newDirection = calculateDirection(startCell.value.row, startCell.value.col, row, col);

  if (newDirection && newDirection !== activeDirection.value) {
    activeDirection.value = newDirection;
  }

  if (activeDirection.value) {
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
  if (!isDragging.value || !props.playable)
    return;

  isDragging.value = false;
  activeDirection.value = null;
  startCell.value = null;

  handleSelection()
};

const handleSelection = () => {
  if (!props.playable) {
    return;
  }

  if (!selectedCells.value || selectedCells.value.length == 0)
    return;

  let str = '';

  selectedCells.value.forEach(cell => {
    str += store.getGrid()[cell.row][cell.col]
  });

  emit('select', str);
};
</script>

<template>
  <div class="grid-container" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
    <!--Highlighted/found words-->
    <div v-for="(highlight, index) in highlights" :key="`highlight-${index}`" :style="highlight"></div>

    <!-- Current selection outline -->
    <div v-if="outlinePosition" class="grid-outline" :style="outlinePosition"></div>

    <!-- Grid cells -->
    <div class="grid"
      :style="{ gridTemplateColumns: `repeat(${store.getGrid() && store.getGrid()[0] ? store.getGrid()[0].length : 0}, ${gridCellSize}px)` }">
      <template v-for="(row, rowIndex) in store.getGrid()">
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
  display: inline-block;
  background-image:
    linear-gradient(to right, #ccc 1px, transparent 1px),
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