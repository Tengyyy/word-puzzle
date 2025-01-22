<script setup>
import GameSettings from '@/components/GameSettings.vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { useCreatorStore } from '@/stores/creatorStore';
import { ref } from 'vue';
import { useLoadingStore } from '@/stores/loadingStore';

const creatorStore = useCreatorStore();
const loadingStore = useLoadingStore();

const boardRef = ref(null);

const link = ref(null);
const linkCopied = ref(false);
const gameSaved = ref(false);

const generate = () => {
  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/createCustomGame", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      width: creatorStore.widthInput,
      height: creatorStore.heightInput,
      overlap: creatorStore.overlap,
      backwardsEnabled: creatorStore.backwardsEnabled,
      diagonalsEnabled: creatorStore.diagonalsEnabled,
      casing: creatorStore.casing,
      words: creatorStore.getWords
    })
  })
    .then((response) => response.json())
    .then((response) => {
      creatorStore.generateGrid(response);
      loadingStore.stopLoading();
    })
    .catch((e) => {
      console.log(e);
      loadingStore.stopLoading();
    });
};

const share = () => {
  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/saveGame", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grid: creatorStore.getGrid,
      words: creatorStore.getWords,
      title: creatorStore.title
    })
  })
    .then((response) => response.json())
    .then((response) => {
      loadingStore.stopLoading();
      link.value = response.link;
      gameSaved.value = true;
    })
    .catch((e) => {
      console.log(e);
      gameSaved.value = false;
      loadingStore.stopLoading();
    })
};

const copyLink = () => {
  if (!link.value) {
    return;
  }

  navigator.clipboard.writeText(link.value)
    .then(() => {
      console.log('Link copied');
    })
    .catch(err => {
      console.log('Failed to copy link: ', err)
    });
};

const print = () => {

};
</script>


<template>
  <main>
    <GameSettings />
    <label for="title-input">Pealkiri:</label><br>
    <input type="text" id="title-input" name="title-input" v-model="creatorStore.title" /><br><br>
    <GameBoard :playable="false" ref="boardRef" />
    <WordList :editable="true" /><br><br>
    <input type="checkbox" name="highlight-checkbox" id="highlight-checkbox" v-model="creatorStore.highlight"
      @change="boardRef.toggleHighlights()" />
    <label for="highlight-checkbox">Kuva peidetud sõnad</label>
    <button @click="generate">Genereeri</button>
    <button @click="share">Jaga mängu</button>
    <template v-if="gameSaved">
      <input type="text" id="link-field" name="link-field" readonly :value="link" ref="linkFieldRef" />
      <button @click="copyLink">{{ linkCopied ? "Kopeeritud" : "Kopeeri" }}</button>
    </template>
    <button @click="print">Prindi mäng</button>
  </main>
</template>