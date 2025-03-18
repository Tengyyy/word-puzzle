<script setup>
import { RouterLink, RouterView } from 'vue-router'

import { useLoadingStore } from '@/stores/loadingStore.js';
import { computed } from 'vue';
import AlertMessage from './components/AlertMessage.vue';
import ConfirmationDialog from './components/ConfirmationDialog.vue';
import {ENDPOINTS} from "../../shared/ApiEndpoints.js";

const loadingStore = useLoadingStore();
const isLoading = computed(() => loadingStore.isLoading);
</script>

<template>
  <header>
    <div class="wrapper">
      <RouterLink :to="ENDPOINTS.home.relative">Sõnarägastikud</RouterLink>
      <nav>
        <RouterLink :to="ENDPOINTS.creator.relative">Loo oma sõnarägastik</RouterLink>
        <a href="https://github.com/Tengyyy/word-puzzle">Github</a>
      </nav>
    </div>
  </header>
  <main>
    <RouterView />
  </main>

  <AlertMessage />
  <ConfirmationDialog />

  <div v-if="isLoading" class="spinner-overlay">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
