<script setup>
import GameSettings from '@/components/GameSettings.vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { useCreatorStore } from '@/stores/creatorStore';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoadingStore } from '@/stores/loadingStore';

const creatorStore = useCreatorStore();
const loadingStore = useLoadingStore();

const boardRef = ref(null);

const router = useRouter();

const id = ref(null);
const link = computed(() => {
  return "http://localhost:5173/game/" + id.value;
});

const linkCopied = ref(false);
const gameSaved = ref(false);
const generated = ref(false);

const generate = () => {
  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/create-custom-game", {
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
      const highlightsToggled = creatorStore.highlight;
      if (highlightsToggled) {
        creatorStore.highlight = false;
        boardRef.value.toggleHighlights();
      }
      creatorStore.generateGrid(response);
      if (highlightsToggled) {
        creatorStore.highlight = true;
        boardRef.value.toggleHighlights();
      }
      generated.value = true;
      linkCopied.value = false;
      gameSaved.value = false;
      loadingStore.stopLoading();
    })
    .catch((e) => {
      console.log(e);
      loadingStore.stopLoading();
    });
};

const share = () => {
  loadingStore.startLoading();
  fetch("http://127.0.0.1:8081/api/persist-game", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grid: creatorStore.getGrid,
      words: creatorStore.getWords,
      title: creatorStore.title,
      answers: creatorStore.answers,
    })
  })
    .then((response) => response.json())
    .then((response) => {
      loadingStore.stopLoading();
      id.value = response.id;
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
      linkCopied.value = true;
    })
    .catch(err => {
      console.log('Failed to copy link: ', err)
    });
};

const print = () => {
  if (gameSaved.value) {
    window.open(`/print/${id.value}?showAnswers=1`, "_blank"); // Open print page in a new tab
  } else {
    loadingStore.startLoading();
    fetch("http://127.0.0.1:8081/api/save-game", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grid: creatorStore.getGrid,
        words: creatorStore.getWords,
        title: creatorStore.title,
        answers: creatorStore.answers,
      })
    })
      .then((response) => response.json())
      .then((response) => {
        loadingStore.stopLoading();
        id.value = response.id;
        window.open(`/print/${id.value}?showAnswers=1`, "_blank"); // Open print page in a new tab
      })
      .catch((e) => {
        console.log(e);
        loadingStore.stopLoading();
      })
  }
};
</script>


<template>
  <main>
    <GameSettings />
    <label for="title-input">Pealkiri:</label><br>
    <input type="text" id="title-input" name="title-input" v-model="creatorStore.title" /><br><br>
    <GameBoard mode="create" ref="boardRef" />
    <WordList mode="create" /><br><br>
    <input type="checkbox" name="highlight-checkbox" id="highlight-checkbox" v-model="creatorStore.highlight"
      @change="boardRef.toggleHighlights()" />
    <label for="highlight-checkbox">Kuva peidetud sõnad</label>
    <button @click="generate">Genereeri</button>
    <button @click="share" :disabled="!generated || gameSaved">Jaga mängu</button>
    <template v-if="gameSaved">
      <input type="text" id="link-field" name="link-field" readonly :value="link" ref="linkFieldRef" />
      <button @click="copyLink">{{ linkCopied ? "Kopeeritud" : "Kopeeri" }}</button>
    </template>
    <button @click="print" :disabled="!generated">Prindi mäng</button>
  </main>
</template>

<style scoped></style>