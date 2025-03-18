<!-- ConfirmationDialog.vue -->
<template>
  <Teleport to="body">
    <v-dialog v-model="dialogStore.visible" max-width="500px" persistent>
      <v-card>
        <v-card-title>{{ dialogStore.title }}</v-card-title>
        <v-card-text>{{ dialogStore.message }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="confirm">Jätka</v-btn>
          <v-btn color="secondary" @click="close">Sulge</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </Teleport>
</template>

<script setup>
import { useDialogStore } from "@/stores/dialogStore.js";

const dialogStore = useDialogStore();

const confirm = () => {
  dialogStore.confirm();
};

const close = () => {
  dialogStore.close();
};
</script>
