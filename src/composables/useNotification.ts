import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { notificationService } from '@/services/notificationService'
import { queryKeys } from '@/constants/queryKeys'

export function useNotifications(page: MaybeRefOrGetter<number> = 1) {
  const queryClient = useQueryClient()

  const queryKey = computed(() => queryKeys.notifications.list(toValue(page)))

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () => notificationService.getNotifications(toValue(page)),
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })

  const deleteReadNotificationsMutation = useMutation({
    mutationFn: notificationService.deleteReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })

  return {
    notificationsQuery,
    notifications: computed(() => notificationsQuery.data.value?.data ?? []),
    unreadCount: computed(() => notificationsQuery.data.value?.unread_count ?? 0),
    pagination: computed(() => notificationsQuery.data.value?.meta),
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteReadNotifications: deleteReadNotificationsMutation.mutate,
    isDeletingNotification: deleteNotificationMutation.isPending,
    isDeletingReadNotifications: deleteReadNotificationsMutation.isPending,
    deleteNotificationAsync: deleteNotificationMutation.mutateAsync,
  }
}
