<script setup lang="ts">
import { useNotifications } from '@/composables/useNotification'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const page = ref(1)

const {
    notifications,
    notificationsQuery,
    pagination,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
} = useNotifications(page)

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date))
}

function goToPage(nextPage: number) {
    if (
        nextPage >= 1 &&
        nextPage <= (pagination.value?.last_page ?? 1)
    ) {
        page.value = nextPage
    }
}



const router = useRouter()

function openNotification(notification: (typeof notifications.value)[number]) {
    if (!notification.read_at) {
        markAsRead(notification.id)
    }

    router.push({
        name: 'issueDiscussion',
        params: { uuid: notification.data.issue_uuid },
    })
}
</script>

<template>
    <main class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">
                    Notifications
                </h1>
                <p class="mt-1 text-sm text-text-muted">
                    Stay updated on your submitted reports.
                </p>
            </div>

            <button v-if="unreadCount > 0" type="button"
                class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                :disabled="isMarkingAllAsRead" @click="markAllAsRead()">
                Mark all as read
            </button>
        </header>

        <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
            <div v-if="notificationsQuery.isPending.value" class="p-10 text-center text-sm text-text-muted">
                Loading notifications...
            </div>

            <div v-else-if="notifications.length === 0" class="p-12 text-center">
                <h2 class="font-semibold text-text-heading">
                    No notifications yet
                </h2>
                <p class="mt-2 text-sm text-text-muted">
                    We'll let you know when there's an update on your reports.
                </p>
            </div>

            <div v-else>
                <button v-for="notification in notifications" :key="notification.id" type="button"
                    class="flex w-full items-start gap-4 border-b border-border-subtle p-5 text-left transition last:border-b-0 hover:bg-bg-page"
                    :class="{ 'bg-brand/5': !notification.read_at }" @click="openNotification(notification)">
                    <!-- Unread indicator -->
                    <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        :class="notification.read_at ? 'bg-transparent' : 'bg-brand'"></span>

                    <span class="min-w-0 flex-1">
                        <span class="block font-medium text-text-heading">
                            {{ notification.data.issue_title }}
                        </span>

                        <span class="mt-1 block text-sm text-text-body">
                            {{ notification.data.message }}
                        </span>

                        <span class="mt-2 block text-xs text-text-muted">
                            {{ formatDate(notification.created_at) }}
                        </span>
                    </span>

                    <span v-if="!notification.read_at" class="shrink-0 text-xs font-medium text-brand">
                        New
                    </span>
                </button>
            </div>
        </section>

        <div v-if="pagination && pagination.last_page > 1"
            class="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p class="text-sm text-text-muted">
                Page {{ pagination.current_page }} of {{ pagination.last_page }}
                · {{ pagination.total }} notifications
            </p>

            <div class="flex gap-2">
                <button type="button"
                    class="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-body disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="page <= 1" @click="goToPage(page - 1)">
                    Previous
                </button>

                <button type="button"
                    class="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-body disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="page >= pagination.last_page" @click="goToPage(page + 1)">
                    Next
                </button>
            </div>
        </div>
    </main>
</template>