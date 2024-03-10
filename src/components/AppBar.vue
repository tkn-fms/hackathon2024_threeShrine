<template>
  <v-app-bar class="d-flex justify-center align-center">
    <v-img src="@/assets/logo1.png" class="title" @click="() => { router.push('/') }" />
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style>
.tab {
  font-weight: bold;
  cursor: pointer;
  margin: 0 20px;
  color: #555;
}

.my-fonts {
  font-family: 'Potta One', sans-serif;
  font-size: 2.0rem;
}

.title {
  cursor: pointer;
}
</style>