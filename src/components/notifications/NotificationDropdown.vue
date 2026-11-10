<script setup lang="ts">
import { useNotifications } from '@/composables/useNotification'
import { Bell } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { onMounted, onUnmounted } from 'vue'

function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        isOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
})

const router = useRouter()
const isOpen = ref(false)

const {
    notifications,
    unreadCount,
    notificationsQuery,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotificationAsync,
    isMarkingAllAsRead,
} = useNotifications(1)

const visibleNotifications = computed(() => notifications.value)

const visibleReadCount = computed(() =>
    visibleNotifications.value.filter(
        notification => notification.read_at !== null
    ).length
)

// Delete all read notifications on the current page.
async function clearReadNotifications() {
    const readNotifications = visibleNotifications.value.filter(
        notification => notification.read_at !== null
    )

    if (!readNotifications.length) return

    await Promise.all(
        readNotifications.map(notification =>
            deleteNotificationAsync(notification.id)
        )
    )
}

// Delete one notification.
function removeNotification(notificationId: string) {
    deleteNotification(notificationId)
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date))
}

function openNotification(
    notification: (typeof notifications.value)[number]
) {
    if (!notification.read_at) {
        markAsRead(notification.id)
    }

    isOpen.value = false

    router.push({
        name: 'issueDiscussion',
        params: { uuid: notification.data.issue_uuid },
    })
}

function viewAll() {
    isOpen.value = false
    router.push({ name: 'resident-notifications' })
}
</script>

<template>
    <div class="relative">
        <!-- Bell button -->
        <button type="button"
            class="relative cursor-pointer hover:text-brand rounded-full p-1 text-text-body transition hover:bg-bg-surface"
            aria-label="Notifications" @click="isOpen = !isOpen">
            <Bell class="w-3 pt-1" />

            <span v-if="unreadCount > 0"
                class="absolute -right-0 -top-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-accent mt-[6px] text-[10px] font-semibold text-white">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
        </button>


        <Teleport to="body">
            <Transition name="fade">
                <div v-if="isOpen" class="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[2px]"
                    @click="isOpen = false" />
            </Transition>
        </Teleport>

        <!-- Dropdown -->
        <Teleport to="body">
            <div v-if="isOpen" class="fixed left-1/5 top-1/2 z-[9999]
               w-[calc(100vw-2rem)] max-w-96
               -translate-x-1/2 -translate-y-1/2
               overflow-hidden rounded-xl
               border border-border-subtle
               bg-bg-surface shadow-2xl
                lg:right-6 lg:top-20
               lg:translate-x-0 lg:translate-y-0" @click.stop>
                <div class="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                    <div>
                        <h3 class="font-semibold text-text-heading">
                            Notifications
                        </h3>
                        <p class="text-xs text-text-muted">
                            {{ unreadCount }} unread
                        </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <button v-if="visibleReadCount > 0" type="button"
                            class="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-body transition hover:bg-bg-page"
                            @click="clearReadNotifications">
                            Clear read
                        </button>

                        <button v-if="unreadCount > 0" type="button"
                            class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                            :disabled="isMarkingAllAsRead" @click="markAllAsRead()">
                            Mark all as read
                        </button>
                    </div>
                </div>

                <div class="max-h-96 overflow-y-auto">
                    <div v-if="notificationsQuery.isPending.value" class="p-6 text-center text-sm text-text-muted">
                        Loading notifications...
                    </div>

                    <div v-else-if="visibleNotifications.length === 0">
                        <div class="p-12 text-center">
                            <h2 class="font-semibold text-text-heading">
                                No notifications to display
                            </h2>
                            <p class="mt-2 text-sm text-text-muted">
                                You're all caught up on this page.
                            </p>
                        </div>
                    </div>

                    <button v-for="notification in visibleNotifications" :key="notification.id" type="button"
                        class="flex w-full gap-3 border-b border-border-subtle px-4 py-4 text-left transition hover:bg-bg-page"
                        :class="{ 'bg-brand/5': !notification.read_at }" @click="openNotification(notification)">
                        <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                            :class="notification.read_at ? 'bg-transparent' : 'bg-brand'" />

                        <span class="min-w-0 flex-1">
                            <span class="block text-sm text-text-body">
                                {{ notification.data.message }}
                            </span>

                            <span class="mt-1 block text-xs text-text-muted">
                                {{ formatDate(notification.created_at) }}
                            </span>
                        </span>
                    </button>
                </div>

                <div class="border-t border-border-subtle p-3 text-center">
                    <button type="button" class="text-sm font-medium text-brand hover:underline" @click="viewAll">
                        View all notifications
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.popup-enter-active,
.popup-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
    opacity: 0;
    transform: translate(-50%, -48%);
}
</style>