<script setup lang="ts">
import {ref} from "vue";
import { useRouter } from 'vue-router'
import {register, login} from '@/utils/api.ts'


let name = ref<string>();
let password = ref<string>();
let error = ref<string>();
const router = useRouter()



async function reg() {
  if (!name.value || !password.value) return
  const res = await register(name.value, password.value)

  if (res.status !== 201) return error.value = res.data
  const resL = await login(name.value, password.value)

  localStorage.setItem('atoken', resL.data?.access)
  localStorage.setItem('rtoken', resL.data?.refresh)

  await router.push("/")
}

</script>

<template>
  <div id="login-container">
    <div id="login-text">Регистрация</div>
    <div id="login-menu">
      {{error}}

      <label>
        Имя
        <input class="input-login" v-model="name" type="text" placeholder="Имя">
      </label>
      <label>
        Пароль
        <input class="input-login" v-model="password" type="password" placeholder="Пароль">
      </label>
      <button @click="reg" id="login-button">Зарегаться</button>
    </div>
  </div>
</template>

<style scoped>
#login-menu {
  width: 15vw;
  min-width: 400px;
  border-radius: 15px;
  border: 1px solid #ccc;


  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

#login-text {
  font-weight: 400;
  font-size: 3rem;
}
#login-button {
  border: 1px solid #ccc;
  border-radius: 50px;
  width: 125px;
  height: 30px;
  margin-top: 16px;
  font-size: 16px;
  background-color: #00bdff;
}
#login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.input-login {

  height: 20px;
  border: solid 1px #ccc;
  border-radius: 5px;

}
</style>
