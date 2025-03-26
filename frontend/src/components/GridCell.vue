<script setup>
import { computed } from 'vue'

const props = defineProps({
  char: {
    type: String,
    required: true,
  },
  row: {
    type: Number,
    required: true,
  },
  col: {
    type: Number,
    required: true,
  },
  isSelected: {
    type: Boolean,
    required: true,
  },
  selectable: {
    type: Boolean,
    required: true,
  },
  cellSize: {
    type: Number,
    required: false,
    default: 40,
  }
})

const cellStyle = computed(() => {
  return {
    width: `${props.cellSize}px`,
    height: `${props.cellSize}px`,
    backgroundColor: 'transparent',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
    position: 'relative',
    zIndex: 2,
    cursor: props.selectable ? 'pointer' : 'default',
  }
})
</script>

<template>
  <div class="grid-cell" :style="cellStyle">
    {{ char }}
  </div>
</template>

<style scoped>
.grid-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
</style>
