import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from "../components/register.vue"
import LoginView from "../components/login.vue"
import HomeView from "../components/home.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: HomeView },
  ],
})

export default router
