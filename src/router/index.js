import {createRouter, createWebHistory} from 'vue-router'

import Commissions from '../views/Commissions.vue'
import Home from '../views/Home.vue'

const routes = [
    // ... ваши существующие маршруты
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/commissions',
        name: 'Commissions',
        component: Commissions,
        meta: {title: 'commissionsTitle'} // Ключ для перевода заголовка вкладки
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return {top: 0}
    }
})

export default router