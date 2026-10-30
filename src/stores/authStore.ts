import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/services/authService'
import type { LoginParams, RegisterParams, User } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoadingUser = ref(false)
  const isRegisterLoading = ref(false)
  const isLoginLoading = ref(false)
  const isLoggingOutLoading = ref(false)

  const getUser = async () => {
    isLoadingUser.value = true

    try {
      const data = await getAuthenticatedUser()
      user.value = data
    } catch (err) {
      console.log(err, 'error getting user')
    } finally {
      isLoadingUser.value = false
    }
  }

  const register = async (credentials: RegisterParams) => {
    isRegisterLoading.value = true
    try {
      await registerUser(credentials)
      await getUser()
    } catch (err) {
      console.log(err, 'error registering user')
      throw err
    } finally {
      isRegisterLoading.value = false
    }
  }

  const login = async (credentials: LoginParams) => {
    isLoginLoading.value = true
    try {
      await loginUser(credentials)
      await getUser()
    } catch (err) {
      console.log(err, 'Login Error')
      throw err
    } finally {
      isLoginLoading.value = false
    }
  }

  const logout = async () => {
    isLoggingOutLoading.value = true

    await logoutUser()
      .then(() => (user.value = null))
      .finally(() => (isLoggingOutLoading.value = false))
  }

  return {
    user,
    isAuthenticated,
    isLoadingUser,
    isRegisterLoading,
    isLoginLoading,
    isLoggingOutLoading,
    getUser,
    register,
    login,
    logout,
  }
})
