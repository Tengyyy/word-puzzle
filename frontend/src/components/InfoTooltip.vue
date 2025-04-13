<script setup>
import {ref, computed, onMounted, onBeforeUnmount, watch} from 'vue'
import { useTheme } from 'vuetify'
import { useTooltipStore } from '@/stores/tooltipStore'

const theme = useTheme()
const primaryColor = computed(() => theme.current.value.colors.primary)

const hovering = ref(false)
const isTouchDevice = ref(false)
const tooltipVisible = ref(false)

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
})

const tooltipStore = useTooltipStore()

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Close tooltip when clicking outside
  const handleClickOutside = (event) => {
    const tooltipActivator = document.querySelector(`.tooltip-activator[data-id="${props.id}"]`)
    if (tooltipActivator && !tooltipActivator.contains(event.target)) {
      tooltipVisible.value = false
      tooltipStore.clearActiveTooltip()
    }
  }

  document.addEventListener('click', handleClickOutside)

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Watch activeTooltip and auto-close if it's not this tooltip
watch(() => tooltipStore.activeTooltip, (newId) => {
  if (newId !== props.id) {
    tooltipVisible.value = false
  }
})

const toggleTooltip = () => {
  if (isTouchDevice.value) {
    tooltipVisible.value = !tooltipVisible.value
    if (tooltipVisible.value) {
      tooltipStore.setActiveTooltip(props.id) // Set this tooltip as active
    } else {
      tooltipStore.clearActiveTooltip() // Close the tooltip
    }
  } else {
    // For non-touch devices, let Vuetify handle tooltip visibility
    tooltipVisible.value = !tooltipVisible.value
    if (tooltipVisible.value) {
      tooltipStore.setActiveTooltip(props.id)
    } else {
      tooltipStore.clearActiveTooltip()
    }
  }
}

const isTooltipActive = computed(() => tooltipStore.activeTooltip === props.id)
</script>

<template>
  <v-tooltip
      v-model="tooltipVisible"
      location="top"
      :open-on-hover="!isTouchDevice"
      :open-on-focus="!isTouchDevice"
  >
    <template #activator="{ props: tooltipActivatorProps }">
      <v-icon
          v-bind="tooltipActivatorProps"
          size="26"
          class="ml-2 tooltip-activator"
          :data-id="props.id"
          @click.stop="toggleTooltip"
          @mousedown.stop
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
          :style="{ color: hovering || isTooltipActive || tooltipVisible ? primaryColor : 'rgba(0,0,0,0.3)' }"
      >
        mdi-help-circle
      </v-icon>
    </template>
    <span v-html="props.text" />
  </v-tooltip>
</template>