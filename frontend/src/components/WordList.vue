<script setup>
import { useCreatorStore } from '@/stores/creatorStore';
import { useGameStore } from '@/stores/gameStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { ref, computed } from 'vue';

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
});

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['game', 'create'].includes(value)
  },
  printView: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const editable = computed(() => {
  return props.mode === MODE.CREATE && !props.printView
});

const store = props.mode === MODE.CREATE ? useCreatorStore() : useGameStore();

const loadingStore = useLoadingStore();

const topicInput = ref(null);
const wordInput = ref(null);

const addWord = () => {
  if (!editable.value) {
    return;
  }

  if (!wordInput.value) {
    return;
  }

  const success = store.addWord(wordInput.value);
  if (!success) {
    console.log('Duplicate word');
  } else {
    wordInput.value = null;
  }
};

const generateWords = () => {
  if (!topicInput.value) {
    console.log('Topic empty')
    return;
  }

  loadingStore.startLoading();
};
</script>

<template>
  <template v-if="editable">
    <label for="topic-input">Teema:</label><br>
    <input type="text" name="topic-input" id="topic-input" v-model="topicInput" /><br>
    <button @click="generateWords">Genereeri sõnade list</button><br><br>
    <input type="checkbox" id="alphabetize-checkbox" v-model="store.alphabetize" />
    <label for="alphabetize-checkbox">Kuva sõnad tähestikulises järjekorras</label>
  </template>
  <div class="word-list">
    <ul>
      <li v-for="(word, index) in store.getWords" :key="index"
        :class="{ found: props.mode === MODE.GAME && !props.printView && store.foundWords.some(foundWord => foundWord === word) }">
        {{ word }}
        <button v-if="editable" @click="store.removeWord(word)">
          Remove
        </button>
      </li>
    </ul>
  </div>
  <template v-if="editable">
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