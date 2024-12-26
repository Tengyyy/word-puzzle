<script setup>
import { ref } from 'vue';
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

// Calculate the direction based on the start and current position
const calculateDirection = (startRow, startCol, currentRow, currentCol) => {
  if (startRow === currentRow) return 'horizontal';   // horizontal if rows are the same
  if (startCol === currentCol) return 'vertical';     // vertical if columns are the same
  if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) return 'diagonal';  // diagonal if row/col difference is the same
  return null;
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
  if (!isDragging.value || !startCell.value) return;

  // Calculate direction based on mouse movement
  const newDirection = calculateDirection(startCell.value.row, startCell.value.col, row, col);

  // If a direction is detected and locked, continue in that direction
  if (!activeDirection.value && newDirection) {
    activeDirection.value = newDirection;
  }

  if (activeDirection.value) {
    selectedCells.value = calculateCellsToHighlight(startCell.value, { row, col }, activeDirection.value);
    outlinePosition.value = calculateOutline(startCell.value, { row, col }, activeDirection.value);
  }
};

// Handle mouse up event to stop dragging
const handleMouseUp = () => {
  isDragging.value = false;
  activeDirection.value = null;
  startCell.value = null;
};

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
    const steps = Math.abs(currentRow - startRow);
    for (let i = 0; i <= steps; i++) {
      cells.push({ row: startRow + i * rowStep, col: startCol + i * colStep });
    }
  }

  return cells;
};

// Calculate the outline position and size based on the start and end cells
const calculateOutline = (start, end, direction) => {
  if (!start || !end || !direction) return {};

  const startX = Math.min(start.col, end.col) * gridCellSize;
  const startY = Math.min(start.row, end.row) * gridCellSize;

  let width, height, transform = 'none';

  if (direction === 'horizontal') {
    width = Math.abs(start.col - end.col) * gridCellSize + gridCellSize;
    height = gridCellSize;
  } else if (direction === 'vertical') {
    width = gridCellSize;
    height = Math.abs(start.row - end.row) * gridCellSize + gridCellSize;
  } else if (direction === 'diagonal') {
    const diagonal = Math.abs(start.row - end.row) * gridCellSize;
    width = height = diagonal + gridCellSize;
    transform = `rotate(${start.row < end.row && start.col < end.col ? 45 : start.row < end.row ? -45 : 135}deg)`;
  }

  return {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform,
    transition: 'all 0.1s ease',
  };
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
  border-radius: 10px;
  pointer-events: none;
  transition: all 0.1s;
}
</style>