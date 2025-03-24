<script setup>
import { computed } from 'vue'

const computedCellSize = computed(() => {
  const baseSize = 40; // or any default size you want
  const screenWidth = window.innerWidth; // Or use any logic for size scaling

  return screenWidth < 768 ? baseSize / 1.5 : baseSize; // Example scaling based on screen width
})

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
  }
})

const cellStyle = computed(() => {
  return {
    width: `${computedCellSize.value}px`,
    height: `${computedCellSize.value}px`,
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
