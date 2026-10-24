import {createRouter, createWebHistory} from 'vue-router'

// Страницы грузятся отдельными чанками: главная не тянет код заказов и наоборот
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: {title: 'pageTitleHome'}
    },
    {
        path: '/commissions',
        name: 'Commissions',
        component: () => import('../views/Commissions.vue'),
        meta: {title: 'commTitle'}
    },
    {
        // Любой неизвестный адрес: GitHub Pages отдаст 404.html (это та же SPA),
        // роутер покажет эту страницу вместо пустого экрана
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: {title: 'notFoundTitle'}
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Назад/вперёд — возвращаемся туда, где были
        if (savedPosition) return savedPosition
        // Якорь внутри страницы (#mods и т.п.)
        if (to.hash) return {el: to.hash, top: 80, behavior: 'smooth'}
        return {top: 0}
    }
})

export default router
