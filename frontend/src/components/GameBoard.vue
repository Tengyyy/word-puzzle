<script setup>
import  { ref, computed } from 'vue'
import GridCell from './GridCell.vue';

const props = defineProps({
  grid: {
    type: Array,
    required: true
  },
  words: {
    type: Array,
    required: true
  }
})

// Track selected cells
const selectedCells = ref([]);
const isDragging = ref(false);

// Add a cell to the selection
const addCellToSelection = (row, col) => {
  selectedCells.value.push({ row, col });
};

// Handle mouse events
const handleMouseDown = (row, col) => {
  isDragging.value = true;
  selectedCells.value = [{ row, col }]; // Start a new selection
};

const handleMouseMove = (row, col) => {
  if (isDragging.value) {
    const alreadySelected = selectedCells.value.some(cell => cell.row === row && cell.col === col);
    if (!alreadySelected) {
      addCellToSelection(row, col);
    }
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const gridStyle = computed(() => {
  const columns = props.grid[0]?.length || 0;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    border: '2px solid black',
    padding: '5px',
    backgroundColor: '#f9f9f9'
  }
})

</script>

<template>
  <div class="grid" :style="gridStyle">
    <template v-for="(row, rowIndex) in grid" :key="'row-' + rowIndex">
        <GridCell 
          v-for="(char, colIndex) in row" 
          :key="'cell-' + rowIndex + '-' + colIndex" 
          :char="char" 
          :row="rowIndex" 
          :col="colIndex"
          :isSelected="selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex)"
          @mousedown="() => handleMouseDown(rowIndex, colIndex)"
          @mousemove="() => handleMouseMove(rowIndex, colIndex)"
          @mouseup="handleMouseUp"
        />
    </template>
  </div>
</template>

<style scoped>
.grid {
  user-select: none; /* Prevent highlighting/selecting text while dragging */
}
</style>