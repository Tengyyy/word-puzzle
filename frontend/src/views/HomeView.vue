<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useLoadingStore } from '@/stores/loadingStore';

const topic = ref(null);

const difficulty = ref('medium');

const router = useRouter();
const gameStore = useGameStore();
const loadingStore = useLoadingStore();

const startGame = () => {
  if (!topic.value) {
    console.log('Topic is empty!')
    return;
  }

  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/game?" + new URLSearchParams({ topic: topic.value, difficulty: difficulty.value }), { method: "GET" })
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
      <option value="easy">Lihtne</option>
      <option value="medium">Keskmine</option>
      <option value="hard">Raske</option>
    </select><br><br>
    <button @click="startGame">Mängi</button>
  </main>
</template>
