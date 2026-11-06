<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { authService } from '@/services/authService'
import { type UpdateUserParams, type User } from '@/types'
import { profileService } from '@/services/profileService'
import { AlertCircle, Loader, LoaderCircle, LockKeyhole, User2Icon } from 'lucide-vue-next'
import Swal from 'sweetalert2'


const queryClient = useQueryClient()

const isDirty = computed(() => {
    if (!profile.value) return false

    return (
        profileForm.firstName !== profile.value.firstName ||
        profileForm.middleName !== (profile.value.middleName ?? '') ||
        profileForm.lastName !== profile.value.lastName ||
        profileForm.phoneNumber !== (profile.value.phoneNumber ?? '')
    )
})

// Fetch profile
const {
    data: profile,
    isPending,
    isError,
} = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () =>
        authService.getAuthenticatedUser(),
    staleTime: Infinity
})

// Profile form
const profileForm = reactive<UpdateUserParams>({
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
})

watch(
    profile,
    (user) => {
        if (!user) return

        profileForm.firstName = user.firstName
        profileForm.middleName = user.middleName ?? ''
        profileForm.lastName = user.lastName
        profileForm.phoneNumber = user.phoneNumber ?? ''
    },
    { immediate: true },
)

// Update profile
const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,

    onSuccess: (updatedUser) => {
        queryClient.setQueryData<User>(
            ['auth', 'user'],
            (oldData) => {
                if (!oldData) return oldData

                return {
                    ...oldData,
                    ...updatedUser,
                }
            }
        )

        Swal.fire({
            title: 'Profile Updated!',
            text: 'Your personal information has been successfully updated.',
            icon: 'success',
            confirmButtonText: 'Okay',
            confirmButtonColor: '#2563eb',
        })
    },

    onError: () => {
        Swal.fire({
            title: 'Update Failed',
            text: 'Something went wrong while updating your profile. Please try again.',
            icon: 'error',
            confirmButtonText: 'Okay',
        })
    },
})

// Change password
const passwordForm = reactive({
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
})

const changePasswordMutation = useMutation({
    mutationFn: profileService.updatePassword,

    onSuccess: () => {
        passwordForm.currentPassword = ''
        passwordForm.password = ''
        passwordForm.passwordConfirmation = ''
    },
})


const saveProfile = async () => {
    if (!isDirty.value) return

    const result = await Swal.fire({
        title: 'Confirm Profile Update',
        text: 'Are you sure you want to save your changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update profile',
        cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    updateProfileMutation.mutate({
        firstName: profileForm.firstName,
        middleName: profileForm.middleName || null,
        lastName: profileForm.lastName,
        phoneNumber: profileForm.phoneNumber,
    })
}

const changePassword = () => {
    changePasswordMutation.mutate({
        ...passwordForm,
    })
}
</script>


<template>
    <main class="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">

        <!-- Page heading -->
        <header>
            <h1 class="text-2xl font-bold text-text-heading">
                Account Settings
            </h1>
            <p class="mt-1 text-sm text-text-muted">
                Manage your personal information and account security.
            </p>
        </header>

        <!-- Loading state -->
        <div v-if="isPending" class="rounded-xl border border-border-subtle bg-bg-surface p-8 text-center">
            <p class="text-sm text-text-muted">
                Loading your profile...
            </p>
        </div>

        <!-- Error state -->
        <div v-else-if="isError || !profile" class="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <div class="flex items-center gap-3">
                <AlertCircle />
                <div>
                    <h2 class="font-semibold text-text-heading">
                        Unable to load profile
                    </h2>
                    <p class="mt-1 text-sm text-text-muted">
                        Please try again later.
                    </p>
                </div>
            </div>
        </div>

        <template v-else>

            <!-- Profile information -->
            <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
                <div class="border-b border-border-subtle p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <User2Icon />
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-text-heading">
                                Personal Information
                            </h2>
                            <p class="text-sm text-text-muted">
                                Update your personal details.
                            </p>
                        </div>
                    </div>
                </div>

                <form @submit.prevent="saveProfile" class="space-y-6 p-6">

                    <!-- Name fields -->
                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label class="mb-2 block text-sm font-medium text-text-body">
                                First Name
                            </label>
                            <input v-model="profileForm.firstName" type="text" required maxlength="100"
                                class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                                placeholder="Enter first name" />
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-medium text-text-body">
                                Middle Name
                            </label>
                            <input v-model="profileForm.middleName" type="text" maxlength="100"
                                class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                                placeholder="Enter middle name" />
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-medium text-text-body">
                                Last Name
                            </label>
                            <input v-model="profileForm.lastName" type="text" required maxlength="100"
                                class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                                placeholder="Enter last name" />
                        </div>

                        <div>
                            <label class="mb-2 block text-sm font-medium text-text-body">
                                Phone Number
                            </label>
                            <input v-model="profileForm.phoneNumber" type="tel" maxlength="11"
                                class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                                placeholder="Enter phone number" />
                        </div>
                    </div>


                    <!-- Read-only email -->
                    <div>
                        <label class="mb-2 block text-sm font-medium text-text-body">
                            Email Address
                        </label>
                        <input :value="profile.email" type="email" disabled
                            class="w-full cursor-not-allowed rounded-lg border border-border-subtle bg-bg-page/60 px-4 py-2.5 text-sm text-text-muted" />
                        <p class="mt-1.5 text-xs text-text-muted">
                            Email address cannot be changed from this page.
                        </p>
                    </div>

                    <!-- Profile save -->
                    <div class="flex justify-end border-t border-border-subtle pt-5">
                        <button type="submit" :disabled="!isDirty || updateProfileMutation.isPending.value"
                            class="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
                            <LoaderCircle v-if="updateProfileMutation.isPending.value" class="animate-spin" />

                            {{ updateProfileMutation.isPending.value
                                ? 'Saving...'
                                : 'Save Changes'
                            }}
                        </button>
                    </div>
                </form>
            </section>

            <!-- Account information -->
            <section class="rounded-xl border border-border-subtle bg-bg-surface p-6">
                <h2 class="text-lg font-semibold text-text-heading">
                    Account Information
                </h2>

                <p class="mt-1 text-sm text-text-muted">
                    Your account details and verification status.
                </p>

                <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <p class="text-xs text-text-muted">Account Role</p>
                        <p class="mt-1 font-medium capitalize text-text-heading">
                            {{ profile.role?.name ?? 'Resident' }}
                        </p>
                    </div>

                    <div>
                        <p class="text-xs text-text-muted">Verification Status</p>
                        <span class="mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="profile.isVerified
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-yellow-500/10 text-yellow-600'">
                            {{ profile.isVerified ? 'Verified' : 'Not verified' }}
                        </span>
                    </div>

                    <div>
                        <p class="text-xs text-text-muted">Member Since</p>
                        <p class="mt-1 font-medium text-text-heading">
                            {{ new Date(profile.createdAt).toLocaleDateString() }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- Change password -->
            <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
                <div class="border-b border-border-subtle p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <LockKeyhole />
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-text-heading">
                                Change Password
                            </h2>
                            <p class="text-sm text-text-muted">
                                Keep your account secure with a strong password.
                            </p>
                        </div>
                    </div>
                </div>

                <form @submit.prevent="changePassword" class="space-y-5 p-6">

                    <div>
                        <label class="mb-2 block text-sm font-medium text-text-body">
                            Current Password
                        </label>
                        <input v-model="passwordForm.currentPassword" type="password" required
                            autocomplete="current-password"
                            class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                            placeholder="Enter current password" />
                    </div>

                    <div>
                        <label class="mb-2 block text-sm font-medium text-text-body">
                            New Password
                        </label>
                        <input v-model="passwordForm.password" type="password" required minlength="8"
                            autocomplete="new-password"
                            class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                            placeholder="Enter new password" />
                    </div>

                    <div>
                        <label class="mb-2 block text-sm font-medium text-text-body">
                            Confirm New Password
                        </label>
                        <input v-model="passwordForm.passwordConfirmation" type="password" required minlength="8"
                            autocomplete="new-password"
                            class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-2.5 text-sm text-text-body outline-none transition focus:border-brand"
                            placeholder="Confirm new password" />
                    </div>

                    <div class="flex justify-end border-t border-border-subtle pt-5">
                        <button type="submit" :disabled="changePasswordMutation.isPending.value"
                            class="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60">
                            <Loader v-if="changePasswordMutation.isPending.value" name="loader-circle" />
                            {{ changePasswordMutation.isPending.value
                                ? 'Updating...'
                                : 'Update Password'
                            }}
                        </button>
                    </div>
                </form>
            </section>

        </template>
    </main>
</template>
