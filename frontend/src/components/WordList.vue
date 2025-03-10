<script setup>
import { useCreatorStore } from '@/stores/creatorStore';
import { useGameStore } from '@/stores/gameStore';
import { usePrintStore } from '@/stores/printStore';
import { ref, computed } from 'vue';
import AlertMessage from './AlertMessage.vue';

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
  },
  answerList: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const editable = computed(() => {
  return props.mode === MODE.CREATE && !props.printView
});

const store = props.printView
  ? usePrintStore()
  : props.mode === MODE.GAME
    ? useGameStore()
    : useCreatorStore();

const wordInput = ref(null);
const hintInput = ref(null);

const showAnswers = computed(() => {
  return editable.value || props.answerList;
});

const alert = ref({
  visible: false,
  type: "error",
  message: "",
});

const addWord = () => {
  if (!editable.value) {
    return;
  }

  const result = store.addWord({ word: wordInput.value, hint: hintInput.value }, true);
  if (!result.success) {
    alert.value = { visible: true, type: "error", message: result.message };
  }
  wordInput.value = null;
};

const removeAllWords = () => {
  if (!editable.value) {
    return;
  }

  store.removeAllWords();
};

const isFound = (word) =>
  props.mode === MODE.GAME &&
  !props.printView &&
  store.foundWords.some(foundWord => foundWord.word === word.word && foundWord.hint === word.hint);

const shouldShowAnswer = (word, wordFound) => {
  return (showAnswers.value || wordFound) && word.word.toUpperCase() !== word.hint.toUpperCase();
};
</script>

<template>
  <div class="word-list">
    <ul>
      <li v-for="(word, index) in store.getWords" :key="index" v-bind:class="{ found: (wordFound = isFound(word)) }">

        {{ shouldShowAnswer(word, wordFound) ? word.hint + " (" + word.word + ")" : word.hint }}

        <button v-if="editable" @click="store.removeWord(word)">
          Remove
        </button>
      </li>
    </ul>
  </div>
  <template v-if="editable">
    <button @click="removeAllWords">Eemalda kõik sõnad</button><br>
    <label for="word-input">Vihje:</label><br>
    <input type="text" name="hint-input" id="hint-input" v-model="hintInput" @keyup.enter="addWord" /><br>
    <label for="word-input">Sõna:</label><br>
    <input type="text" name="word-input" id="word-input" v-model="wordInput" @keyup.enter="addWord" /><br><br>
    <button @click="addWord">Lisa</button>
  </template>

  <AlertMessage :visible="alert.visible" :message="alert.message" :type="alert.type" @close="alert.visible = false" />
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