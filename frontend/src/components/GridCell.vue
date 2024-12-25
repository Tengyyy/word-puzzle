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
    font-family: 'Courier New', Courier, monospace;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    background-color: white;
  }
</style>