import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'
import CreateView from '@/views/CreateView.vue'
import NotFound from '@/views/NotFound.vue'
import { useLoadingStore } from '@/stores/loadingStore'
import { useGameStore } from '@/stores/gameStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GameView,
      beforeEnter: async (to, from, next) => {
        const gameStore = useGameStore()
        const gameId = to.params.id

        if (!gameStore.gameData || gameStore.gameData.id !== gameId) {
          const loadingStore = useLoadingStore()
          loadingStore.startLoading()

          try {
            const response = await fetch(
              `http://127.0.0.1:8081/api/game/${to.params.id}`,
            )
            const data = await response.json()
            gameStore.setGameData(data)
            next()
          } catch (error) {
            console.error('Failed to fetch game data', error)
            next(false) // Redirect to an error page or handle it appropriately
          } finally {
            loadingStore.stopLoading()
          }
        } else {
          next() // data is already in store, proceed to GameView
        }
      },
    },
    {
      path: '/create',
      name: 'creator',
      component: CreateView,
    },
    {
      path: '/:pathMatch(.*)',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
