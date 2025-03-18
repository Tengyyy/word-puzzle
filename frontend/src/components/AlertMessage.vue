<template>
  <Teleport to="body">

    <v-snackbar v-model="alertStore.visible" :timeout="5000">
      {{ alertStore.message }}
      <template v-slot:actions>
        <v-btn @click="alertStore.hideAlert">
          Sulge
        </v-btn>
      </template>
    </v-snackbar>
  </Teleport>
</template>

<script setup>
import { useAlertStore } from "@/stores/alertStore.js";

const alertStore = useAlertStore();
</script>

<style scoped>
</style>
