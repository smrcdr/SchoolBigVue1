
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // порт твоего бэка
})


export async function register(name :string , pass :string ) {
  const ans = await api.post('/auth/register', { name, pass })
  return ans
}

export async function login(name :string , pass :string ) {
  const ans = await api.post('/auth/login', { name, pass })
  return ans
}


