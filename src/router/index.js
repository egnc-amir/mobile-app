import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/BusinessCardView.vue'),
    },
    {
      path: '/:token',
      name: 'business-card',
      component: () => import('@/views/BusinessCardView.vue'),
    },
  ],
})

export default router
