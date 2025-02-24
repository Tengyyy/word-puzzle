<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useLoadingStore } from '@/stores/loadingStore';

const topic = ref(null);

const difficultyOptions = ref([
  { text: "Lihtne", value: "easy" },
  { text: "Keskmine", value: "medium" },
  { text: "Raske", value: "hard" },
]);

const difficulty = ref('medium');

const languages = ref([
  { text: "Eesti keel", value: "et" },
  { text: "Inglise keel", value: "en" },
]);

const inputLanguage = ref('et');
const outputLanguage = ref('et');

const modes = ref([
  { text: "Otsitavad sõnad", value: "words" },
  { text: "Vihjed ja definitsioonid", value: "hints" }
]);

const mode = ref("words")

const router = useRouter();
const gameStore = useGameStore();
const loadingStore = useLoadingStore();

const startGame = () => {
  if (!topic.value) {
    console.log('Topic is empty!')
    return;
  }

  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/game?" + new URLSearchParams({
    topic: topic.value,
    difficulty: difficulty.value,
    inputLanguage: inputLanguage.value,
    outputLanguage: outputLanguage.value,
    mode: mode.value,
  }), { method: "GET" })
    .then((response) => response.json())
    .then((response) => {
      gameStore.setGameData(response);
      loadingStore.stopLoading();
      router.push({ path: `/game/${response.id}` });
    })
    .catch((e) => {
      console.log(e);
      loadingStore.stopLoading();
    });
}

</script>

<template>
  <main>
    <label for="topic-field">Sisesta sõnarägastiku teema:</label><br>
    <input type="text" id="topic-field" name="topic-field" v-model="topic"><br><br>
    <label for="difficulty-select">Vali raskusaste:</label><br>
    <select name="difficulty-select" id="difficulty-select" v-model="difficulty">
      <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
        {{ option.text }}
      </option>
    </select><br>
    <label for="input-language-select">Vali sisendkeel:</label><br>
    <select name="input-language-select" id="input-language-select" v-model="inputLanguage">
      <option v-for="lang in languages" :key="lang.value" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br>
    <label for="output-language-select">Vali väljundkeel:</label><br>
    <select name="output-language-select" id="output-language-select" v-model="outputLanguage">
      <option v-for="lang in languages" :key="lang.value" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br>
    <label for="mode-select">Kuva sõnarägastiku kõrval:</label><br>
    <select name="mode-select" id="mode-select" v-model="mode">
      <option v-for="mode in modes" :key="mode.value" :value="mode.value">
        {{ mode.text }}
      </option>
    </select><br><br>
    <button @click="startGame">Mängi</button>
  </main>
</template>
