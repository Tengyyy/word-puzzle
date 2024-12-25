<script setup>

defineProps({
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  char: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    required: true
  }
})

</script>

<template>
  <div 
    class="cell"
    :class="{ selected: isSelected }"
  >
    {{ char }}
  </div>
</template>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  background-color: white;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.cell:hover {
  background-color: #f0f0f0;
  transform: scale(1.05); /* Subtle zoom on hover */
}

.cell.selected {
  background-color: rgba(255, 255, 0, 0.5); /* Highlight with a semi-transparent yellow */
  border-radius: 50%; /* Make the highlight circular */
  box-shadow: 0 0 5px 2px rgba(255, 255, 0, 0.8); /* Glow effect */
}
</style>