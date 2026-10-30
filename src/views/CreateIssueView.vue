<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import { issueService } from '@/services/issueService'
import { useAuthStore } from '@/stores/authStore'

interface Category {
    id: number
    name: string
}

const authStore = useAuthStore()
const router = useRouter()

const categories = ref<Category[]>([])
const title = ref('')
const description = ref('')
const categoryId = ref('')
const priority = ref<'low' | 'medium' | 'high' | 'urgent'>('medium')

const loadingCategories = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
    try {
        const response = await axios.get('/api/issue-categories')
        categories.value = response.data.data
    } catch {
        errorMessage.value = 'Unable to load issue categories.'
    } finally {
        loadingCategories.value = false
    }
})

async function submitIssue() {
    if (submitting.value) return

    submitting.value = true
    errorMessage.value = ''

    try {
        const issue = await issueService.createIssue({
            title: title.value.trim(),
            description: description.value.trim(),
            issue_category_id: Number(categoryId.value),
            priority: priority.value,
            barangay_id: authStore.user?.barangay?.id
        })

        await router.push(`/issues/${issue.uuid}`)
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            errorMessage.value = Object.values(
                error.response.data?.errors ?? {},
            ).flat().join(' ') || 'Please check your entries.'
        } else if (
            axios.isAxiosError(error)
            && error.response?.status === 403
        ) {
            errorMessage.value = 'Your account cannot submit issues.'
        } else {
            errorMessage.value =
                'Could not submit your report. Please try again.'
        }
    } finally {
        submitting.value = false
    }
}
</script>


<template>
    <main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">

        <!-- Page heading -->
        <header
            class="relative overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface px-6 py-7 shadow-sm sm:px-8 sm:py-9">
            <div class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-brand/5 blur-2xl" />

            <div class="relative flex items-start gap-4">
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-inset ring-brand/10 sm:h-14 sm:w-14">
                    <svg class="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <path d="M12 5v14m-7-7h14" stroke-linecap="round" stroke-linejoin="round" />
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                    </svg>
                </div>

                <div class="min-w-0 flex-1">
                    <span
                        class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        <span class="h-1.5 w-1.5 rounded-full bg-brand" />
                        Resident Portal
                    </span>

                    <h1 class="mt-3 text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">
                        Report a community issue
                    </h1>

                    <p class="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
                        Help make your community better. Tell us what happened, where it occurred, and what needs
                        attention.
                    </p>
                </div>
            </div>

            <div class="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4">
                <span class="inline-flex items-center gap-2 text-xs text-text-muted">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                    </svg>
                    Clear and accurate details help
                </span>

                <span class="inline-flex items-center gap-2 text-xs text-text-muted">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-3Z" />
                    </svg>
                    Your report can be tracked
                </span>
            </div>
        </header>

        <!-- Error message -->
        <div v-if="errorMessage" role="alert"
            class="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" stroke-linecap="round" />
                </svg>
            </span>

            <div class="min-w-0 flex-1">
                <p class="font-semibold">Unable to submit your report</p>
                <p class="mt-1 leading-5">{{ errorMessage }}</p>
            </div>
        </div>

        <!-- Report form -->
        <form class="overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-sm"
            @submit.prevent="submitIssue">
            <!-- Form heading -->
            <div class="border-b border-border-subtle px-5 py-5 sm:px-8">
                <h2 class="text-lg font-bold text-text-heading">
                    Issue details
                </h2>
                <p class="mt-1 text-sm text-text-muted">
                    Fill in the information below to submit your concern.
                </p>
            </div>

            <div class="space-y-7 p-5 sm:p-8">

                <!-- Issue title -->
                <div>
                    <label for="title" class="mb-2 block text-sm font-semibold text-text-heading">
                        Issue title
                        <span class="text-brand">*</span>
                    </label>

                    <input id="title" v-model="title" type="text" required maxlength="255"
                        placeholder="e.g. Damaged road near the barangay hall"
                        class="w-full rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5 text-sm text-text-heading outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-4 focus:ring-brand/10" />

                    <div class="mt-2 flex items-start justify-between gap-3">
                        <p class="text-xs leading-5 text-text-muted">
                            Give your report a short, descriptive title.
                        </p>
                        <span class="shrink-0 text-xs tabular-nums text-text-muted">
                            {{ title.length }}/255
                        </span>
                    </div>
                </div>

                <!-- Description -->
                <div>
                    <label for="description" class="mb-2 block text-sm font-semibold text-text-heading">
                        Description
                        <span class="text-brand">*</span>
                    </label>

                    <textarea id="description" v-model="description" required maxlength="10000" rows="6"
                        placeholder="Describe what happened, where the issue is located, and how it affects the community..."
                        class="w-full resize-y rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5 text-sm leading-6 text-text-heading outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-4 focus:ring-brand/10" />

                    <div class="mt-2 flex items-start justify-between gap-3">
                        <p class="max-w-xl text-xs leading-5 text-text-muted">
                            Include nearby landmarks, the extent of the problem, or other details that may help the team
                            investigate.
                        </p>
                        <span class="shrink-0 text-xs tabular-nums text-text-muted">
                            {{ description.length }}/10,000
                        </span>
                    </div>
                </div>

                <!-- Category -->
                <div>
                    <label for="category" class="mb-2 block text-sm font-semibold text-text-heading">
                        Issue category
                        <span class="text-brand">*</span>
                    </label>

                    <div class="relative">
                        <select id="category" v-model="categoryId" required
                            :disabled="loadingCategories || categories.length === 0"
                            class="w-full appearance-none rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5 pr-11 text-sm text-text-heading outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60">
                            <option value="" disabled>
                                {{
                                    loadingCategories
                                        ? 'Loading categories...'
                                        : categories.length === 0
                                            ? 'No categories available'
                                            : 'Select the appropriate category'
                                }}
                            </option>

                            <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                                {{ category.name }}
                            </option>
                        </select>

                        <svg class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m7 10 5 5 5-5" />
                        </svg>
                    </div>

                    <p class="mt-2 text-xs leading-5 text-text-muted">
                        Choose the category that best matches the issue.
                    </p>
                </div>

                <!-- Priority -->
                <fieldset>
                    <legend class="text-sm font-semibold text-text-heading">
                        Priority
                        <span class="text-brand">*</span>
                    </legend>

                    <p class="mt-1 text-xs leading-5 text-text-muted">
                        How urgently do you think this issue needs attention?
                    </p>

                    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label v-for="option in [
                            {
                                value: 'low',
                                label: 'Low',
                                description: 'Minor issue with limited impact.',
                                color: 'text-text-muted',
                                selected: 'border-brand bg-brand/5 ring-1 ring-brand/20',
                            },
                            {
                                value: 'medium',
                                label: 'Medium',
                                description: 'Needs attention but is not urgent.',
                                color: 'text-sky-600',
                                selected: 'border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/20',
                            },
                            {
                                value: 'high',
                                label: 'High',
                                description: 'Significant impact on the community.',
                                color: 'text-orange-600',
                                selected: 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/20',
                            },
                            {
                                value: 'urgent',
                                label: 'Urgent',
                                description: 'Potential immediate safety concern.',
                                color: 'text-red-600',
                                selected: 'border-red-500 bg-red-500/5 ring-1 ring-red-500/20',
                            },
                        ]" :key="option.value"
                            class="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition duration-200 hover:border-brand/40"
                            :class="priority === option.value
                                    ? option.selected
                                    : 'border-border-subtle bg-bg-page/50'
                                ">
                            <input v-model="priority" type="radio" name="priority" :value="option.value"
                                class="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />

                            <span class="min-w-0 flex-1">
                                <span class="flex items-center gap-2">
                                    <span class="text-sm font-semibold" :class="option.color">
                                        {{ option.label }}
                                    </span>

                                    <svg v-if="priority === option.value" viewBox="0 0 24 24" class="h-4 w-4 text-brand"
                                        fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="m5 12 4 4L19 6" />
                                    </svg>
                                </span>

                                <span class="mt-1 block text-xs leading-5 text-text-muted">
                                    {{ option.description }}
                                </span>
                            </span>
                        </label>
                    </div>

                    <p class="mt-3 text-xs leading-5 text-text-muted">
                        Staff may review and adjust the priority based on the circumstances.
                    </p>
                </fieldset>
            </div>

            <!-- Form actions -->
            <footer class="border-t border-border-subtle bg-bg-page/40 px-5 py-5 sm:px-8">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-xs leading-5 text-text-muted">
                        <span class="font-semibold text-brand">*</span>
                        Required fields
                    </p>

                    <button type="submit" :disabled="submitting || loadingCategories || categories.length === 0"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto">
                        <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                        </svg>

                        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="m22 2-7 20-4-9-9-4Z" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M22 2 11 13" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        {{ submitting ? 'Submitting report...' : 'Submit report' }}
                    </button>
                </div>
            </footer>
        </form>

        <!-- Footer note -->
        <div class="flex items-start justify-center gap-2 px-4 text-center">
            <svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0 text-text-muted" fill="none" stroke="currentColor"
                stroke-width="1.7">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" />
            </svg>

            <p class="max-w-xl text-xs leading-5 text-text-muted">
                Please provide accurate information. Your report will help the community team understand and respond to
                the issue.
            </p>
        </div>
    </main>
</template>
