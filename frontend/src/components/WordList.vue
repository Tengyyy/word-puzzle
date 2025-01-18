<script setup>
import { ref } from 'vue';
const props = defineProps({
  words: {
    type: Array,
  },
  foundWords: {
    type: Array,
  },
  editable: {
    type: Boolean,
    required: true
  }
});

const topic = ref(null);
const wordInput = ref(null);
const alphabetize = ref(false);

const addWord = () => {

};

const reorderWords = () => {

};
</script>

<template>
  <template v-if="props.editable">
    <label for="topic-input">Teema:</label><br>
    <input type="text" name="topic-input" id="topic-input" v-model="topic" /><br><br>
    <input type="checkbox" id="alphabetize-checkbox" v-model="alphabetize" @change="reorderWords">
    <label for="alphabetize-checkbox">Kuva sõnad tähestikulises järjekorras</label>
  </template>
  <div class="word-list">
    <ul>
      <li v-for="(word, index) in words" :key="index"
        :class="{ found: foundWords.some(foundWord => foundWord === word) }">
        {{ word }}
      </li>
    </ul>
  </div>
  <template v-if="props.editable">
    <label for="word-input">Lisa sõna:</label><br>
    <input type="text" name="word-input" id="word-input" v-model="wordInput" /><br><br>
    <button @click="addWord">Lisa</button>
  </template>
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