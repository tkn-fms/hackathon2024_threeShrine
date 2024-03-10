<template>
  <v-app>
    <v-main class="mt-15" style="color: #424242; user-select: none;">
      <v-container fluid fill-height>
        <v-img src="@/assets/logo1.png" class="mb-10"/>
        <v-btn block rounded="xl" size="x-large" @click="movePlay()">スタート</v-btn>
      </v-container>
    </v-main>
    <v-footer></v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const movePlay = () => {
  router.push({ name: 'Play' });
}
</script>
