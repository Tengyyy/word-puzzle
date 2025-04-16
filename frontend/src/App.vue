<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/languageStore.js'
import { computed, reactive, ref, watch } from 'vue'
import AlertMessage from './components/AlertMessage.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import { ENDPOINTS } from '../../shared/ApiEndpoints.js'
import { Constants } from '../../shared/Constants.js'
import flagEE from '/flags/ee.svg'
import flagGB from '/flags/gb.svg'
import logoEn from '@/assets/logo_medium_en.svg'
import logo from '@/assets/logo_medium.svg'

const text = {
  sourceCode: {
    et: 'Lähtekood',
    en: 'Source code',
  },
  language: {
    et: 'Keel',
    en: 'Language',
  },
  feedback: {
    et: 'Tagasiside',
    en: 'Feedback',
  },
  customPuzzle: {
    et: 'Loo oma sõnarägastik',
    en: 'Word-search creator',
  },
}

const languageStore = useLanguageStore()
const selectedLanguage = computed({
  get: () => languageStore.currentLanguage,
  set: val => languageStore.setLanguage(val),
})

const languages = [
  {
    title: Constants.LANGUAGE.ESTONIAN.text.et,
    value: Constants.LANGUAGE.ESTONIAN.value,
    flag: flagEE,
  },
  {
    title: Constants.LANGUAGE.ENGLISH.text.en,
    value: Constants.LANGUAGE.ENGLISH.value,
    flag: flagGB,
  },
]

const router = useRouter()
const route = useRoute()

const navigateHome = () => {
  router.push(ENDPOINTS.home.relative)
}

// Navigation bar buttons
const buttons = reactive([
  {
    name: 'customPuzzle',
    text: text.customPuzzle[selectedLanguage.value],
    icon: 'mdi-pencil',
    to: ENDPOINTS.creator.relative,
  },
  {
    name: 'feedback',
    text: text.feedback[selectedLanguage.value],
    icon: 'mdi-comment-outline',
    href: 'https://forms.gle/UrEyGyTHbNwTodwv5',
  },
])

// Watch for language changes and update button texts
watch(selectedLanguage, () => {
  // Update the text of each button based on the selected language
  buttons.forEach(button => {
    button.text = text[button.name][selectedLanguage.value] // Update button text dynamically
  })
})

// Drawer state for mobile navigation
const drawer = ref(false)
const langPanel = ref(null)

const overflowMenu = ref(false)

watch(drawer, newVal => {
  if (!newVal) {
    langPanel.value = null
  }
})

const isPrintView = computed(() => route.name === 'printer')
const isHomeView = computed(() => route.name === 'home')
const isNotFound = computed(() => route.name === 'NotFound')
</script>

<template>
  <div
    v-if="
      !isPrintView && (isHomeView || isNotFound || $vuetify.display.mdAndUp)
    "
    class="background-wrapper"
  >
    <div class="background-images">
      <div class="background-image"></div>
      <div class="background-image"></div>
    </div>
    <div class="background-overlay"></div>
  </div>

  <v-app>
    <v-app-bar app dense class="background-light">
      <v-container class="d-flex align-center">
        <!-- Navigation Drawer Button (Small Screens Only) -->
        <v-btn icon class="d-sm-none" @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <!-- Logo -->
        <img
          :src="selectedLanguage === Constants.LANGUAGE.ENGLISH.value ? logoEn : logo"
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
            <v-icon left class="mr-2">{{ button.icon }}</v-icon>
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
                  icon
                >
                  <v-icon>{{ button.icon }}</v-icon>
                </v-btn>
              </template>
              <span>{{ button.text }}</span>
            </v-tooltip>
          </template>
        </template>

        <!-- Overflow menu for source code link and language selector -->
        <template v-if="$vuetify.display.smAndUp">
          <v-menu v-model="overflowMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-card min-width="300">
              <v-list>
                <v-list-item
                  v-bind="{
                    href: 'https://github.com/Tengyyy/word-puzzle',
                    target: '_blank',
                  }"
                  @click="overflowMenu = false"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-github</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">{{
                    text.sourceCode[selectedLanguage]
                  }}</v-list-item-title>
                </v-list-item>

                <v-divider class="pb-4" />

                <v-list-item class="py-0 px-2">
                  <template v-slot:prepend> </template>
                  <v-list-item-title class="px-2 font-weight-bold">
                    <v-icon class="mr-6" style="opacity: 0.7">mdi-web</v-icon>
                    {{ text.language[selectedLanguage] }}
                  </v-list-item-title>

                  <!-- Nested list of language options -->
                  <v-list>
                    <v-list-item
                      v-for="lang in languages"
                      :key="lang.value"
                      class="py-2 px-2"
                      :class="{
                        'v-list-item--active': lang.value === selectedLanguage,
                      }"
                      @click="selectedLanguage = lang.value"
                    >
                      <template v-slot:prepend>
                        <v-img
                          :src="lang.flag"
                          alt=""
                          width="25"
                          height="25"
                          class="mr-6"
                          style="display: inline-block; vertical-align: middle"
                        />
                      </template>

                      <v-list-item-title>
                        {{ lang.title }}
                      </v-list-item-title>

                      <!-- Show checkmark when selected -->
                      <template v-slot:append>
                        <v-icon
                          v-if="lang.value === selectedLanguage"
                          class="ml-2"
                          color="primary"
                        >
                          mdi-check-circle
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>
      </v-container>
    </v-app-bar>

    <!-- Navigation Drawer (Small Screens Only) -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <div class="d-flex flex-column justify-space-between">
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

        <v-expansion-panels
          variant="accordion"
          class="lang-panel"
          v-model="langPanel"
        >
          <v-expansion-panel>
            <v-expansion-panel-title class="lang-title px-4">
              <template #default="{ expanded }">
                <v-icon start icon="mdi-earth" class="mr-2" />
                {{ text.language[selectedLanguage] }}
                <v-spacer />
                <v-icon>{{
                  expanded ? 'mdi-chevron-down' : 'mdi-chevron-up'
                }}</v-icon>
              </template>
              <template #actions></template>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pa-0">
              <v-list density="compact" nav class="pa-0 ma-0">
                <v-list-item
                  v-for="lang in languages"
                  :key="lang.value"
                  @click="
                    () => {
                      selectedLanguage = lang.value
                      langPanel = null
                    }
                  "
                  :active="lang.value === selectedLanguage"
                  class="py-1 px-4 ma-0"
                >
                  <v-list-item-title>
                    <v-img
                      :src="lang.flag"
                      alt=""
                      width="20"
                      height="20"
                      class="mr-1"
                      style="display: inline-block; vertical-align: middle"
                    />
                    {{ lang.title }}
                  </v-list-item-title>
                  <!-- Show checkmark when selected -->
                  <template v-slot:append>
                    <v-icon
                        v-if="lang.value === selectedLanguage"
                        class="ml-2"
                        color="primary"
                    >
                      mdi-check-circle
                    </v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-navigation-drawer>

    <v-main class="main-container no-max-width">
      <RouterView />
    </v-main>

    <AlertMessage />
    <ConfirmationDialog />
  </v-app>
</template>

<style scoped>
@import '@/assets/main.css';

.nav-button {
  background-color: var(--logo-light-green);

  border-color: var(--logo-dark-green);
  border-width: 3px;
}

.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure it takes at least the full viewport height */
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
}

.no-max-width {
  max-width: 100% !important;
  width: 100%;
}

.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
}

.background-images {
  display: flex;
  width: 400vw;
  height: 100vh;
  animation: pan-background 120s linear infinite;
}

.background-image {
  width: 200vw;
  height: 100vh;
  background: url('@/assets/solved_puzzle.png') repeat-x center;
  background-size: auto 100%;
  filter: blur(3px);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.lang-panel {
  position: absolute;
  bottom: 0; /* Anchor to bottom */
  width: 100%;
  z-index: 10;
}

.lang-panel .v-expansion-panel-text {
  position: absolute;
  bottom: 100%; /* Push the content upwards */
  left: 0;
  width: 100%;
  background: white; /* Ensure it's visible */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2); /* Add shadow */
}

.lang-title {
  min-height: 48px !important;
  height: 48px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

:deep(.lang-panel .v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

@keyframes pan-background {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-200vw);
  }
}
</style>
