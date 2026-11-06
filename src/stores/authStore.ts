import { getAuthenticatedUser, loginUser, logoutUser, registerUser } from '@/services/authService'
import type { LoginParams, RegisterParams, User } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  const getUser = async () => {
    try {
      const data = await getAuthenticatedUser()
      user.value = data
    } catch (err) {
      console.log(err, 'error getting user')
    }
  }

  const register = async (credentials: RegisterParams) => {
    try {
      await registerUser(credentials)
      await getUser()
    } catch (err) {
      console.log(err, 'error registering user')
      throw err
    }
  }

  const login = async (credentials: LoginParams) => {
    try {
      await loginUser(credentials)
      await getUser()
    } catch (err) {
      console.log(err, 'Login Error')
      throw err
    }
  }

  const logout = async () => {
    await logoutUser().then(() => (user.value = null))
  }

  return {
    user,
    isAuthenticated,
    getUser,
    register,
    login,
    logout,
  }
})
