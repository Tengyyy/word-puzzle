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

        if (!gameStore.id || gameStore.id !== gameId) {
          try {
            const response = await apiRequest(
              `${ENDPOINTS.getGame.full}/${gameId}`,
            )
            gameStore.setGameData(response)
            next()
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
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

        if (!printStore.id || printStore.id !== gameId) {
          try {
            const response = await apiRequest(
              `${ENDPOINTS.getGame}/${to.params.id}${showAnswers === '1' || showAnswers === 'true' ? '?showAnswers=1' : ''}`,
            )
            printStore.setGameData(response)
            next()
            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            next({ name: 'NotFound' })
          }
        } else {
          next() // data is already in store, proceed to PrintView
        }
      },
    },
    {
      path: '/:pathMatch(.*)',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
