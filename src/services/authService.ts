import type { LoginParams, RegisterParams, User } from '@/types'
import axios from 'axios'

export const getAuthenticatedUser = async (): Promise<User> => {
  const { data } = await axios.get<User>('/api/user')
  return data
}

export const registerUser = async (credentials: RegisterParams): Promise<void> => {
  await axios.post<void>('/register', {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    password_confirmation: credentials.passwordConfirmation,
  })
}

export const loginUser = async (credentials: LoginParams): Promise<void> => {
  await axios.post<void>('/login', credentials)
}

export const logoutUser = async (): Promise<void> => {
  await axios.post<void>('/logout')
}
