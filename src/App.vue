<template>
  <v-app>
    <v-main>
       <AppBar v-if="shouldShowAppBar" style="height: 72px;"/>
      <router-view style="max-width: 720px; margin: auto;"></router-view> <!-- ルーティングされたコンポーネントが表示される -->
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppBar from './components/AppBar.vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const shouldShowAppBar = ref(true);

// Watch for changes in the route
watch(
  () => route.name, // Watching the route name
  (newRoute) => {
    // Update shouldShowAppBar based on the route
    shouldShowAppBar.value = newRoute !== 'Home';
  }
);
</script>
