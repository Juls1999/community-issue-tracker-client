```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const formData = reactive({
    email: '',
    password: '',
})

const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

const handleLogin = async () => {
    if (isLoading.value) return

    isLoading.value = true
    loginError.value = ''

    try {
        await authStore.login(formData)

        const redirect = router.currentRoute.value.query.redirect

        await router.push(
            typeof redirect === 'string'
                ? redirect
                : { name: 'resident-dashboard' },
        )
    } catch {
        formData.password = ''
        loginError.value =
            'Unable to sign in. Please check your credentials and try again.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <main
        class="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-page px-4 py-8 sm:px-6 lg:px-8">
        <!-- Decorative background -->
        <div class="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand opacity-10 blur-3xl"
            aria-hidden="true" />

        <div class="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent opacity-10 blur-3xl"
            aria-hidden="true" />

        <div
            class="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-xl lg:grid-cols-2">
            <!-- Left branding panel -->
            <section
                class="relative hidden flex-col justify-between overflow-hidden bg-hero p-10 text-white lg:flex xl:p-12">
                <!-- Decorative circles -->
                <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/20"
                    aria-hidden="true" />
                <div class="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/20"
                    aria-hidden="true" />
                <div class="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
                    aria-hidden="true" />

                <!-- Brand -->
                <div class="relative z-10 flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-sm backdrop-blur-sm"
                        aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8" class="h-7 w-7">
                            <path d="M12 3 20 7v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4Z" stroke-linejoin="round" />
                            <path d="m8.5 12 2.2 2.2 4.8-5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div>
                        <p class="text-lg font-bold tracking-tight">
                            Community Portal
                        </p>
                        <p class="text-sm text-white/80">
                            Local Community Issue Tracker
                        </p>
                    </div>
                </div>

                <!-- Hero content -->
                <div class="relative z-10 my-12">
                    <span
                        class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
                        <span class="h-2 w-2 rounded-full bg-white" />
                        YOUR COMMUNITY, YOUR VOICE
                    </span>

                    <h1 class="max-w-md text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                        Together, we can build a better community.
                    </h1>

                    <p class="mt-5 max-w-md text-base leading-7 text-white/85">
                        Report local concerns, stay informed, and help make your
                        community a safer and better place for everyone.
                    </p>

                    <!-- Feature highlights -->
                    <div class="mt-9 space-y-5">
                        <div class="flex items-start gap-3">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15"
                                aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" stroke-linejoin="round" />
                                    <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>

                            <div>
                                <p class="font-semibold text-white">
                                    Report community issues
                                </p>
                                <p class="mt-1 text-sm leading-5 text-white/75">
                                    Help bring local concerns to the right people.
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15"
                                aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                                    <path d="M8 6h13M8 12h13M8 18h13" stroke-linecap="round" />
                                    <path d="M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round" stroke-width="3" />
                                </svg>
                            </div>

                            <div>
                                <p class="font-semibold text-white">
                                    Track your reports
                                </p>
                                <p class="mt-1 text-sm leading-5 text-white/75">
                                    Stay updated as your concerns are addressed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="relative z-10 text-xs text-white/75">
                    Building stronger communities, one report at a time.
                </p>
            </section>

            <!-- Right login panel -->
            <section class="flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
                <!-- Mobile branding -->
                <div class="mb-9 flex items-center gap-3 lg:hidden">
                    <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-hero text-white shadow-brand"
                        aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8" class="h-6 w-6">
                            <path d="M12 3 20 7v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4Z" stroke-linejoin="round" />
                            <path d="m8.5 12 2.2 2.2 4.8-5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div>
                        <p class="font-bold text-text-heading">
                            Community Portal
                        </p>
                        <p class="text-xs text-text-muted">
                            Local Community Issue Tracker
                        </p>
                    </div>
                </div>

                <!-- Form heading -->
                <div class="mb-8">
                    <p class="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">
                        Welcome back
                    </p>

                    <h2 class="text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
                        Sign in to your account
                    </h2>

                    <p class="mt-3 text-sm leading-6 text-text-muted">
                        Enter your credentials to access your community dashboard.
                    </p>
                </div>

                <!-- Login error -->
                <div v-if="loginError" role="alert"
                    class="mb-6 flex items-start gap-3 rounded-xl border border-error/30 bg-error-light/15 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8" class="mt-0.5 h-5 w-5 shrink-0 text-error">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4m0 4h.01" stroke-linecap="round" />
                    </svg>

                    <p class="text-sm leading-5 text-error">
                        {{ loginError }}
                    </p>
                </div>

                <!-- Login form -->
                <form class="space-y-5" @submit.prevent="handleLogin">
                    <!-- Email -->
                    <div>
                        <label for="email" class="mb-2 block text-sm font-semibold text-text-heading">
                            Email address
                        </label>

                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted"
                                aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3 7 9 6 9-6" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>

                            <input id="email" v-model="formData.email" type="email" name="email"
                                placeholder="you@example.com" autocomplete="email" required :disabled="isLoading"
                                class="w-full rounded-xl border border-input-border bg-input-bg py-3.5 pl-12 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-muted/70 hover:border-border-strong focus:border-input-focus focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60" />
                        </div>
                    </div>

                    <!-- Password -->
                    <div>
                        <div class="mb-2 flex items-center justify-between">
                            <label for="password" class="block text-sm font-semibold text-text-heading">
                                Password
                            </label>
                        </div>

                        <div class="relative">
                            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted"
                                aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                                    <rect x="4" y="10" width="16" height="11" rx="2" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke-linecap="round" />
                                </svg>
                            </div>

                            <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                                name="password" placeholder="Enter your password" autocomplete="current-password"
                                required :disabled="isLoading"
                                class="w-full rounded-xl border border-input-border bg-input-bg py-3.5 pl-12 pr-12 text-sm text-text-heading outline-none transition placeholder:text-text-muted/70 hover:border-border-strong focus:border-input-focus focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60" />

                            <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'"
                                :aria-pressed="showPassword" :disabled="isLoading"
                                class="absolute inset-y-0 right-0 flex items-center px-4 text-text-muted transition hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed"
                                @click="showPassword = !showPassword">
                                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5"
                                    aria-hidden="true">
                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
                                        stroke-linejoin="round" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>

                                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
                                    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke-linecap="round" />
                                    <path
                                        d="M9.9 5.2A11 11 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Submit -->
                    <button type="submit" :disabled="isLoading"
                        class="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-brand-foreground shadow-brand transition duration-200 hover:bg-brand-dark hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none">
                        <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" class="h-5 w-5 animate-spin" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke-opacity=".25" />
                            <path d="M21 12a9 9 0 0 0-9-9" stroke-linecap="round" />
                        </svg>

                        <span>
                            {{ isLoading ? 'Signing in...' : 'Sign In' }}
                        </span>

                        <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8"
                            class="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true">
                            <path d="M5 12h14m-7-7 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </form>

                <!-- Footer -->
                <div class="mt-8 border-t border-border-subtle pt-6">
                    <div class="flex items-center justify-center gap-2 text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.7" class="h-4 w-4 shrink-0" aria-hidden="true">
                            <rect x="4" y="10" width="16" height="11" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke-linecap="round" />
                        </svg>

                        <p class="text-center text-xs leading-5">
                            Your account is protected by secure authentication.
                        </p>
                    </div>

                    <p class="mt-4 text-center text-xs text-text-muted">
                        &copy; {{ new Date().getFullYear() }} Community Portal.
                        All rights reserved.
                    </p>
                </div>
            </section>
        </div>
    </main>
</template>
```