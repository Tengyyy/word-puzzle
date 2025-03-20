<script setup>
import { useCreatorStore } from '@/stores/creatorStore.js'
import { useAlertStore } from '@/stores/alertStore.js'
import { useDialogStore } from '@/stores/dialogStore.js'
import { Constants } from '../../../shared/Constants.js'
import { useLoadingStore } from '@/stores/loadingStore.js'

const creatorStore = useCreatorStore()
const alertStore = useAlertStore()
const dialogStore = useDialogStore()
const loadingStore = useLoadingStore()

const emit = defineEmits({
  generateWords: null,
})

const generateWords = async () => {
  if (!creatorStore.topic) {
    alertStore.showAlert('Palun sisesta sõnarägastiku teema', 'error')
    return
  }
  if (creatorStore.words.length > 0) {
    dialogStore.showDialog(
      'Kas soovid jätkata?',
      'Uue sõnade listi genereerimisel olemasolevad sõnad eemaldatakse.',
      () => {
        creatorStore.removeAllWords()
        emit('generateWords')
      },
      () => {},
    )
  }
}
</script>

<template>
  <main>
    <br />
    <h4>Sõnade sätted</h4>
    <label for="topic-input">Teema:</label><br />
    <input
      type="text"
      name="topic-input"
      id="topic-input"
      v-model="creatorStore.topic"
      :disabled="loadingStore.isLoading"
    /><br />
    <label for="input-language-select">Vali sisendkeel:</label><br />
    <select
      name="input-language-select"
      id="input-language-select"
      v-model="creatorStore.inputLanguage"
      :disabled="loadingStore.isLoading"
    >
      <option
        v-for="(lang, key) in Constants.LANGUAGE"
        :key="key"
        :value="lang.value"
      >
        {{ lang.text }}
      </option></select
    ><br />
    <label for="output-language-select">Vali väljundkeel:</label><br />
    <select
      name="output-language-select"
      id="output-language-select"
      v-model="creatorStore.outputLanguage"
      :disabled="loadingStore.isLoading"
    >
      <option
        v-for="(lang, key) in Constants.LANGUAGE"
        :key="key"
        :value="lang.value"
      >
        {{ lang.text }}
      </option></select
    ><br />
    <label for="mode-select">Kuva sõnarägastiku kõrval:</label><br />
    <select
      name="mode-select"
      id="mode-select"
      v-model="creatorStore.mode"
      :disabled="loadingStore.isLoading"
    >
      <option
        v-for="(mode, key) in Constants.MODE"
        :key="key"
        :value="mode.value"
      >
        {{ mode.text }}
      </option></select
    ><br /><br />
    <button @click="generateWords" :disabled="loadingStore.isLoading">
      Genereeri sõnade list
    </button>
    <br /><br />
    <input
      type="checkbox"
      id="alphabetize-checkbox"
      v-model="creatorStore.alphabetize"
      :disabled="loadingStore.isLoading"
    />
    <label for="alphabetize-checkbox"
      >Kuva sõnad tähestikulises järjekorras</label
    ><br /><br />

    <label>Tähtede suurus:</label><br />
    <div v-for="(option, key) in Constants.CASING" :key="key">
      <input
        type="radio"
        :id="`${option.value}-radio`"
        :value="option.value"
        v-model="creatorStore.wordListCasing"
        :disabled="loadingStore.isLoading"
      />
      <label :for="`${option.value}-radio`">{{ option.text }}</label
      ><br />
    </div>

    <input
      type="checkbox"
      id="spaces-allowed-checkbox"
      v-model="creatorStore.spacesAllowed"
      :disabled="loadingStore.isLoading"
    />
    <label for="spaces-allowed-checkbox">Luba tühikud sõnedes</label><br />
  </main>
</template>
