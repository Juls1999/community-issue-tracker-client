<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'

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

onMounted(fetchReports)
</script>

<template>
    <section class="mx-auto w-full max-w-7xl space-y-6">
        <!-- Page heading -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="text-sm font-medium text-brand">Resident Portal</p>
                <h1 class="mt-1 text-2xl font-bold text-text-heading sm:text-3xl">
                    My Reports
                </h1>
                <p class="mt-2 text-sm text-text-muted">
                    Track the issues you've submitted to your community.
                </p>
            </div>

            <RouterLink :to="{ name: 'issue-create' }"
                class="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90 sm:self-auto">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Submit New Report
            </RouterLink>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <button v-for="item in [
                { label: 'Total Reports', value: statusCounts.all, key: 'all', icon: 'all' },
                { label: 'Pending', value: statusCounts.pending, key: 'pending', icon: 'pending' },
                { label: 'In Progress', value: statusCounts.in_progress, key: 'in_progress', icon: 'progress' },
                { label: 'Resolved', value: statusCounts.resolved, key: 'resolved', icon: 'resolved' },
            ]" :key="item.key" type="button"
                class="rounded-2xl border bg-bg-surface p-4 text-left transition hover:border-brand/50 sm:p-5"
                :class="selectedStatus === item.key ? 'border-brand ring-1 ring-brand/20' : 'border-border-subtle'"
                @click="selectedStatus = item.key; applyFilters()">
                <div class="flex items-center justify-between gap-2">
                    <p class="text-sm text-text-muted">{{ item.label }}</p>
                    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <svg v-if="item.icon === 'all'" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                            stroke="currentColor" stroke-width="1.8">
                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        <svg v-else-if="item.icon === 'pending'" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                            stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                        </svg>
                        <svg v-else-if="item.icon === 'progress'" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                            stroke="currentColor" stroke-width="1.8">
                            <path d="M4 19V5M4 19h16M8 15l4-4 3 2 5-7" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                            stroke-width="1.8">
                            <circle cx="12" cy="12" r="9" />
                            <path d="m8 12 3 3 5-6" />
                        </svg>
                    </span>
                </div>
                <p class="mt-3 text-2xl font-bold text-text-heading">
                    {{ item.value }}
                </p>
            </button>
        </div>

        <!-- Search and filters -->
        <div class="rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:p-5">
            <div class="flex flex-col gap-4 md:flex-row">
                <div class="relative flex-1">
                    <svg viewBox="0 0 24 24" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                        fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                    </svg>

                    <input v-model="searchQuery" type="search" placeholder="Search by title, category, or report ID..."
                        class="w-full rounded-xl border border-border-subtle bg-bg-page py-3 pl-10 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
                        @input="applyFilters" />
                </div>

                <select v-model="selectedStatus"
                    class="rounded-xl border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 md:w-52"
                    @change="applyFilters">
                    <option v-for="status in statuses" :key="status.value" :value="status.value">
                        {{ status.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="rounded-2xl border border-border-subtle bg-bg-surface px-6 py-16 text-center">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
            <p class="mt-4 text-sm text-text-muted">Loading your reports...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="rounded-2xl border border-red-200 bg-bg-surface px-6 py-12 text-center">
            <p class="font-semibold text-text-heading">{{ errorMessage }}</p>
            <button type="button"
                class="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90"
                @click="fetchReports">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredReports.length === 0"
            class="rounded-2xl border border-border-subtle bg-bg-surface px-6 py-14 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.7">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
            </div>

            <h2 class="mt-4 text-lg font-semibold text-text-heading">
                {{ reports.length === 0 ? 'No reports yet' : 'No matching reports' }}
            </h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-text-muted">
                {{
                    reports.length === 0
                        ? 'When you submit a community issue, you can track its progress here.'
                        : 'Try changing your search term or selecting a different status.'
                }}
            </p>

            <RouterLink v-if="reports.length === 0" :to="{ name: 'issue-create' }"
                class="mt-5 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90">
                Submit Your First Report
            </RouterLink>

            <button v-else type="button" class="mt-5 text-sm font-semibold text-brand hover:underline"
                @click="searchQuery = ''; selectedStatus = 'all'; applyFilters()">
                Clear filters
            </button>
        </div>

        <!-- Report list -->
        <div v-else class="space-y-4">
            <RouterLink v-for="report in paginatedReports" :key="report.uuid"
                :to="{ name: 'issueDiscussion', params: { uuid: report.uuid } }"
                class="group block rounded-2xl border border-border-subtle bg-bg-surface p-5 transition hover:border-brand/50 hover:shadow-sm sm:p-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="font-mono text-xs text-text-muted">
                                #{{ report.uuid.slice(0, 8).toUpperCase() }}
                            </span>
                            <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
                                :class="statusClasses(report.status)">
                                {{ formatStatus(report.status) }}
                            </span>
                        </div>

                        <h2 class="mt-3 text-lg font-semibold text-text-heading transition group-hover:text-brand">
                            {{ report.title }}
                        </h2>

                        <p class="mt-2 line-clamp-2 text-sm leading-6 text-text-muted">
                            {{ report.description }}
                        </p>

                        <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
                            <span v-if="report.category"
                                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                                :class="categoryClasses(report.category)">
                                <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor"
                                    stroke-width="1.8">
                                    <path d="M20 13V4H11L3 12l8 8 9-7Z" />
                                    <circle cx="15" cy="8" r="1" />
                                </svg>

                                {{ report.category.name }}
                            </span>

                            <span class="inline-flex items-center gap-1.5">
                                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor"
                                    stroke-width="1.8">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 2" />
                                </svg>
                                Submitted {{ formatDate(report.created_at) }}
                            </span>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <span class="text-xs font-semibold uppercase tracking-wide"
                            :class="priorityClasses(report.priority)">
                            {{ report.priority }} priority
                        </span>

                        <span class="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                            View details
                            <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform group-hover:translate-x-1"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14m-6-6 6 6-6 6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </RouterLink>

            <!-- Pagination -->
            <div
                class="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-text-muted">
                    Showing
                    <span class="font-medium text-text-heading">
                        {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredReports.length)
                        }}
                    </span>
                    of
                    <span class="font-medium text-text-heading">{{ filteredReports.length }}</span>
                    reports
                </p>

                <div class="flex items-center gap-2">
                    <button type="button" :disabled="currentPage === 1"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-body hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                        @click="currentPage--">
                        Previous
                    </button>

                    <span class="px-2 text-sm text-text-muted">
                        {{ currentPage }} / {{ totalPages }}
                    </span>

                    <button type="button" :disabled="currentPage >= totalPages"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-body hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                        @click="currentPage++">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
