import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Импортируем роутер

// Импортируем CSS
import './assets/css/tiktokbtn.css'
import './assets/css/nexusbtn.css'
import './assets/css/vkbtn.css'
import 'bootstrap/dist/css/bootstrap.min.css'

// Импортируем нашу новую логику языка
import { useLanguage } from './composables/useLanguage'
import { useScreen } from './composables/useScreen'

const app = createApp(App)

// 1. Инициализируем язык
const { currentLang, t, toggleLang } = useLanguage()

// 2. Делаем его глобально доступным для всех компонентов (Home, Commissions и т.д.)
app.provide('currentLang', currentLang)
app.provide('t', t)
app.provide('toggleLang', toggleLang) // <-- Теперь кнопка в App.vue тоже может это использовать!

// Экран <-- Добавляем это
const { isMobile } = useScreen()
app.provide('isMobile', isMobile)
// 3. Подключаем роутер
app.use(router)

app.mount('#app')