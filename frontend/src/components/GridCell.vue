<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  char: {
    type: String,
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    required: true
  }
});

const cellStyle = computed(() => {
  return {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
    position: 'relative',
    zIndex: 2
  };
});
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
  cursor: pointer;
  user-select: none;
}
</style>