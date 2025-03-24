<script setup>

import {useErrorStore} from "@/stores/errorStore.js";
import {ENDPOINTS} from "../../../shared/ApiEndpoints.js";
import router from "@/router/index.js"
import logo from '@/assets/logo.svg'
import { onBeforeRouteLeave } from 'vue-router'


const errorStore = useErrorStore()

const goHome = () => {
  router.push({ path: ENDPOINTS.home.relative })
}

onBeforeRouteLeave(() => {
  errorStore.resetError()
})
</script>


<template>
  <v-main>
    <v-empty-state
        headline="404"
        title="Lehte ei leitud"
        :text="errorStore.text"
        action-text="Mine avalehele"
        @click:action="goHome"
        :image="logo"
    ></v-empty-state>
  </v-main>
</template>
