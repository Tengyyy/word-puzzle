<script setup>
import  { computed } from 'vue'
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
        <GridCell v-for="(char, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex" :char="char" :row="rowIndex" :col="colIndex" />
    </template>
  </div>
</template>

<style scoped>

</style>