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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: props.isSelected ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
    position: 'relative',
    zIndex: 1
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