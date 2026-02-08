import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken } from '@/lib/auth'
import LoginView from '@/views/LoginView.vue'
import CoursesEditorView from '@/views/CoursesEditorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => (hasAccessToken() ? '/editor/courses' : '/login'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/editor/courses',
      name: 'editor-courses',
      component: CoursesEditorView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const isLoggedIn = hasAccessToken()

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.path === '/login' && isLoggedIn) {
    return '/editor/courses'
  }

  return true
})

export default router
