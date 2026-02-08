<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/lib/api'
import { setTokens } from '@/lib/auth'

interface LoginResponse {
  access: string
  refresh: string
}

const router = useRouter()
const route = useRoute()

const loginForm = reactive({
  name: '',
  pass: '',
})

const registerForm = reactive({
  name: '',
  pass: '',
  invite: '',
})

const isLoginLoading = ref(false)
const isRegisterLoading = ref(false)
const errorText = ref('')
const successText = ref('')

async function login(): Promise<void> {
  errorText.value = ''
  successText.value = ''
  isLoginLoading.value = true

  try {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: {
        name: loginForm.name,
        pass: loginForm.pass,
      },
    })

    setTokens(response.access, response.refresh)

    const redirectPath =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/editor/courses'

    await router.replace(redirectPath)
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Ошибка входа'
  } finally {
    isLoginLoading.value = false
  }
}

async function register(): Promise<void> {
  errorText.value = ''
  successText.value = ''
  isRegisterLoading.value = true

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        name: registerForm.name,
        pass: registerForm.pass,
        invite: registerForm.invite || undefined,
      },
    })

    successText.value = 'Пользователь создан. Теперь войдите.'
    loginForm.name = registerForm.name
    loginForm.pass = ''
    registerForm.pass = ''
    registerForm.invite = ''
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Ошибка регистрации'
  } finally {
    isRegisterLoading.value = false
  }
}
</script>

<template>
  <main class="page">
    <div class="auth-page stack">
      <section class="card stack">
        <h1>Вход</h1>
        <form class="stack" @submit.prevent="login">
          <label class="stack">
            <span>Имя</span>
            <input v-model.trim="loginForm.name" type="text" required />
          </label>

          <label class="stack">
            <span>Пароль</span>
            <input v-model="loginForm.pass" type="password" required />
          </label>

          <button :disabled="isLoginLoading" type="submit">
            {{ isLoginLoading ? 'Загрузка...' : 'Войти' }}
          </button>
        </form>
      </section>

      <section class="card stack">
        <h2>Регистрация</h2>
        <form class="stack" @submit.prevent="register">
          <label class="stack">
            <span>Имя</span>
            <input v-model.trim="registerForm.name" type="text" required />
          </label>

          <label class="stack">
            <span>Пароль</span>
            <input v-model="registerForm.pass" type="password" required />
          </label>

          <label class="stack">
            <span>Инвайт (необязательно)</span>
            <input v-model.trim="registerForm.invite" type="text" />
          </label>

          <button :disabled="isRegisterLoading" type="submit">
            {{ isRegisterLoading ? 'Загрузка...' : 'Зарегистрироваться' }}
          </button>
        </form>
      </section>

      <p v-if="successText" class="message">{{ successText }}</p>
      <p v-if="errorText" class="error">{{ errorText }}</p>
    </div>
  </main>
</template>
