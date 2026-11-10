import type { NotificationResponse } from '@/types/notification'
import axios from 'axios'

export const notificationService = {
  async getNotifications(page = 1): Promise<NotificationResponse> {
    const { data } = await axios.get('/api/notifications', {
      params: { page },
    })

    return data
  },

  async markAsRead(notificationId: string): Promise<void> {
    await axios.patch(`/api/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await axios.patch('/api/notifications/read-all')
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(`/api/notifications/${notificationId}`)
  },

  async deleteReadNotifications(): Promise<void> {
    await axios.delete('/api/notifications/read')
  },
}
