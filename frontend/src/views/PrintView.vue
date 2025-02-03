<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import GameBoard from '@/components/GameBoard.vue';
import WordList from '@/components/WordList.vue';
import { usePrintStore } from '@/stores/printStore';

const MODE = Object.freeze({
  GAME: 'game',
  CREATE: 'create',
});

const answerBoard = ref(null);

const printStore = usePrintStore();
const mode = computed(() => {
  return printStore.isCreateView ? MODE.CREATE : MODE.GAME;
});

onBeforeMount(() => {
  if (printStore.isCreateView) {
    answerBoard.value.toggleHighlights();
  }
});
</script>

<template>
  <main>
    <h1>{{ gameStore.title }}</h1>
    <GameBoard :mode="mode" :printView="true" />
    <WordList :mode="mode" :printView="true" />
    <template v-if="printStore.isCreateView">
      <GameBoard :mode="mode" :printView="true" class="page-break" ref="answerBoard" />
      <WordList :mode="mode" :printView="true" />
    </template>
  </main>
</template>

<style scoped>
@page {
  margin: 0;
  size: A4;
}

@media print {
  .page-break {
    break-before: page;
    page-break-before: always;
  }
}
</style>