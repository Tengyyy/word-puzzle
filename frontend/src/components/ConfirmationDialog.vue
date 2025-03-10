<template>
    <Teleport to="body">
        <div v-if="visible" class="dialog-overlay">
            <div class="dialog">
                <p>{{ props.message }}</p>
                <button @click="emit('confirm')">Jätka</button>
                <button @click="emit('cancel')">Katkesta</button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    visible: Boolean,
    message: {
        type: String,
        default: "Kas soovid jätkata?",
    },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<style>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}
</style>