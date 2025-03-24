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
  if (creatorStore.getWords.length > 0) {
    dialogStore.showDialog(
      'Kas soovid jätkata?',
      'Uue sõnade listi genereerimisel olemasolevad sõnad eemaldatakse.',
      () => {
        creatorStore.removeAllWords()
        emit('generateWords')
      },
      () => {},
    )
    return
  }

  emit('generateWords')
}
</script>

<template>
  <v-text-field
    label="Teema"
    v-model="creatorStore.topic"
    :disabled="loadingStore.isLoading"
  />

  <v-select
    label="Sisendkeel"
    v-model="creatorStore.inputLanguage"
    :disabled="loadingStore.isLoading"
    :items="Object.values(Constants.LANGUAGE)"
    item-title="text"
    item-value="value"
  />

  <v-select
    label="Väljundkeel"
    v-model="creatorStore.outputLanguage"
    :disabled="loadingStore.isLoading"
    :items="Object.values(Constants.LANGUAGE)"
    item-title="text"
    item-value="value"
  />

  <v-radio-group label="Kuva sõnarägastiku kõrval" v-model="creatorStore.mode">
    <template v-for="mode in Constants.MODE" :key="mode.value">
      <v-radio
        :value="mode.value"
        :label="mode.text"
        :disabled="loadingStore.isLoading"
      />
    </template>
  </v-radio-group>

  <v-radio-group label="Tähtede suurus" v-model="creatorStore.wordListCasing">
    <template v-for="mode in Constants.CASING" :key="mode.value">
      <v-radio
        :value="mode.value"
        :label="mode.text"
        :disabled="loadingStore.isLoading"
      />
    </template>
  </v-radio-group>

  <v-checkbox
    label="Luba tühikud sõnedes"
    v-model="creatorStore.spacesAllowed"
    :disabled="loadingStore.isLoading"
  />

  <v-switch
    label="Kuva sõnad tähestikulises järjekorras"
    v-model="creatorStore.alphabetize"
    :disabled="loadingStore.isLoading"
  />

  <v-btn @click="generateWords" :disabled="loadingStore.isLoading">
    Genereeri sõnade list
  </v-btn>
</template>
