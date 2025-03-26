<script setup>
import { RouterView, useRouter } from 'vue-router'
import { useLoadingStore } from '@/stores/loadingStore.js'
import { computed, ref } from 'vue'
import AlertMessage from './components/AlertMessage.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import { ENDPOINTS } from '../../shared/ApiEndpoints.js'

const loadingStore = useLoadingStore()
const isLoading = computed(() => loadingStore.isLoading)

const router = useRouter()

const navigateHome = () => {
  router.push(ENDPOINTS.home.relative)
}

// Navigation bar buttons
const buttons = [
  {
    text: 'Loo oma sõnarägastik',
    icon: 'mdi-pencil',
    to: ENDPOINTS.creator.relative, // Vue Router link
  },
  {
    text: 'Lähtekood',
    icon: 'mdi-github',
    href: 'https://github.com/Tengyyy/word-puzzle', // External link
  },
  {
    text: 'Tagasiside',
    icon: 'mdi-comment-outline',
    href: 'https://forms.gle/', // External link
  },
]

// Drawer state for mobile navigation
const drawer = ref(false)
</script>

<template>
  <v-app>
    <v-app-bar app dense class="background-light">
      <v-container class="d-flex align-center">
        <!-- Navigation Drawer Button (Small Screens Only) -->
        <v-btn icon class="d-sm-none" @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <!-- Logo -->
        <img
          src="@/assets/logo_medium.svg"
          alt="Logo"
          @click="navigateHome"
          style="max-width: 180px; cursor: pointer"
        />

        <v-spacer></v-spacer>

        <!-- Large Screens (Text + Icon Buttons) -->
        <template v-if="$vuetify.display.lgAndUp">
          <v-btn
            v-for="(button, index) in buttons"
            :key="'lg-' + index"
            v-bind="
              button.to
                ? { to: button.to }
                : { href: button.href, target: '_blank' }
            "
            class="nav-button mx-2"
            rounded
          >
            <v-icon left>{{ button.icon }}</v-icon>
            {{ button.text }}
          </v-btn>
        </template>

        <!-- Medium Screens (Icons with Tooltips) -->
        <template v-if="$vuetify.display.smAndUp && $vuetify.display.mdAndDown">
          <template v-for="(button, index) in buttons" :key="'md-' + index">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="{
                    ...props,
                    ...(button.to
                      ? { to: button.to }
                      : { href: button.href, target: '_blank' }),
                  }"
                  class="nav-button mx-2"
                  rounded
                  icon
                >
                  <v-icon>{{ button.icon }}</v-icon>
                </v-btn>
              </template>
              <span>{{ button.text }}</span>
            </v-tooltip>
          </template>
        </template>
      </v-container>
    </v-app-bar>

    <!-- Navigation Drawer (Small Screens Only) -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item
          v-for="(button, index) in buttons"
          :key="'drawer-' + index"
          v-bind="
            button.to
              ? { to: button.to }
              : { href: button.href, target: '_blank' }
          "
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon>{{ button.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ button.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="main-container">
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <AlertMessage />
    <ConfirmationDialog />

    <v-overlay v-if="isLoading" persistent>
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<style scoped>
@import '@/assets/main.css';

.nav-button {
  background-color: var(--logo-light-green);

  border-color: var(--logo-dark-green);
  border-width: 3px;
}

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
