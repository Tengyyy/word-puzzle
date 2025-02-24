<script setup>
import { useCreatorStore } from '@/stores/creatorStore';
import { useGameStore } from '@/stores/gameStore';
import { usePrintStore } from '@/stores/printStore';
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

const showHints = computed(() => {
  return editable.value || (props.answerList && store.getWords.some(word => word.word !== word.hint));
});

const languages = ref([
  { text: "Eesti keel", value: "et" },
  { text: "Inglise keel", value: "en" },
]);

const modes = ref([
  { text: "Otsitavad sõnad", value: "words" },
  { text: "Vihjed ja definitsioonid", value: "hints" }
]);

const emit = defineEmits({
  generateWords: null,
});

const addWord = () => {
  if (!editable.value) {
    return;
  }

  if (!wordInput.value) {
    return;
  }

  const success = store.addWord({ word: wordInput.value, hint: hintInput.value });
  if (!success) {
    console.log('Duplicate word or hint');
  } else {
    wordInput.value = null;
  }
};

const generateWords = () => {
  if (!store.topic) {
    console.warn("Topic is empty");
    return;
  }
  emit('generateWords');
};
</script>

<template>
  <template v-if="editable">
    <br><label for="topic-input">Teema:</label><br>
    <input type="text" name="topic-input" id="topic-input" v-model="store.topic" /><br>
    <label for="input-language-select">Vali sisendkeel:</label><br>
    <select name="input-language-select" id="input-language-select" v-model="store.inputLanguage">
      <option v-for="lang in languages" :key="lang.value" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br>
    <label for="output-language-select">Vali väljundkeel:</label><br>
    <select name="output-language-select" id="output-language-select" v-model="store.outputLanguage">
      <option v-for="lang in languages" :key="lang.value" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br>
    <label for="mode-select">Kuva sõnarägastiku kõrval:</label><br>
    <select name="mode-select" id="mode-select" v-model="store.mode">
      <option v-for="mode in modes" :key="mode.value" :value="mode.value">
        {{ mode.text }}
      </option>
    </select><br><br>
    <button @click="generateWords">Genereeri sõnade list</button><br><br>
    <input type="checkbox" id="alphabetize-checkbox" v-model="store.alphabetize" />
    <label for="alphabetize-checkbox">Kuva sõnad tähestikulises järjekorras</label>
  </template>
  <div class="word-list">
    <ul>
      <li v-for="(word, index) in store.getWords" :key="index"
        :class="{ found: props.mode === MODE.GAME && !props.printView && store.foundWords.some(foundWord => foundWord.word === word.word && foundWord.hint === word.hint) }">
        {{ showHints ? word.hint + " (" + word.word + ")" : word.hint }}
        <button v-if="editable" @click="store.removeWord(word)">
          Remove
        </button>
      </li>
    </ul>
  </div>
  <template v-if="editable">
    <label for="word-input">Lisa sõna:</label><br>
    <input type="text" name="word-input" id="word-input" v-model="wordInput" @keyup.enter="addWord" /><br>
    <label for="word-input">Vihje:</label><br>
    <input type="text" name="hint-input" id="hint-input" v-model="hintInput" @keyup.enter="addWord" /><br><br>
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