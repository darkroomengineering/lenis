import { createApp } from 'vue'
import lenisVue from '../dist/lenis-vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(lenisVue)

app.mount('#app')
