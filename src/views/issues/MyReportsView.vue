<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { watch } from 'vue'

type ReportStatus =
    | 'pending'
    | 'in_progress'
    | 'resolved'
    | 'rejected'

type ReportPriority = 'low' | 'medium' | 'high' | 'urgent'

interface Category {
    id: number
    name: string
}

interface IssueReport {
    uuid: string
    title: string
    description: string
    status: ReportStatus | string
    priority: ReportPriority | string
    created_at: string
    category?: Category
}

const reports = ref<IssueReport[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)
const perPage = 6

const statuses = [
    { label: 'All Reports', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Rejected', value: 'rejected' },
]

const filteredReports = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return reports.value.filter((report) => {
        const matchesStatus =
            selectedStatus.value === 'all' ||
            report.status.toLowerCase() === selectedStatus.value

        const matchesSearch =
            !query ||
            report.title.toLowerCase().includes(query) ||
            report.description.toLowerCase().includes(query) ||
            report.uuid.toLowerCase().includes(query) ||
            (report.category?.name ?? '').toLowerCase().includes(query)

        return matchesStatus && matchesSearch
    })
})

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredReports.value.length / perPage)),
)

const paginatedReports = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return filteredReports.value.slice(start, start + perPage)
})

const statusCounts = computed(() => ({
    all: reports.value.length,
    pending: reports.value.filter((r) => r.status === 'pending').length,
    in_progress: reports.value.filter((r) => r.status === 'in_progress').length,
    resolved: reports.value.filter((r) => r.status === 'resolved').length,
    rejected: reports.value.filter((r) => r.status === 'rejected').length,
}))

function formatStatus(status: string) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
    )
}

function statusClasses(status: string) {
    const styles: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-emerald-100 text-emerald-800',
        rejected: 'bg-red-100 text-red-700',
    }

    return styles[status] ?? 'bg-bg-page text-text-muted'
}

function priorityClasses(priority: string) {
    const styles: Record<string, string> = {
        low: 'text-text-muted',
        medium: 'text-blue-700',
        high: 'text-orange-700',
        urgent: 'text-red-700',
    }

    return styles[priority] ?? 'text-text-muted'
}

function formatDate(date: string) {
    if (!date) return 'Date unavailable'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable'

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(parsedDate)
}

async function fetchReports() {
    isLoading.value = true
    errorMessage.value = ''

    try {
        // Replace this URL if your Laravel API uses a different endpoint.
        const response = await axios.get('/api/issues')

        // Supports either a plain array or Laravel's { data: [...] } response.
        const payload = response.data
        const data = Array.isArray(payload) ? payload : payload.data

        if (!Array.isArray(data)) {
            throw new Error('The server returned an unexpected reports format.')
        }

        reports.value = data
    } catch (error: unknown) {
        console.error('Failed to load reports:', error)
        errorMessage.value =
            'We could not load your reports. Please try again.'
    } finally {
        isLoading.value = false
    }
}

function applyFilters() {
    currentPage.value = 1
}

function categoryClasses(category?: Category) {
    if (!category) {
        return 'bg-bg-page text-text-muted ring-border-subtle'
    }

    const colors: Record<string, string> = {
        // Match these keys to your actual category names.
        'Waste Management': 'bg-blue-100 text-blue-800 ring-blue-200',
        'Street Lighting': 'bg-emerald-100 text-emerald-800 ring-emerald-200',
        'Drainage and Flooding': 'bg-red-100 text-red-800 ring-red-200',
        'Road Damage': 'bg-lime-100 text-lime-800 ring-lime-200',
        'Public Facilities': 'bg-violet-100 text-violet-800 ring-violet-200',
        'Other': 'bg-slate-100 text-slate-700 ring-slate-200',
    }

    return colors[category.name] ??
        'bg-brand/10 text-brand ring-brand/20'
}



watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
        currentPage.value = pages
    }
})

onMounted(fetchReports)
</script>

<template>
    <section class="mx-auto w-full max-w-7xl space-y-8 pb-8">

        <!-- Page heading -->
        <header
            class="relative overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface px-6 py-8 shadow-sm sm:px-8 sm:py-10">
            <div class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-brand/5 blur-2xl" />

            <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span
                        class="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                        <span class="h-1.5 w-1.5 rounded-full bg-brand" />
                        Resident Portal
                    </span>

                    <h1 class="mt-4 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
                        My Reports
                    </h1>

                    <p class="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                        Keep track of the community issues you've reported and follow their progress.
                    </p>
                </div>

                <RouterLink :to="{ name: 'issue-create' }"
                    class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20">
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Submit New Report
                </RouterLink>
            </div>
        </header>

        <!-- Summary cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button v-for="item in [
                {
                    label: 'Total Reports',
                    value: statusCounts.all,
                    key: 'all',
                    description: 'All submitted reports',
                    icon: 'all',
                },
                {
                    label: 'Pending',
                    value: statusCounts.pending,
                    key: 'pending',
                    description: 'Awaiting review',
                    icon: 'pending',
                },
                {
                    label: 'In Progress',
                    value: statusCounts.in_progress,
                    key: 'in_progress',
                    description: 'Being addressed',
                    icon: 'progress',
                },
                {
                    label: 'Resolved',
                    value: statusCounts.resolved,
                    key: 'resolved',
                    description: 'Successfully completed',
                    icon: 'resolved',
                },
            ]" :key="item.key" type="button"
                class="group relative overflow-hidden rounded-2xl border bg-bg-surface p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                :class="selectedStatus === item.key
                    ? 'border-brand ring-2 ring-brand/15'
                    : 'border-border-subtle hover:border-brand/40'
                    " @click="selectedStatus = item.key; applyFilters()">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-sm font-medium text-text-muted">
                            {{ item.label }}
                        </p>

                        <p class="mt-3 text-3xl font-bold tracking-tight text-text-heading">
                            {{ item.value }}
                        </p>
                    </div>

                    <span
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105"
                        :class="{
                            'bg-brand/10 text-brand': item.icon === 'all',
                            'bg-amber-500/10 text-amber-600': item.icon === 'pending',
                            'bg-sky-500/10 text-sky-600': item.icon === 'progress',
                            'bg-emerald-500/10 text-emerald-600': item.icon === 'resolved',
                        }">
                        <svg v-if="item.icon === 'all'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                            stroke="currentColor" stroke-width="1.7">
                            <rect x="5" y="3" width="14" height="18" rx="2" />
                            <path d="M9 8h6M9 12h6M9 16h3" />
                        </svg>

                        <svg v-else-if="item.icon === 'pending'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                            stroke="currentColor" stroke-width="1.7">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                        </svg>

                        <svg v-else-if="item.icon === 'progress'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                            stroke="currentColor" stroke-width="1.7">
                            <path d="M4 19V5M4 19h16M8 15l4-4 3 2 5-7" />
                        </svg>

                        <svg v-else viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                            stroke-width="1.7">
                            <circle cx="12" cy="12" r="9" />
                            <path d="m8 12 3 3 5-6" />
                        </svg>
                    </span>
                </div>

                <div class="mt-4 flex items-center justify-between gap-2">
                    <p class="text-xs text-text-muted">
                        {{ item.description }}
                    </p>

                    <svg viewBox="0 0 24 24"
                        class="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                </div>

                <div v-if="selectedStatus === item.key" class="absolute inset-x-0 bottom-0 h-1 bg-brand" />
            </button>
        </div>

        <!-- Search and filters -->
        <div class="rounded-2xl border border-border-subtle bg-bg-surface p-4 shadow-sm sm:p-5">
            <div class="flex flex-col gap-3 md:flex-row">
                <div class="relative flex-1">
                    <svg viewBox="0 0 24 24" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                        fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                    </svg>

                    <input v-model="searchQuery" type="search" placeholder="Search reports by title, category, or ID..."
                        class="w-full rounded-xl border border-border-subtle bg-bg-page py-3.5 pl-12 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                        @input="applyFilters" />
                </div>

                <div class="relative md:w-56">
                    <select v-model="selectedStatus"
                        class="w-full appearance-none rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5 pr-10 text-sm font-medium text-text-heading outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                        @change="applyFilters">
                        <option v-for="status in statuses" :key="status.value" :value="status.value">
                            {{ status.label }}
                        </option>
                    </select>

                    <svg viewBox="0 0 24 24"
                        class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m7 10 5 5 5-5" />
                    </svg>
                </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs text-text-muted">
                    {{ filteredReports.length }}
                    {{ filteredReports.length === 1 ? 'report' : 'reports' }} found
                </p>

                <button v-if="searchQuery || selectedStatus !== 'all'" type="button"
                    class="text-xs font-semibold text-brand transition hover:underline"
                    @click="searchQuery = ''; selectedStatus = 'all'; applyFilters()">
                    Clear filters
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading"
            class="rounded-2xl border border-border-subtle bg-bg-surface px-6 py-16 text-center shadow-sm">
            <div class="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-brand/15 border-t-brand" />
            <p class="mt-4 text-sm font-medium text-text-heading">
                Loading your reports
            </p>
            <p class="mt-1 text-xs text-text-muted">
                Please wait while we retrieve your submissions.
            </p>
        </div>

        <!-- Error state -->
        <div v-else-if="errorMessage"
            class="rounded-2xl border border-red-200 bg-bg-surface px-6 py-12 text-center shadow-sm">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path
                        d="M12 9v4m0 4h.01M10.3 3.9 1.8 18.5A1.7 1.7 0 0 0 3.3 21h17.4a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
                </svg>
            </div>

            <p class="mt-4 font-semibold text-text-heading">
                Unable to load reports
            </p>
            <p class="mt-2 text-sm text-text-muted">
                {{ errorMessage }}
            </p>

            <button type="button"
                class="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                @click="fetchReports">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredReports.length === 0"
            class="rounded-2xl border border-border-subtle bg-bg-surface px-6 py-16 text-center shadow-sm">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
            </div>

            <h2 class="mt-5 text-xl font-bold text-text-heading">
                {{ reports.length === 0 ? 'No reports yet' : 'No matching reports' }}
            </h2>

            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                {{
                    reports.length === 0
                        ? 'Your submitted community issues will appear here so you can track their progress.'
                        : 'Try another search term or choose a different status to find your report.'
                }}
            </p>

            <RouterLink v-if="reports.length === 0" :to="{ name: 'issue-create' }"
                class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Submit Your First Report
            </RouterLink>

            <button v-else type="button"
                class="mt-6 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-text-body transition hover:border-brand hover:text-brand"
                @click="searchQuery = ''; selectedStatus = 'all'; applyFilters()">
                Clear filters
            </button>
        </div>

        <!-- Report list -->
        <div v-else class="space-y-4">

            <div class="flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-bold text-text-heading">
                        Your submissions
                    </h2>
                    <p class="mt-1 text-sm text-text-muted">
                        Select a report to view its details and discussion.
                    </p>
                </div>
            </div>

            <RouterLink v-for="report in paginatedReports" :key="report.uuid"
                :to="{ name: 'issueDiscussion', params: { uuid: report.uuid } }"
                class="group relative block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5">
                <!-- Status accent -->
                <div class="absolute inset-y-0 left-0 w-1 transition-colors" :class="{
                    'bg-amber-400': report.status === 'pending',
                    'bg-sky-500': report.status === 'in_progress',
                    'bg-emerald-500': report.status === 'resolved',
                    'bg-red-500': report.status === 'rejected',
                    'bg-brand': !['pending', 'in_progress', 'resolved', 'rejected'].includes(report.status),
                }" />

                <div class="p-5 pl-6 sm:p-6 sm:pl-7">
                    <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <!-- Report information -->
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span
                                    class="rounded-md bg-bg-page px-2 py-1 font-mono text-xs font-medium text-text-muted">
                                    #{{ report.uuid.slice(0, 8).toUpperCase() }}
                                </span>

                                <span
                                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                                    :class="statusClasses(report.status)">
                                    <span class="h-1.5 w-1.5 rounded-full" :class="{
                                        'bg-amber-500': report.status === 'pending',
                                        'bg-blue-500': report.status === 'in_progress',
                                        'bg-emerald-500': report.status === 'resolved',
                                        'bg-red-500': report.status === 'rejected',
                                    }" />
                                    {{ formatStatus(report.status) }}
                                </span>
                            </div>

                            <h3
                                class="mt-4 text-lg font-bold text-text-heading transition group-hover:text-brand sm:text-xl">
                                {{ report.title }}
                            </h3>

                            <p class="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-text-muted">
                                {{ report.description }}
                            </p>

                            <!-- Category and priority -->
                            <div class="mt-4 flex flex-wrap items-center gap-2">
                                <span v-if="report.category"
                                    class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset"
                                    :class="categoryClasses(report.category)">
                                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor"
                                        stroke-width="1.8">
                                        <path d="M20 13V4H11L3 12l8 8 9-7Z" />
                                        <circle cx="15" cy="8" r="1" />
                                    </svg>
                                    {{ report.category.name }}
                                </span>

                                <span
                                    class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                                    :class="{
                                        'bg-bg-page text-text-muted': report.priority === 'low',
                                        'bg-sky-500/10 text-sky-700': report.priority === 'medium',
                                        'bg-orange-500/10 text-orange-700': report.priority === 'high',
                                        'bg-red-500/10 text-red-700': report.priority === 'urgent',
                                    }">
                                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor"
                                        stroke-width="1.8">
                                        <path d="M12 3 3 20h18L12 3Z" />
                                        <path d="M12 9v4m0 3h.01" />
                                    </svg>
                                    {{ formatStatus(report.priority) }} priority
                                </span>
                            </div>
                        </div>

                        <!-- Report metadata -->
                        <div
                            class="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border-subtle pt-4 sm:min-w-40 sm:flex-col sm:items-end sm:justify-start sm:border-0 sm:pt-1">
                            <div class="flex items-center gap-2 text-xs text-text-muted">
                                <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor"
                                    stroke-width="1.8">
                                    <rect x="3" y="5" width="18" height="16" rx="2" />
                                    <path d="M16 3v4M8 3v4M3 11h18" />
                                </svg>
                                {{ formatDate(report.created_at) }}
                            </div>

                            <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                                View details
                                <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14m-6-6 6 6-6 6" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </RouterLink>

            <!-- Pagination -->
            <div
                class="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p class="text-sm text-text-muted">
                    Showing
                    <span class="font-semibold text-text-heading">
                        {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredReports.length)
                        }}
                    </span>
                    of
                    <span class="font-semibold text-text-heading">
                        {{ filteredReports.length }}
                    </span>
                    reports
                </p>

                <div class="flex items-center gap-2">
                    <button type="button" :disabled="currentPage === 1"
                        class="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-2.5 text-sm font-medium text-text-body transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                        @click="currentPage--">
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span class="hidden sm:inline">Previous</span>
                    </button>

                    <span class="rounded-xl bg-brand/10 px-4 py-2.5 text-sm font-bold text-brand">
                        {{ currentPage }} / {{ totalPages }}
                    </span>

                    <button type="button" :disabled="currentPage >= totalPages"
                        class="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-2.5 text-sm font-medium text-text-body transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                        @click="currentPage++">
                        <span class="hidden sm:inline">Next</span>
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
