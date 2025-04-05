<script setup>
  const props = defineProps({
    width: {
      type: Number,
      required: false,
    },
    printView: {
      type: Boolean,
      default: false,
    }
  })
</script>

<template>
  <v-card
      :width="!printView && $vuetify.display.smAndDown ? '100%' : props.width"
      :class="{ 'rounded-xl': $vuetify.display.mdAndUp, 'elevation-0': $vuetify.display.smAndDown }"
      class="py-4 px-6"
  >
    <slot></slot>
  </v-card>
</template>

<style scoped>

</style>