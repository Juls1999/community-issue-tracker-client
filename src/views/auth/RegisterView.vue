<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'

interface Barangay {
    id: number
    name: string
}

interface RegisterForm {
    name: string
    email: string
    barangay_id: string
    password: string
    passwordConfirmation: string
}

const router = useRouter()

const form = ref<RegisterForm>({
    name: '',
    email: '',
    barangay_id: '',
    password: '',
    passwordConfirmation: '',
})

const barangays = ref<Barangay[]>([])
const loadingBarangays = ref(false)
const submitting = ref(false)

const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const validationErrors = ref<Record<string, string[]>>({})

onMounted(async () => {
    loadingBarangays.value = true

    try {
        // Assumes this endpoint returns { data: [{ id, name }] }
        const response = await axios.get('/api/barangays')
        barangays.value = response.data.data ?? response.data
    } catch {
        errorMessage.value = 'Unable to load barangays. Please refresh the page and try again.'
    } finally {
        loadingBarangays.value = false
    }
})

function getFieldError(field: string): string {
    return validationErrors.value[field]?.[0] ?? ''
}

function validateForm(): boolean {
    validationErrors.value = {}

    if (!form.value.name.trim()) {
        validationErrors.value.name = ['Please enter your full name.']
    }

    if (!form.value.email.trim()) {
        validationErrors.value.email = ['Please enter your email address.']
    }

    if (!form.value.barangay_id) {
        validationErrors.value.barangay_id = ['Please select your barangay.']
    }

    if (!form.value.password) {
        validationErrors.value.password = ['Please enter a password.']
    }

    if (form.value.password !== form.value.passwordConfirmation) {
        validationErrors.value.password_confirmation = [
            'The passwords do not match.',
        ]
    }

    return Object.keys(validationErrors.value).length === 0
}

async function register() {
    if (submitting.value || !validateForm()) return

    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        // Get the CSRF cookie when using Laravel Sanctum SPA authentication.
        await axios.get('/sanctum/csrf-cookie')

        await axios.post('/register', {
            name: form.value.name.trim(),
            email: form.value.email.trim(),
            barangay_id: Number(form.value.barangay_id),
            password: form.value.password,
            password_confirmation: form.value.passwordConfirmation,
        })

        // Assumes successful registration also authenticates the user.
        await router.push({ name: 'resident-dashboard' })
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const response = error.response

            if (response?.status === 422) {
                const errors = response.data?.errors as
                    | Record<string, string[]>
                    | undefined

                if (errors) {
                    validationErrors.value = errors
                    errorMessage.value =
                        'Please check the highlighted fields and try again.'
                } else {
                    errorMessage.value =
                        response.data?.message ?? 'Please check your entries.'
                }
            } else if (response?.status === 419) {
                errorMessage.value =
                    'Your session expired. Please refresh the page and try again.'
            } else {
                errorMessage.value =
                    response?.data?.message ??
                    'Registration failed. Please try again.'
            }
        } else {
            errorMessage.value =
                'Something went wrong. Please try again.'
        }
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <main class="relative isolate flex flex-1 items-center justify-center
               overflow-hidden bg-gradient-to-br from-bg-page via-bg-surface
               to-bg-page px-4 py-10 text-text-body sm:px-6 sm:py-14">
        <!-- Ambient background decoration -->
        <div aria-hidden="true" class="pointer-events-none absolute -left-32 top-0 -z-10
                   h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

        <div aria-hidden="true" class="pointer-events-none absolute -right-32 bottom-0 -z-10
                   h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

        <div class="grid w-full max-w-5xl overflow-hidden rounded-3xl
                    border border-border-subtle bg-bg-surface
                    shadow-xl lg:grid-cols-2">

            <!-- Left information panel -->
            <section class="relative hidden flex-col justify-between overflow-hidden
                       bg-brand p-10 text-brand-foreground lg:flex">
                <div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-24
                           h-72 w-72 rounded-full border border-current/20" />

                <div aria-hidden="true" class="pointer-events-none absolute -bottom-24 -left-20
                           h-80 w-80 rounded-full border border-current/20" />

                <div class="relative">
                    <div class="flex items-center gap-3">
                        <div class="flex h-11 w-11 items-center justify-center
                                   rounded-xl bg-bg-surface/15">
                            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                stroke-width="1.8" aria-hidden="true">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M20 8v6m3-3h-6" />
                            </svg>
                        </div>

                        <span class="text-lg font-bold">
                            Community Issue Tracker
                        </span>
                    </div>

                    <h1 class="mt-16 text-4xl font-bold leading-tight">
                        Be part of a better community.
                    </h1>

                    <p class="mt-5 max-w-sm leading-7 opacity-90">
                        Create your account to report local concerns, track
                        updates, and help your community move toward solutions.
                    </p>
                </div>

                <div class="relative mt-12 space-y-5">
                    <div class="flex items-start gap-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center
                                   rounded-lg bg-bg-surface/15">
                            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"
                                aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                <path d="M14 2v6h6M8 13h8M8 17h5" />
                            </svg>
                        </div>

                        <div>
                            <p class="font-semibold">Report concerns easily</p>
                            <p class="mt-1 text-sm opacity-80">
                                Share issues that matter to your neighborhood.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center
                                   rounded-lg bg-bg-surface/15">
                            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"
                                aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>

                        <div>
                            <p class="font-semibold">Stay informed</p>
                            <p class="mt-1 text-sm opacity-80">
                                Follow report progress in one place.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Registration form -->
            <section class="p-6 sm:p-9 lg:p-10">
                <div class="mx-auto max-w-md">
                    <div class="mb-8">
                        <p class="text-sm font-semibold uppercase
                                  tracking-widest text-brand">
                            Get started
                        </p>

                        <h2 class="mt-2 text-3xl font-bold tracking-tight
                                   text-text-heading">
                            Create your account
                        </h2>

                        <p class="mt-2 text-sm leading-6 text-text-muted">
                            Enter your details to join your community.
                        </p>
                    </div>

                    <!-- General error -->
                    <div v-if="errorMessage" role="alert" class="mb-5 rounded-xl border border-red-500/30
                               bg-red-500/10 p-3 text-sm text-red-600
                               dark:text-red-400">
                        {{ errorMessage }}
                    </div>

                    <div v-if="successMessage" role="status" class="mb-5 rounded-xl border border-brand/30
                               bg-brand/10 p-3 text-sm text-text-body">
                        {{ successMessage }}
                    </div>

                    <form class="space-y-5" @submit.prevent="register">
                        <!-- Name -->
                        <div>
                            <label for="name" class="mb-2 block text-sm font-medium
                                       text-text-heading">
                                Full name
                            </label>

                            <div class="relative">
                                <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-3.5
                                           top-1/2 h-5 w-5 -translate-y-1/2
                                           text-text-muted" fill="none" stroke="currentColor" stroke-width="1.8"
                                    aria-hidden="true">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                                </svg>

                                <input id="name" v-model="form.name" name="name" type="text" autocomplete="name"
                                    placeholder="Enter your full name" required :aria-invalid="!!getFieldError('name')"
                                    class="w-full rounded-xl border border-border-subtle
                                           bg-bg-page py-3 pl-11 pr-4
                                           text-text-heading outline-none
                                           transition placeholder:text-text-muted/70
                                           focus:border-brand focus:ring-2
                                           focus:ring-brand/20" />
                            </div>

                            <p v-if="getFieldError('name')" class="mt-1.5 text-sm text-red-600
                                       dark:text-red-400">
                                {{ getFieldError('name') }}
                            </p>
                        </div>

                        <!-- Email -->
                        <div>
                            <label for="email" class="mb-2 block text-sm font-medium
                                       text-text-heading">
                                Email address
                            </label>

                            <div class="relative">
                                <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-3.5
                                           top-1/2 h-5 w-5 -translate-y-1/2
                                           text-text-muted" fill="none" stroke="currentColor" stroke-width="1.8"
                                    aria-hidden="true">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3 7 9 6 9-6" />
                                </svg>

                                <input id="email" v-model="form.email" name="email" type="email" autocomplete="email"
                                    placeholder="you@example.com" required :aria-invalid="!!getFieldError('email')"
                                    class="w-full rounded-xl border border-border-subtle
                                           bg-bg-page py-3 pl-11 pr-4
                                           text-text-heading outline-none
                                           transition placeholder:text-text-muted/70
                                           focus:border-brand focus:ring-2
                                           focus:ring-brand/20" />
                            </div>

                            <p v-if="getFieldError('email')" class="mt-1.5 text-sm text-red-600
                                       dark:text-red-400">
                                {{ getFieldError('email') }}
                            </p>
                        </div>

                        <!-- Barangay -->
                        <div>
                            <label for="barangay_id" class="mb-2 block text-sm font-medium
                                       text-text-heading">
                                Barangay
                            </label>

                            <select id="barangay_id" v-model="form.barangay_id" name="barangay_id" required
                                :disabled="loadingBarangays || barangays.length === 0"
                                :aria-invalid="!!getFieldError('barangay_id')" class="w-full rounded-xl border border-border-subtle
                                       bg-bg-page px-4 py-3 text-text-heading
                                       outline-none transition
                                       focus:border-brand focus:ring-2
                                       focus:ring-brand/20
                                       disabled:cursor-not-allowed
                                       disabled:opacity-60">
                                <option value="" disabled>
                                    {{
                                        loadingBarangays
                                            ? 'Loading barangays...'
                                            : barangays.length
                                                ? 'Select your barangay'
                                                : 'No barangays available'
                                    }}
                                </option>

                                <option v-for="barangay in barangays" :key="barangay.id" :value="String(barangay.id)">
                                    {{ barangay.name }}
                                </option>
                            </select>

                            <p v-if="getFieldError('barangay_id')" class="mt-1.5 text-sm text-red-600
                                       dark:text-red-400">
                                {{ getFieldError('barangay_id') }}
                            </p>
                        </div>

                        <!-- Password -->
                        <div>
                            <label for="password" class="mb-2 block text-sm font-medium
                                       text-text-heading">
                                Password
                            </label>

                            <div class="relative">
                                <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-3.5
                                           top-1/2 h-5 w-5 -translate-y-1/2
                                           text-text-muted" fill="none" stroke="currentColor" stroke-width="1.8"
                                    aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>

                                <input id="password" v-model="form.password" name="password"
                                    :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                                    placeholder="Create a password" required :aria-invalid="!!getFieldError('password')"
                                    class="w-full rounded-xl border border-border-subtle
                                           bg-bg-page py-3 pl-11 pr-12
                                           text-text-heading outline-none
                                           transition placeholder:text-text-muted/70
                                           focus:border-brand focus:ring-2
                                           focus:ring-brand/20" />

                                <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'"
                                    :aria-pressed="showPassword" class="absolute right-3 top-1/2
                                           -translate-y-1/2 rounded-md
                                           p-1.5 text-text-muted
                                           transition hover:text-brand
                                           focus:outline-none focus:ring-2
                                           focus:ring-brand/30" @click="showPassword = !showPassword">
                                    <svg v-if="!showPassword" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                                        stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>

                                    <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                                        stroke-width="1.8" aria-hidden="true">
                                        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path
                                            d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
                                    </svg>
                                </button>
                            </div>

                            <p v-if="getFieldError('password')" class="mt-1.5 text-sm text-red-600
                                       dark:text-red-400">
                                {{ getFieldError('password') }}
                            </p>
                        </div>

                        <!-- Confirm password -->
                        <div>
                            <label for="passwordConfirmation" class="mb-2 block text-sm font-medium
                                       text-text-heading">
                                Confirm password
                            </label>

                            <div class="relative">
                                <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-3.5
                                           top-1/2 h-5 w-5 -translate-y-1/2
                                           text-text-muted" fill="none" stroke="currentColor" stroke-width="1.8"
                                    aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>

                                <input id="passwordConfirmation" v-model="form.passwordConfirmation"
                                    name="password_confirmation" :type="showPasswordConfirmation ? 'text' : 'password'"
                                    autocomplete="new-password" placeholder="Re-enter your password" required
                                    :aria-invalid="!!getFieldError('password_confirmation')" class="w-full rounded-xl border border-border-subtle
                                           bg-bg-page py-3 pl-11 pr-12
                                           text-text-heading outline-none
                                           transition placeholder:text-text-muted/70
                                           focus:border-brand focus:ring-2
                                           focus:ring-brand/20" />

                                <button type="button"
                                    :aria-label="showPasswordConfirmation ? 'Hide confirmation password' : 'Show confirmation password'"
                                    :aria-pressed="showPasswordConfirmation" class="absolute right-3 top-1/2
                                           -translate-y-1/2 rounded-md
                                           p-1.5 text-text-muted
                                           transition hover:text-brand
                                           focus:outline-none focus:ring-2
                                           focus:ring-brand/30"
                                    @click="showPasswordConfirmation = !showPasswordConfirmation">
                                    <svg v-if="!showPasswordConfirmation" viewBox="0 0 24 24" class="h-5 w-5"
                                        fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>

                                    <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                                        stroke-width="1.8" aria-hidden="true">
                                        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path
                                            d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
                                    </svg>
                                </button>
                            </div>

                            <p v-if="getFieldError('password_confirmation')" class="mt-1.5 text-sm text-red-600
                                       dark:text-red-400">
                                {{ getFieldError('password_confirmation') }}
                            </p>
                        </div>

                        <button type="submit" :disabled="submitting || loadingBarangays || barangays.length === 0"
                            class="flex w-full items-center justify-center gap-2
                                   rounded-xl bg-brand px-5 py-3.5
                                   font-semibold text-brand-foreground
                                   transition hover:opacity-90
                                   focus:outline-none focus:ring-2
                                   focus:ring-brand focus:ring-offset-2
                                   disabled:cursor-not-allowed disabled:opacity-60">
                            <svg v-if="submitting" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"
                                aria-hidden="true">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                            </svg>

                            {{ submitting ? 'Creating account...' : 'Create Account' }}
                        </button>
                    </form>

                    <p class="mt-7 text-center text-sm text-text-muted">
                        Already have an account?
                        <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand transition hover:underline">
                            Sign in
                        </RouterLink>
                    </p>

                    <p class="mt-6 text-center text-xs leading-5 text-text-muted">
                        By creating an account, you agree to use this platform
                        responsibly and provide accurate information.
                    </p>
                </div>
            </section>
        </div>
    </main>
</template>
