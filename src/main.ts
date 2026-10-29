import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore.ts'
import { useIssueStore } from './stores/issueStore.ts'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()
const issueStore = useIssueStore()

// authStore.register({
//   name: 'Julius',
//   email: 'test2@test',
//   password: 'qweqweqwe',
//   passwordConfirmation: 'qweqweqwe',
// })

// authStore.login({
//   email: 'test@test',
//   password: 'qweqweqwe',
// })

// ADMIN
// authStore.login({
//   email: 'admin@admin',
//   password: 'qweqweqwe',
// })

// UPDATE STATUS
// issueStore.updateStatus('4fd80aa7-5d6e-46f9-a75c-5796a4217fce',{
//   status: 'resolved'
// })

// issueStore.assignStaff('4fd80aa7-5d6e-46f9-a75c-5796a4217fce', {
//   id: 4,
// })

// authStore.logout()

// authStore.test()

// authStore.getUser()

// issueStore.getIssues()

// issueStore.updateIssue('4fd80aa7-5d6e-46f9-a75c-5796a4217fce',{
//     'description': 'Sample updated description',
//     'title': 'Updated title'
// })

// issueStore.getIssue('4fd80aa7-5d6e-46f9-a75c-5796a4217fce')

// issueStore.createIssue({
//   'title': 'Damaged road near the barangay hall',
//   'description': 'There is a large pothole that may cause accidents.',
//   'issueCategoryId': 1,
//   'barangayId': 1,
//   'priority': 'high',
//   'latitude': 7.0731,
//   'longitude': 125.6128,
// })

// ADD COMMENT
// issueStore.createComment('4fd80aa7-5d6e-46f9-a75c-5796a4217fce',{
//     body: 'This is a comment from main.ts too'
// })

// Add PHOTO
issueStore.createAttachment('4fd80aa7-5d6e-46f9-a75c-5796a4217fce',{
    'image':"'C:\Users\Julius\Pictures\Screenshots\parlay.png'"
})

app.use(router)

app.mount('#app')
