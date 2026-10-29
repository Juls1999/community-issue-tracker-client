<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const menuOpen = ref(false)
const route = useRoute()

const isActive = (path: string) => route.path === path
</script>

<template>
    <header class="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-xl">
        <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
            aria-label="Main navigation">
            <!-- Brand -->
            <RouterLink to="/" class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-hero text-white shadow-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6"
                        aria-hidden="true">
                        <path d="M12 3 20 7v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4Z" stroke-linejoin="round" />
                        <path d="m8.5 12 2.2 2.2 4.8-5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

                <div>
                    <span class="block text-base font-bold tracking-tight text-text-heading sm:text-lg">
                        Community Portal
                    </span>
                    <span class="block text-xs text-text-muted">
                        Local Issue Tracker
                    </span>
                </div>
            </RouterLink>

            <!-- Desktop navigation -->
            <div class="hidden items-center gap-7 md:flex">
                <RouterLink to="/" class="text-sm font-medium transition hover:text-brand-dark"
                    :class="isActive('/') ? 'text-brand-dark' : 'text-text-body'">
                    Home
                </RouterLink>

                <a href="/#how-it-works" class="text-sm font-medium text-text-body transition hover:text-brand-dark">
                    How It Works
                </a>

                <div class="ml-2 flex items-center gap-3">
                    <RouterLink to="/signin"
                        class="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-heading transition hover:bg-brand/10">
                        Sign In
                    </RouterLink>

                    <RouterLink to="/register"
                        class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">
                        Get Started
                    </RouterLink>
                </div>
            </div>

            <!-- Mobile menu button -->
            <button type="button"
                class="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle text-text-heading transition hover:bg-bg-page md:hidden"
                :aria-expanded="menuOpen" aria-label="Toggle navigation menu" @click="menuOpen = !menuOpen">
                <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="h-5 w-5">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" />
                </svg>
            </button>
        </nav>

        <!-- Mobile navigation -->
        <div v-if="menuOpen" class="border-t border-border-subtle bg-bg-surface px-4 py-4 md:hidden">
            <div class="mx-auto flex max-w-7xl flex-col gap-2">
                <RouterLink to="/" class="rounded-lg px-3 py-3 text-sm font-medium text-text-heading hover:bg-bg-page"
                    @click="menuOpen = false">
                    Home
                </RouterLink>

                <a href="/#how-it-works"
                    class="rounded-lg px-3 py-3 text-sm font-medium text-text-heading hover:bg-bg-page"
                    @click="menuOpen = false">
                    How It Works
                </a>

                <div class="mt-2 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
                    <RouterLink to="/signin"
                        class="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-text-heading"
                        @click="menuOpen = false">
                        Sign In
                    </RouterLink>
                    <RouterLink to="/register"
                        class="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground"
                        @click="menuOpen = false">
                        Register
                    </RouterLink>
                </div>
            </div>
        </div>
    </header>
</template>
