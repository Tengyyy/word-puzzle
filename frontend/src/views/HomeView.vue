<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore.js';
import { Constants } from '../../../shared/Constants.js';
import { useAlertStore } from '@/stores/alertStore.js';
import { apiRequest } from '@/api.js';
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js';
import { useLoadingStore } from '@/stores/loadingStore.js';



const topic = ref(null);

const difficulty = ref(Constants.DIFFICULTY.MEDIUM.value);

const inputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value);
const outputLanguage = ref(Constants.LANGUAGE.ESTONIAN.value);

const mode = ref(Constants.MODE.WORDS.value)

const router = useRouter();
const gameStore = useGameStore();
const alertStore = useAlertStore();

const loadingStore = useLoadingStore();

const startGame = async () => {
  if (!topic.value) {
    alertStore.showAlert('Palun sisesta sõnarägastiku teema', 'error')
    return;
  }

  const response = await apiRequest(ENDPOINTS.getGame.full + '?' + new URLSearchParams({
    topic: topic.value,
    difficulty: difficulty.value,
    inputLanguage: inputLanguage.value,
    outputLanguage: outputLanguage.value,
    mode: mode.value,
  }));

  gameStore.setGameData(response);
  router.push({ path: `/game/${response.id}` });
}
</script>

<template>
  <main>
    <label for="topic-field">Sisesta sõnarägastiku teema:</label><br>
    <input type="text" id="topic-field" name="topic-field" v-model="topic"><br><br>
    <label for="difficulty-select">Vali raskusaste:</label><br>
    <select name="difficulty-select" id="difficulty-select" v-model="difficulty" :disabled="loadingStore.isLoading">
      <option v-for="(option, key) in Constants.DIFFICULTY" :key="key" :value="option.value">
        {{ option.text }}
      </option>
    </select><br>
    <label for="input-language-select">Vali sisendkeel:</label><br>
    <select name="input-language-select" id="input-language-select" v-model="inputLanguage"
      :disabled="loadingStore.isLoading">
      <option v-for="(lang, key) in Constants.LANGUAGE" :key="key" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br>
    <label for="output-language-select">Vali väljundkeel:</label><br>
    <select name="output-language-select" id="output-language-select" v-model="outputLanguage"
      :disabled="loadingStore.isLoading">
      <option v-for="(lang, key) in Constants.LANGUAGE" :key="key" :value="lang.value">
        {{ lang.text }}
      </option>
    </select><br><br>
    <button @click="startGame" :disabled="loadingStore.isLoading">Mängi</button>
  </main>
</template>
