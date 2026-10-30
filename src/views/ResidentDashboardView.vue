<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { issueService, type Issue } from '@/services/issueService'

const issues = ref<Issue[]>([])
const loading = ref(true)
const errorMessage = ref('')

const statusCounts = computed(() => ({
    pending: issues.value.filter(i => i.status === 'pending').length,
    in_progress: issues.value.filter(i => i.status === 'in_progress').length,
    resolved: issues.value.filter(i => i.status === 'resolved').length,
}))

function statusLabel(status: Issue['status']) {
    const labels: Record<Issue['status'], string> = {
        pending: 'Pending',
        in_progress: 'In progress',
        resolved: 'Resolved',
        rejected: 'Rejected'
    }

    return labels[status]
}

function statusClass(status: Issue['status']) {
    const classes: Record<Issue['status'], string> = {
        pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
        in_progress: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-400 ring-red-500/20'
    }

    return classes[status]
}

async function loadIssues() {
    loading.value = true
    errorMessage.value = ''

    try {
        const result = await issueService.getIssues()
        issues.value = result.data
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            errorMessage.value = 'Please sign in to view your reports.'
        } else {
            errorMessage.value = 'Unable to load your issues. Please try again.'
        }
    } finally {
        loading.value = false
    }
}

onMounted(loadIssues)
</script>


<template>
    <main class="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6">

        <!-- Welcome header -->
        <header
            class="relative overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface px-6 py-7 shadow-sm sm:px-8 sm:py-9">
            <div class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-brand/5 blur-2xl" />

            <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                    <span
                        class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        <span class="h-1.5 w-1.5 rounded-full bg-brand" />
                        Resident Portal
                    </span>

                    <h1 class="mt-4 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
                        Resident Dashboard
                    </h1>

                    <p class="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                        Welcome to your community dashboard. Track your submitted issues and stay updated on their
                        progress.
                    </p>
                </div>

                <RouterLink :to="{ name: 'issue-create' }"
                    class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                    </svg>
                    Report an issue
                </RouterLink>
            </div>

            <div class="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border-subtle pt-5">
                <span class="inline-flex items-center gap-2 text-xs text-text-muted">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                    </svg>
                    Report community concerns
                </span>

                <span class="inline-flex items-center gap-2 text-xs text-text-muted">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 text-brand" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </svg>
                    Monitor report progress
                </span>
            </div>
        </header>

        <!-- Error message -->
        <div v-if="errorMessage" role="alert"
            class="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" stroke-linecap="round" />
                </svg>
            </span>

            <div class="min-w-0 flex-1">
                <p class="font-semibold">Unable to load your dashboard</p>
                <p class="mt-1 leading-5">{{ errorMessage }}</p>

                <button type="button"
                    class="mt-3 inline-flex items-center gap-2 font-semibold text-red-600 transition hover:underline"
                    @click="loadIssues">
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 7v5h-5M4 17v-5h5" />
                        <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
                    </svg>
                    Try again
                </button>
            </div>
        </div>

        <!-- Statistics -->
        <section>
            <div class="mb-4 flex items-end justify-between gap-3">
                <div>
                    <h2 class="text-lg font-bold text-text-heading">
                        Your report overview
                    </h2>
                    <p class="mt-1 text-sm text-text-muted">
                        A quick summary of your submitted issues.
                    </p>
                </div>

                <span class="hidden text-xs text-text-muted sm:inline">
                    {{ loading ? 'Updating...' : 'Current summary' }}
                </span>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <!-- Total reports -->
                <article
                    class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-text-muted">
                                Total reports
                            </p>

                            <p class="mt-3 text-3xl font-bold tracking-tight text-text-heading">
                                {{ loading ? '—' : issues.length }}
                            </p>
                        </div>

                        <span
                            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand transition group-hover:scale-105">
                            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                stroke-width="1.7">
                                <rect x="5" y="3" width="14" height="18" rx="2" />
                                <path d="M9 8h6M9 12h6M9 16h3" />
                            </svg>
                        </span>
                    </div>

                    <p class="mt-4 text-xs text-text-muted">
                        All your submitted issues
                    </p>

                    <div class="absolute inset-x-0 bottom-0 h-1 bg-brand/60" />
                </article>

                <!-- Pending -->
                <article
                    class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-text-muted">
                                Pending
                            </p>

                            <p class="mt-3 text-3xl font-bold tracking-tight text-text-heading">
                                {{ loading ? '—' : statusCounts.pending }}
                            </p>
                        </div>

                        <span
                            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 transition group-hover:scale-105">
                            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                stroke-width="1.7">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 2" />
                            </svg>
                        </span>
                    </div>

                    <p class="mt-4 text-xs text-text-muted">
                        Awaiting review
                    </p>

                    <div class="absolute inset-x-0 bottom-0 h-1 bg-amber-500/60" />
                </article>

                <!-- In progress -->
                <article
                    class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-md">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-text-muted">
                                In progress
                            </p>

                            <p class="mt-3 text-3xl font-bold tracking-tight text-text-heading">
                                {{ loading ? '—' : statusCounts.in_progress }}
                            </p>
                        </div>

                        <span
                            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 transition group-hover:scale-105">
                            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                stroke-width="1.7">
                                <path d="M4 19V5M4 19h16M8 15l4-4 3 2 5-7" />
                            </svg>
                        </span>
                    </div>

                    <p class="mt-4 text-xs text-text-muted">
                        Currently being addressed
                    </p>

                    <div class="absolute inset-x-0 bottom-0 h-1 bg-sky-500/60" />
                </article>

                <!-- Resolved -->
                <article
                    class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-text-muted">
                                Resolved
                            </p>

                            <p class="mt-3 text-3xl font-bold tracking-tight text-text-heading">
                                {{ loading ? '—' : statusCounts.resolved }}
                            </p>
                        </div>

                        <span
                            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition group-hover:scale-105">
                            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                stroke-width="1.7">
                                <circle cx="12" cy="12" r="9" />
                                <path d="m8 12 3 3 5-6" />
                            </svg>
                        </span>
                    </div>

                    <p class="mt-4 text-xs text-text-muted">
                        Successfully addressed
                    </p>

                    <div class="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/60" />
                </article>
            </div>
        </section>

        <!-- Recent reports -->
        <section class="overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-sm">

            <!-- Section heading -->
            <div
                class="flex flex-col gap-4 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                                stroke-width="1.8">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                <path d="M14 2v6h6M8 13h8M8 17h5" />
                            </svg>
                        </span>

                        <h2 class="text-lg font-bold text-text-heading">
                            My recent reports
                        </h2>
                    </div>

                    <p class="mt-2 text-sm text-text-muted">
                        Stay updated on the latest issues you've submitted.
                    </p>
                </div>

                <RouterLink :to="{ name: 'resident-reports' }"
                    class="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand sm:self-auto">
                    View all reports

                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                </RouterLink>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="space-y-4 p-5 sm:p-6" aria-live="polite" aria-label="Loading reports">
                <div v-for="n in 4" :key="n"
                    class="flex items-center gap-4 rounded-2xl border border-border-subtle p-4">
                    <div class="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-bg-page" />

                    <div class="min-w-0 flex-1 space-y-2">
                        <div class="h-4 w-2/5 animate-pulse rounded bg-bg-page" />
                        <div class="h-3 w-3/5 animate-pulse rounded bg-bg-page" />
                    </div>

                    <div class="h-6 w-20 animate-pulse rounded-full bg-bg-page" />
                </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="issues.length === 0" class="px-6 py-16 text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.7">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 2v6h6M8 13h8M8 17h5" />
                    </svg>
                </div>

                <h3 class="mt-5 text-xl font-bold text-text-heading">
                    No reports yet
                </h3>

                <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                    You haven't submitted a community issue yet. Create your first report to start tracking its progress
                    here.
                </p>

                <RouterLink :to="{ name: 'issue-create' }"
                    class="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90">
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create your first report
                </RouterLink>
            </div>

            <!-- Reports list -->
            <ul v-else class="divide-y divide-border-subtle">
                <li v-for="issue in issues.slice(0, 5)" :key="issue.uuid"
                    class="group relative transition-colors duration-200 hover:bg-bg-page/50">
                    <RouterLink :to="{ name: 'issueDiscussion', params: { uuid: issue.uuid } }"
                        class="flex flex-col gap-4 p-5 pl-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <!-- Report details -->
                        <div class="flex min-w-0 flex-1 items-start gap-4">
                            <div
                                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand ring-1 ring-inset ring-border-subtle transition group-hover:bg-brand/10">
                                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                                    stroke-width="1.7">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                    <path d="M14 2v6h6M8 13h8M8 17h5" />
                                </svg>
                            </div>

                            <div class="min-w-0 flex-1">
                                <h3 class="truncate font-semibold text-text-heading transition group-hover:text-brand">
                                    {{ issue.title }}
                                </h3>

                                <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                                    <span>{{ issue.category?.name ?? 'Uncategorized' }}</span>

                                    <span v-if="issue.barangay" class="text-border-subtle">·</span>
                                    <span v-if="issue.barangay">{{ issue.barangay.name }}</span>

                                    <span class="text-border-subtle">·</span>
                                    <span>{{ new Date(issue.created_at).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'short', day: 'numeric'
                                    }) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Status and arrow -->
                        <div class="flex items-center justify-between gap-4 pl-14 sm:shrink-0 sm:pl-0">
                            <span
                                class="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset"
                                :class="statusClass(issue.status)">
                                <span class="h-1.5 w-1.5 rounded-full" :class="{
                                    'bg-amber-500': issue.status === 'pending',
                                    'bg-blue-500': issue.status === 'in_progress',
                                    'bg-emerald-500': issue.status === 'resolved',
                                    'bg-red-500': issue.status === 'rejected',
                                }" />
                                {{ statusLabel(issue.status) }}
                            </span>

                            <svg viewBox="0 0 24 24"
                                class="h-5 w-5 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand"
                                fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </RouterLink>
                </li>
            </ul>

            <!-- List footer -->
            <div v-if="!loading && issues.length > 0"
                class="flex flex-col gap-3 border-t border-border-subtle bg-bg-page/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p class="text-xs text-text-muted">
                    Showing {{ Math.min(issues.length, 5) }} of {{ issues.length }} reports
                </p>

                <RouterLink :to="{ name: 'resident-reports' }"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:gap-2.5">
                    See all your reports

                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                </RouterLink>
            </div>
        </section>

        <!-- Quick action -->
        <section
            class="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div class="flex items-start gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M12 5v14m-7-7h14" stroke-linecap="round" />
                    </svg>
                </span>

                <div>
                    <h2 class="font-bold text-text-heading">
                        Something needs attention?
                    </h2>
                    <p class="mt-1 text-sm leading-5 text-text-muted">
                        Help improve your community by reporting an issue.
                    </p>
                </div>
            </div>

            <RouterLink :to="{ name: 'issue-create' }"
                class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-body transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand">
                Submit a report

                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
            </RouterLink>
        </section>

    </main>
</template>
