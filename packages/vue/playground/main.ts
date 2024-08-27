import lenisVue from 'lenis/vue'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(lenisVue)

app.mount('#app')
