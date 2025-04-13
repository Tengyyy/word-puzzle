import { defineStore } from 'pinia'

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    activeTooltip: null, // Track the ID of the active tooltip
  }),
  actions: {
    setActiveTooltip(id) {
      this.activeTooltip = id
    },
    clearActiveTooltip() {
      this.activeTooltip = null
    },
  },
})