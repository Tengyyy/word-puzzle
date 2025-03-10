<script setup>
import { useCreatorStore } from '@/stores/creatorStore';
import { ref } from 'vue';
import ConfirmationDialog from './ConfirmationDialog.vue';

const creatorStore = useCreatorStore();

const emit = defineEmits({
    generateWords: null,
});

const languages = ref([
    { text: "Eesti keel", value: "et" },
    { text: "Inglise keel", value: "en" },
    { text: "Saksa keel", value: "de" },
]);

const modes = ref([
    { text: "Otsitavad sõnad", value: "words" },
    { text: "Vihjed ja definitsioonid", value: "hints" }
]);

const showDialog = ref(false);

const generateWords = () => {
    if (!creatorStore.topic) {
        console.warn("Topic is empty");
        return;
    }
    if (creatorStore.words.length > 0) {
        // Show warning that current word-list will be cleared
        showDialog.value = true;
        return;
    }
    emit('generateWords');
};

const handleProceed = () => {
    showDialog.value = false;

    creatorStore.removeAllWords();
    emit('generateWords');
};
</script>

<template>
    <main>
        <br>
        <h4>Sõnade sätted</h4>
        <label for="topic-input">Teema:</label><br>
        <input type="text" name="topic-input" id="topic-input" v-model="creatorStore.topic" /><br>
        <label for="input-language-select">Vali sisendkeel:</label><br>
        <select name="input-language-select" id="input-language-select" v-model="creatorStore.inputLanguage">
            <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                {{ lang.text }}
            </option>
        </select><br>
        <label for="output-language-select">Vali väljundkeel:</label><br>
        <select name="output-language-select" id="output-language-select" v-model="creatorStore.outputLanguage">
            <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                {{ lang.text }}
            </option>
        </select><br>
        <label for="mode-select">Kuva sõnarägastiku kõrval:</label><br>
        <select name="mode-select" id="mode-select" v-model="creatorStore.mode">
            <option v-for="mode in modes" :key="mode.value" :value="mode.value">
                {{ mode.text }}
            </option>
        </select><br><br>
        <button @click="generateWords">Genereeri sõnade list</button><br><br>
        <input type="checkbox" id="alphabetize-checkbox" v-model="creatorStore.alphabetize" />
        <label for="alphabetize-checkbox">Kuva sõnad tähestikulises järjekorras</label><br><br>

        <label>Tähtede suurus:</label><br>
        <input type="radio" id="maintain-casing-radio" value="maintain-casing" v-model="creatorStore.wordListCasing" />
        <label for="lowercase-radio">Säilita sisestatud sõnade kirjapilt</label><br>
        <input type="radio" id="uppercase-radio" value="uppercase" v-model="creatorStore.wordListCasing" />
        <label for="uppercase-radio">Suurtähed</label><br>
        <input type="radio" id="lowercase-radio" value="lowercase" v-model="creatorStore.wordListCasing" />
        <label for="lowercase-radio">Väiketähed</label><br><br>

        <input type="checkbox" id="spaces-allowed-checkbox" v-model="creatorStore.spacesAllowed" />
        <label for="spaces-allowed-checkbox">Luba tühikud sõnedes</label><br>

        <ConfirmationDialog :visible="showDialog"
            message="Uue sõnade listi genereerimisel olemasolevad sõnad eemaldatakse. Kas soovid jätkata?"
            @confirm="handleProceed" @cancel="showDialog = false" />
    </main>
</template>