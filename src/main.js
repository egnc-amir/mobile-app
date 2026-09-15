import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Phoenix CSS
import '@/assets/css/theme.css'
import '@/assets/css/user.css'
import '@/assets/main.css'

import '@fortawesome/fontawesome-free/css/all.min.css'

// 🔥 ADD THIS: Bootstrap JS
import * as bootstrap from 'bootstrap'
window.bootstrap = bootstrap

// Phoenix JS
import '@/assets/js/config.js'
import '@/assets/js/qrcode.min.js' // ✅ Offline QR support

const app = createApp(App)

const pinia = createPinia()

app.use(pinia) // 🔥 THIS FIXES THE BLANK PAGE
app.use(router)

app.mount('#app')
