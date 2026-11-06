import type { LoginParams, RegisterParams, User } from '@/types'
import axios from 'axios'

export const authService = {
  async getAuthenticatedUser(): Promise<User> {
    const { data } = await axios.get<User>('/api/user')
    return data
  },

  async registerUser(credentials: RegisterParams): Promise<void> {
    await axios.post<void>('/register', {
      first_name: credentials.firstName,
      middle_name: credentials.middleName,
      last_name: credentials.lastName,
      phone_number: credentials.phoneNumber,
      email: credentials.email,
      barangay_id: credentials.barangayId,
      password: credentials.password,
      password_confirmation: credentials.passwordConfirmation,
    })
  },

  async loginUser(credentials: LoginParams): Promise<void> {
    await axios.post<void>('/login', credentials)
  },

  async logoutUser(): Promise<void> {
    await axios.post<void>('/logout')
  },
}

// export const getAuthenticatedUser = async (): Promise<User> => {
//   const { data } = await axios.get<User>('/api/user')
//   return data
// }

// export const registerUser = async (credentials: RegisterParams): Promise<void> => {
//   await axios.post<void>('/register', {
//     first_name: credentials.firstName,
//     middle_name: credentials.middleName,
//     last_name: credentials.lastName,
//     phone_number: credentials.phoneNumber,
//     email: credentials.email,
//     barangay_id: credentials.barangayId,
//     password: credentials.password,
//     password_confirmation: credentials.passwordConfirmation,
//   })
// }

// export const loginUser = async (credentials: LoginParams): Promise<void> => {
//   await axios.post<void>('/login', credentials)
// }

// export const logoutUser = async (): Promise<void> => {
//   await axios.post<void>('/logout')
// }
