<script setup>
import { useErrorStore } from "@/stores/errorStore.js"
import { ENDPOINTS } from "../../../shared/ApiEndpoints.js"
import router from "@/router/index.js"
import { onBeforeRouteLeave } from 'vue-router'
import {useLanguageStore} from "@/stores/languageStore.js";
import {computed} from "vue";

const errorStore = useErrorStore()

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const text = {
  notFound: {
    et: 'Lehte ei leitud',
    en: 'Page not found',
  },
  goHome: {
    et: 'Naase avalehele',
    en: 'Go to the homepage',
  }
}

const goHome = () => {
  router.push({ path: ENDPOINTS.home.relative })
}

onBeforeRouteLeave(() => {
  errorStore.resetError()
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card
        class="pa-8 d-flex flex-column align-center text-center rounded-xl"
        max-width="500"
        elevation="4"
    >
      <img  src="@/assets/logo_large.svg" alt="Logo" class="mb-6" />

      <h1 class="text-h2 font-weight-bold mb-2">404</h1>

      <div class="text-h5 font-weight-medium mb-2">{{ text.notFound[selectedLanguage] }}</div>

      <div class="mb-6" style="opacity: 0.8;">{{ errorStore.text }}</div>

      <v-btn color="primary" rounded @click="goHome">
        {{ text.goHome[selectedLanguage] }}
      </v-btn>
    </v-card>
  </v-container>
</template>