<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const menuOpen = ref(false)
const profileOpen = ref(false)
const isLoggingOut = ref(false)

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await authStore.logout()
    await router.push({ name: 'home' })
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-xl">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      aria-label="Authenticated navigation">
      <!-- Brand -->
      <RouterLink :to="{ name: 'resident-dashboard' }" class="flex shrink-0 items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-hero text-white shadow-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6"
            aria-hidden="true">
            <path d="M12 3 20 7v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4Z" stroke-linejoin="round" />
            <path d="m8.5 12 2.2 2.2 4.8-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <div>
          <span class="block text-base font-bold tracking-tight text-text-heading">
            Community Portal
          </span>
          <span class="hidden text-xs text-text-muted sm:block">
            Resident Dashboards
          </span>
        </div>
      </RouterLink>

      <!-- Desktop navigation -->
      <div class="hidden items-center gap-2 md:flex">
        <RouterLink :to="{ name: 'resident-dashboard' }"
          class="rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-brand/10 hover:text-brand-dark"
          active-class="bg-brand/10 text-brand-dark">
          Dashboard
        </RouterLink>

        <!-- Update these paths to match your router -->
        <RouterLink to="/issues"
          class="rounded-xl px-4 py-2.5 text-sm font-medium text-text-body transition hover:bg-brand/10 hover:text-brand-dark"
          active-class="bg-brand/10 text-brand-dark">
          My Reports
        </RouterLink>
      </div>

      <!-- Profile menu -->
      <div class="relative hidden md:block">
        <button type="button"
          class="flex items-center gap-3 rounded-xl border border-border-subtle px-3 py-2 transition hover:bg-bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          :aria-expanded="profileOpen" @click="profileOpen = !profileOpen">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-dark">
            {{ (authStore.user?.name || 'Resident').charAt(0).toUpperCase() }}
          </div>

          <div class="max-w-36 text-left">
            <p class="truncate text-sm font-semibold text-text-heading">
              {{ authStore.user?.name || 'Resident' }}
            </p>
            <p class="text-xs text-text-muted">Resident account</p>
          </div>

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 text-text-muted"
            aria-hidden="true">
            <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div v-if="profileOpen"
          class="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border-subtle bg-bg-surface p-2 shadow-xl">
          <div class="border-b border-border-subtle px-3 py-3">
            <p class="truncate text-sm font-semibold text-text-heading">
              {{ authStore.user?.name || 'Resident' }}
            </p>
            <p class="truncate text-xs text-text-muted">
              {{ authStore.user?.email || '' }}
            </p>
          </div>

          <RouterLink to="/profile"
            class="mt-2 block rounded-lg px-3 py-2.5 text-sm text-text-body transition hover:bg-bg-page"
            @click="profileOpen = false">
            My Profile
          </RouterLink>

          <button type="button"
            class="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition hover:bg-error-light/20 disabled:opacity-60"
            :disabled="isLoggingOut" @click="handleLogout">
            {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
      </div>

      <!-- Mobile menu toggle -->
      <button type="button"
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle text-text-heading hover:bg-bg-page md:hidden"
        :aria-expanded="menuOpen" aria-label="Toggle navigation menu" @click="menuOpen = !menuOpen">
        <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
          <path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" />
        </svg>
      </button>
    </nav>

    <!-- Mobile navigation -->
    <div v-if="menuOpen" class="border-t border-border-subtle bg-bg-surface px-4 py-4 md:hidden">
      <div class="mx-auto max-w-7xl space-y-2">
        <div class="mb-3 flex items-center gap-3 border-b border-border-subtle pb-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 font-bold text-brand-dark">
            {{ (authStore.user?.name || 'Resident').charAt(0).toUpperCase() }}
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

        <RouterLink :to="{ name: 'resident-dashboard' }"
          class="block rounded-xl px-3 py-3 text-sm font-medium text-text-heading hover:bg-brand/10"
          @click="menuOpen = false">
          Dashboard
        </RouterLink>

        <RouterLink to="/issues"
          class="block rounded-xl px-3 py-3 text-sm font-medium text-text-heading hover:bg-brand/10"
          @click="menuOpen = false">
          My Reports
        </RouterLink>

        <RouterLink to="/profile"
          class="block rounded-xl px-3 py-3 text-sm font-medium text-text-heading hover:bg-brand/10"
          @click="menuOpen = false">
          My Profile
        </RouterLink>

        <button type="button"
          class="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-error hover:bg-error-light/20 disabled:opacity-60"
          :disabled="isLoggingOut" @click="handleLogout">
          {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
        </button>
      </div>
    </div>
  </header>
</template>
