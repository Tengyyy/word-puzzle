<template>
    <Teleport to="body">
        <div v-if="visible" class="alert" :class="props.type">
            <span>{{ props.message }}</span>
            <button class="close-btn" @click="emit('close')">&times;</button>
        </div>
    </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    visible: Boolean,
    message: {
        type: String,
        default: "Hoiatus!",
    },
    type: {
        type: String,
        default: "info", // Can be 'info', 'success', 'warning', or 'error'
    },
});

const emit = defineEmits(["close"]);
</script>

<style>
.alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 200px;
    max-width: 80%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Alert types */
.info {
    background: #2196F3;
}

.success {
    background: #4CAF50;
}

.warning {
    background: #FF9800;
}

.error {
    background: #F44336;
}

/* Close button */
.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    margin-left: 10px;
}
</style>