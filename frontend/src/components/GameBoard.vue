<script setup>
import { ref, computed } from 'vue';
import GridCell from './GridCell.vue';

const props = defineProps({
  grid: {
    type: Array,
    required: true
  }
});

const selectedCells = ref([]);
const isDragging = ref(false);
const startCell = ref(null);
const activeDirection = ref(null);
const outlinePosition = ref({});
const gridCellSize = 40; // Grid cell size
const lastProcessedCell = ref(null) // Track the last processed cell to avoid recalculations when moving mouse over the same cell

// Calculate the direction based on the start and current position
const calculateDirection = (startRow, startCol, currentRow, currentCol) => {
  if (startRow === currentRow) return 'horizontal';   // horizontal if rows are the same
  if (startCol === currentCol) return 'vertical';     // vertical if columns are the same
  if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) return 'diagonal';  // diagonal if row/col difference is the same
  return null;
};

const gridDimensions = computed(() => {
  if (!props.grid) {
    return {rows: 0, cols: 0}
  }

  return { rows: props.grid.length, cols: props.grid[0] ? props.grid[0].length : 0 }
})

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

  return {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: '4px solid red',
    borderRadius: '50px',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 0,
    transform,
    transformOrigin: 'top left',
    transition: 'all 1s ease',
  };
};


// Handle mouse down event to start dragging
const handleMouseDown = (row, col) => {
  isDragging.value = true;
  startCell.value = { row, col };
  selectedCells.value = [{ row, col }];
  activeDirection.value = null; // Reset direction on new selection
};

// Handle mouse move event for dragging selection
const handleMouseMove = (row, col) => {

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
  isDragging.value = false;
  activeDirection.value = null;
  startCell.value = null;
};
</script>

<template>
  <div
    class="grid-container"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <!-- Highlight overlay -->
    <div
      v-if="outlinePosition"
      class="grid-outline"
      :style="outlinePosition"
    ></div>

    <!-- Grid cells -->
    <div
      class="grid"
      :style="{ display: 'grid', gridTemplateColumns: `repeat(${grid[0]?.length || 0}, ${gridCellSize}px)`, gap: '0px' }"
    >
      <template v-for="(row, rowIndex) in grid">
        <GridCell
          v-for="(char, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          :char="char"
          :row="rowIndex"
          :col="colIndex"
          :isSelected="selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex)"
          @mousedown="() => handleMouseDown(rowIndex, colIndex)"
          @mousemove="() => handleMouseMove(rowIndex, colIndex)"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  position: relative;
  display: inline-block;
}

.grid {
  position: relative;
  z-index: 1;
}

.grid-outline {
  position: absolute;
  z-index: 0;
  border: 4px solid red;
  border-radius: 50px;
  pointer-events: none;
  transition: all 0.1s;
}
</style>