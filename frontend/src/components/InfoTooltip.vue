<script setup>
import {computed, ref} from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const primaryColor = computed(() => theme.current.value.colors.primary)

const hovering = ref(false);

const props = defineProps({
    text: {
      type: String,
      required: true
    }
  })
</script>


<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <v-icon
          v-bind="props"
          size="26"
          class="ml-2"
          color="rgb(0,0,0,0.6)"
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
          :style="{ color: hovering ? primaryColor : 'rgba(0,0,0,0.3)'  }"
      >
        mdi-help-circle
      </v-icon
      >
    </template>
    <span v-html="props.text" />
  </v-tooltip>
</template>

<style scoped>
</style>