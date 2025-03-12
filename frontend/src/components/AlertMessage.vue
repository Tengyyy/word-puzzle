<template>
    <Teleport to="body">
        <v-alert v-if="alertStore.visible" :type="alertStore.type" class="alert" closable
            @click:close="alertStore.hideAlert">
            {{ alertStore.message }}
        </v-alert>
    </Teleport>
</template>

<script setup>
import { useAlertStore } from "@/stores/alertStore";

const alertStore = useAlertStore();
</script>

<style>
.alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
    max-width: 80%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>