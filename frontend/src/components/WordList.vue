<script setup>
const props = defineProps({
  words: {
    type: Array,
    required: true
  },
  foundWords: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="word-list">
    <ul>
      <li v-for="(word, index) in words" :key="index"
        :class="{ found: foundWords.some(foundWord => foundWord === word) }">
        {{ word }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.word-list ul {
  list-style-type: none;
  padding: 0;
}

.word-list li {
  font-size: 1rem;
  margin-bottom: 5px;
}

.word-list .found {
  text-decoration: line-through;
}
</style>