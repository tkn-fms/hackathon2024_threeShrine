/*
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
*/

// Plugins
import { registerPlugins } from '@/plugins'
import { createPinia } from 'pinia'
import { createBootstrap } from 'bootstrap-vue-next'

import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Components
import App from './App.vue'
// Composables
import { createApp } from 'vue'
import router from './router'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
}
const firebaseApp = initializeApp(firebaseConfig)
getAnalytics(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

const pinia = createPinia()

const app = createApp(App)
registerPlugins(app)

app.use(createBootstrap({ components: true, directives: true })).use(router).use(pinia).mount('#app')
