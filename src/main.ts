import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore.ts'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()

// authStore.logout()

await authStore.getUser()

app.use(router)

app.mount('#app')
