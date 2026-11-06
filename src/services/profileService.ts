import axios from 'axios'
import type { User } from '@/types'

export const profileService = {
  async updateProfile(payload: {
    firstName?: string
    middleName?: string | null
    lastName?: string
    phoneNumber?: string
  }): Promise<User> {
    const { data } = await axios.patch<User>('/api/user', {
      first_name: payload.firstName,
      last_name: payload.lastName,
      middle_name: payload.middleName,
      phone_number: payload.phoneNumber,
    })

    return data
  },

  async updatePassword(payload: {
    currentPassword: string
    password: string
    passwordConfirmation: string
  }): Promise<void> {
    await axios.put<void>(`/api/user/password`, {
      current_password: payload.currentPassword,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    })
  },
}
