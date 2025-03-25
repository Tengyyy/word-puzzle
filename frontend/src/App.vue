<script setup>
import {RouterView, useRouter} from 'vue-router'
import { useLoadingStore } from '@/stores/loadingStore.js'
import { computed } from 'vue'
import AlertMessage from './components/AlertMessage.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import { ENDPOINTS } from '../../shared/ApiEndpoints.js'


const loadingStore = useLoadingStore()
const isLoading = computed(() => loadingStore.isLoading)

const router = useRouter()

const navigateHome = () => {
  router.push(ENDPOINTS.home.relative)
}
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dense>
      <v-container class="d-flex align-center">
        <img
            src="@/assets/logo_medium.svg"
            alt="Logo"
            @click="navigateHome"
            style="max-width: 180px; cursor: pointer;"
        />
        <v-spacer></v-spacer>
        <v-btn :to="ENDPOINTS.creator.relative" variant="text" class="text-white">
          <v-icon left>mdi-pencil</v-icon>
          Loo oma sõnarägastik
        </v-btn>
        <v-btn href="https://github.com/Tengyyy/word-puzzle" target="_blank" variant="text" class="text-white">
          <v-icon left>mdi-github</v-icon>
          Lähtekood
        </v-btn>

        <v-btn href="https://forms.gle/" target="_blank" variant="text" class="text-white">
          <v-icon left>mdi-comment-outline</v-icon>
          Tagasiside
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="main-container">
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <AlertMessage />
    <ConfirmationDialog />

    <v-overlay v-if="isLoading" persistent>
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </v-overlay>
  </v-app>
</template>



<style scoped>

/* Additional styles for home view page centering */
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center vertically */
  align-items: center; /* Center horizontally */
  min-height: 100vh; /* Ensure it takes at least the full viewport height */
  padding: 20px; /* Add padding if needed */
  box-sizing: border-box;
  overflow: hidden; /* Prevent horizontal scroll if content fits */
}

</style>