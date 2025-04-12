<template>
  <Teleport to="body">
    <v-dialog v-model="dialogStore.visible" max-width="500px" persistent>
      <v-card class="pa-3">
        <v-card-title class="font-weight-bold">{{ dialogStore.title }}</v-card-title>
        <v-card-text>{{ dialogStore.message }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" rounded variant="flat" @click="confirm">Jätka</v-btn>
          <v-btn color="primary" rounded variant="outlined" @click="close">Sulge</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </Teleport>
</template>

<script setup>
import { useDialogStore } from '@/stores/dialogStore.js'

const dialogStore = useDialogStore()

const confirm = () => {
  dialogStore.confirm()
}

const close = () => {
  dialogStore.close()
}
</script>
