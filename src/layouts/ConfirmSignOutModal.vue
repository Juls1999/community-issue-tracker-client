<script setup lang="ts">
defineProps<{
    open: boolean
    loading?: boolean
}>()

const emit = defineEmits<{
    confirm: []
    cancel: []
}>()
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center
                       bg-black/50 p-4 backdrop-blur-sm">
                <Transition appear enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-3 scale-95 opacity-0"
                    enter-to-class="translate-y-0 scale-100 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 scale-100 opacity-100"
                    leave-to-class="translate-y-3 scale-95 opacity-0">
                    <section v-if="open" role="alertdialog" aria-modal="true" aria-labelledby="signout-title"
                        aria-describedby="signout-description" class="w-full max-w-md rounded-2xl border
                               border-border-subtle bg-bg-surface p-6
                               shadow-2xl sm:p-7">
                        <div class="mx-auto flex h-14 w-14 items-center
                                   justify-center rounded-full bg-brand/10
                                   text-brand">
                            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor"
                                stroke-width="1.8" aria-hidden="true">
                                <path d="M10 17l5-5-5-5m5 5H3" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div class="mt-5 text-center">
                            <h2 id="signout-title" class="text-xl font-bold text-text-heading">
                                Sign out of your account?
                            </h2>

                            <p id="signout-description" class="mt-2 text-sm leading-6 text-text-muted">
                                Are you sure you want to sign out? You may need
                                to sign in again to access your account.
                            </p>
                        </div>

                        <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                            <button type="button" :disabled="loading" class="flex-1 rounded-xl border
                                       border-border-subtle bg-bg-page
                                       px-4 py-3 text-sm font-semibold
                                       text-text-heading transition
                                       hover:border-brand hover:text-brand
                                       focus:outline-none focus:ring-2
                                       focus:ring-brand/30
                                       disabled:cursor-not-allowed
                                       disabled:opacity-50" @click="emit('cancel')">
                                Cancel
                            </button>

                            <button type="button" :disabled="loading" class="flex flex-1 items-center
                                       justify-center gap-2 rounded-xl
                                       bg-brand px-4 py-3 text-sm
                                       font-semibold text-brand-foreground
                                       transition hover:opacity-90
                                       focus:outline-none focus:ring-2
                                       focus:ring-brand/50
                                       disabled:cursor-not-allowed
                                       disabled:opacity-60" @click="emit('confirm')">
                                <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
                                    aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                        class="opacity-25" />
                                    <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4"
                                        stroke-linecap="round" />
                                </svg>

                                {{ loading ? 'Signing out...' : 'Sign Out' }}
                            </button>
                        </div>
                    </section>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
