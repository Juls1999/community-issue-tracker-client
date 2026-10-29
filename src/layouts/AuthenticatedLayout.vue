<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AuthFooter from '@/components/layouts/authenticated/AuthFooter.vue'
import AppBreadcrumb from '@/components/layouts/authenticated/AppBreadcrumb.vue'

const authStore = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const navigation = [
    {
        label: 'Dashboard',
        to: { name: 'resident-dashboard' },
        icon: 'dashboard',
    },
    {
        label: 'My Reports',
        to: { name: 'resident-reports' },
        icon: 'reports',
    },

]

async function handleLogout() {
    await authStore.logout()
    isSidebarOpen.value = false
    await router.push({ name: 'login' })
}
</script>

<template>
    <div class="min-h-screen bg-bg-page text-text-body">
        <!-- Mobile backdrop -->
        <Transition name="fade">
            <button v-if="isSidebarOpen" type="button" aria-label="Close navigation menu"
                class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="isSidebarOpen = false" />
        </Transition>

        <!-- Sidebar -->
        <aside
            class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-subtle bg-bg-surface transition-transform duration-300 lg:translate-x-0"
            :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'">
            <!-- Brand -->
            <div class="flex h-20 items-center justify-between border-b border-border-subtle px-6">
                <RouterLink to="/" class="flex items-center gap-3" @click="isSidebarOpen = false">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                            <path
                                d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                        </svg>
                    </div>

                    <div>
                        <p class="text-base font-bold text-text-heading">
                            Community Portal
                        </p>
                        <p class="text-xs text-text-muted">Resident workspace</p>
                    </div>
                </RouterLink>

                <button type="button" class="rounded-lg p-2 text-text-muted hover:bg-bg-page lg:hidden"
                    aria-label="Close sidebar" @click="isSidebarOpen = false">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m18 6-12 12M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- User information -->
            <div class="mx-4 mt-6 rounded-xl bg-bg-page p-4">
                <div class="flex items-center gap-3">
                    <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-semibold text-brand">
                        {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                    </div>

                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-text-heading">
                            {{ authStore.user?.name || 'Resident' }}
                        </p>
                        <p class="truncate text-xs text-text-muted">
                            {{ authStore.user?.email || '' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 space-y-2 px-4 py-6">
                <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Menu
                </p>

                <RouterLink v-for="item in navigation" :key="item.label" :to="item.to"
                    class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                    :class="$route.name === item.to.name
                        ? 'bg-brand/10 text-brand'
                        : 'text-text-body hover:bg-bg-page hover:text-text-heading'" @click="isSidebarOpen = false">
                    <!-- Dashboard icon -->
                    <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>

                    <!-- Reports icon -->
                    <svg v-else-if="item.icon === 'reports'" viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none"
                        stroke="currentColor" stroke-width="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 2v6h6M8 13h8M8 17h8" />
                    </svg>

                    <!-- Create issue icon -->
                    <svg v-else viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v8M8 12h8" />
                    </svg>

                    {{ item.label }}
                </RouterLink>
            </nav>

            <!-- Bottom actions -->
            <div class="border-t border-border-subtle p-4">
                <RouterLink to="/"
                    class="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-body transition-colors hover:bg-bg-page"
                    @click="isSidebarOpen = false">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z" />
                    </svg>
                    Visit Homepage
                </RouterLink>

                <button type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    @click="handleLogout">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5M21 12H9" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex min-h-screen flex-col lg:pl-72">
            <!-- Small mobile-only toolbar -->
            <header
                class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border-subtle bg-bg-surface px-4 lg:hidden">
                <button type="button" aria-label="Open navigation menu"
                    class="rounded-lg p-2 text-text-heading hover:bg-bg-page" @click="isSidebarOpen = true">
                    <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <span class="font-semibold text-text-heading">Community Portal</span>
            </header>

            <main class="flex-1 p-4 sm:p-6 lg:p-8">
                <AppBreadcrumb />
                <RouterView />
            </main>

            <AuthFooter />
        </div>
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
</style>
