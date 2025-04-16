import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'
import CreateView from '@/views/CreateView.vue'
import NotFound from '@/views/NotFound.vue'
import { useGameStore } from '@/stores/gameStore.js'
import PrintView from '@/views/PrintView.vue'
import { usePrintStore } from '@/stores/printStore.js'
import { ENDPOINTS } from '../../../shared/ApiEndpoints.js'
import { apiRequest } from '@/api.js'
import {useErrorStore} from "@/stores/errorStore.js";
import {useLanguageStore} from "@/stores/languageStore.js";
import {computed} from "vue";

const text = {
  notFound: {
    et: 'Antud ID-ga sõnarägastikku ei leitud andmebaasist',
    en: 'No word-search puzzle found with the given ID in the database',
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ENDPOINTS.home.relative,
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home',
      redirect: ENDPOINTS.home.relative,
    },
    {
      path: ENDPOINTS.game.relative + '/:id',
      name: 'game',
      component: GameView,
      beforeEnter: async (to, from, next) => {
        const gameStore = useGameStore()
        const gameId = to.params.id
        const errorStore = useErrorStore()

        const languageStore = useLanguageStore()
        const selectedLanguage = computed({
          get: () => languageStore.currentLanguage,
          set: val => languageStore.setLanguage(val),
        })

        if (!gameStore.id || gameStore.id !== gameId) {
          try {
            const response = await apiRequest(
              `${ENDPOINTS.getGame.full}/${gameId}`,
            )
            gameStore.setGameData(response)
            next()
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            errorStore.setError(text.notFound[selectedLanguage.value])
            next({ name: 'NotFound' })
          }
        } else {
          next() // data is already in store, proceed to GameView
        }
      },
    },
    {
      path: ENDPOINTS.creator.relative,
      name: 'creator',
      component: CreateView,
    },
    {
      path: `${ENDPOINTS.printer.relative}/:id`,
      name: 'printer',
      component: PrintView,
      beforeEnter: async (to, from, next) => {
        const printStore = usePrintStore()
        const gameId = to.params.id
        const showAnswers = to.query.showAnswers
        const errorStore = useErrorStore()

        const languageStore = useLanguageStore()
        const selectedLanguage = computed({
          get: () => languageStore.currentLanguage,
          set: val => languageStore.setLanguage(val),
        })

        if (!printStore.id || printStore.id !== gameId) {
          try {
            const response = await apiRequest(
              `${ENDPOINTS.getGame.full}/${to.params.id}${showAnswers === '1' || showAnswers === 'true' ? '?showAnswers=1' : ''}`,
            )
            printStore.setGameData(response)
            next()
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            errorStore.setError(text.notFound[selectedLanguage.value])
            next({ name: 'NotFound' })
          }
        } else {
          next() // data is already in store, proceed to PrintView
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: ENDPOINTS.notFound.relative
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
