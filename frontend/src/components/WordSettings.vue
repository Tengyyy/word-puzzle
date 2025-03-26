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
  <div class="settings-group">
    <v-text-field
        label="Teema"
        v-model="creatorStore.topic"
        rounded
        variant="solo"
        dense
    />

    <v-select
        label="Sisendkeel"
        v-model="creatorStore.inputLanguage"
        :items="Object.values(Constants.LANGUAGE)"
        item-title="text"
        item-value="value"
        rounded
        variant="solo"
        dense
    />

    <v-select
        label="Väljundkeel"
        v-model="creatorStore.outputLanguage"
        :items="Object.values(Constants.LANGUAGE)"
        item-title="text"
        item-value="value"
        rounded
        variant="solo"
        dense
    />
  </div>

  <v-radio-group label="Kuva sõnarägastiku kõrval" v-model="creatorStore.mode" dense>
    <template v-for="mode in Constants.MODE" :key="mode.value">
      <v-radio :value="mode.value" :label="mode.text" />
    </template>
  </v-radio-group>

  <v-radio-group label="Tähtede suurus" v-model="creatorStore.wordListCasing" dense>
    <template v-for="mode in Constants.CASING" :key="mode.value">
      <v-radio :value="mode.value" :label="mode.text" />
    </template>
  </v-radio-group>

  <v-checkbox
      label="Luba tühikud sõnedes"
      v-model="creatorStore.spacesAllowed"
      dense
  />
  <v-switch
      label="Kuva sõnad tähestikulises järjekorras"
      v-model="creatorStore.alphabetize"
      dense
  />

  <v-btn
      @click="generateWords"
      :disabled="loadingStore.isLoading"
      rounded
      color="primary"
      dense
  >
    Genereeri sõnade list
  </v-btn>
</template>

<style scoped>
.settings-group {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}


</style>