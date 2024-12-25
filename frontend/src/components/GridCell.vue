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
  }
})
</script>

<template>
  <div class="cell">
    {{ char }}
  </div>
</template>

<style scoped>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Courier New', Courier, monospace; /* Suitable for word search */
    font-size: 20px; /* Readable font size */
    font-weight: bold;
    color: #333; /* Dark text for readability */
    width: 40px; /* Match gridTemplateColumns */
    height: 40px; /* Uniform cell height */
    border: 1px solid #ccc; /* Cell borders */
    background-color: white; /* Uniform background */
  }
</style>