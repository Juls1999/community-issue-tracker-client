<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'

import { issueService } from '@/services/issueService'
import { queryKeys } from '@/constants/queryKeys'

type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'

interface Category {
    id: number
    name: string
}

interface IssueReport {
    uuid: string
    title: string
    description: string
    status: ReportStatus
    priority: 'low' | 'medium' | 'high' | 'urgent'
    createdAt: string
    updatedAt: string
    category?: Category | null
    barangay?: { id: number; name: string } | null
}

const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Rejected', value: 'rejected' },
]

const route = useRoute()
const router = useRouter()

const defaults = {
    page: 1,
    per_page: 10,
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sort_by: 'created_at',
    sort_direction: 'desc',
}

const getQueryValue = (value: unknown, fallback: string): string => {
    return typeof value === 'string' ? value : fallback
}

// -----------------------------------------
// URL filters
// -----------------------------------------

const filters = computed(() => {
    const page = Number(route.query.page)
    const perPage = Number(route.query.per_page)

    return {
        page:
            Number.isInteger(page) && page > 0
                ? page
                : defaults.page,

        per_page:
            Number.isInteger(perPage) && perPage >= 1 && perPage <= 100
                ? perPage
                : defaults.per_page,

        search: getQueryValue(route.query.search, defaults.search).trim(),
        status: getQueryValue(route.query.status, defaults.status),
        priority: getQueryValue(route.query.priority, defaults.priority),
        category: getQueryValue(route.query.category, defaults.category),
        sort_by: getQueryValue(route.query.sort_by, defaults.sort_by),
        sort_direction: getQueryValue(
            route.query.sort_direction,
            defaults.sort_direction,
        ),
    }
})

// -----------------------------------------
// Search
// -----------------------------------------

const searchDraft = ref(filters.value.search)

let searchTimeout: ReturnType<typeof setTimeout> | undefined

watch(
    () => route.query.search,
    () => {
        searchDraft.value = filters.value.search
    },
)

const updateFilters = (
    changes: Partial<typeof defaults>,
    navigation: 'push' | 'replace' = 'replace',
) => {
    const next = {
        ...filters.value,
        ...changes,
    }

    const query = { ...route.query }

    Object.entries(next).forEach(([key, value]) => {
        if (value === defaults[key as keyof typeof defaults]) {
            delete query[key]
        } else {
            query[key] = String(value)
        }
    })

    router[navigation]({ query })
}

watch(searchDraft, (value) => {
    if (searchTimeout) clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
        updateFilters({
            search: value.trim(),
            page: 1,
        })
    }, 400)
})

onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
})

// -----------------------------------------
// Filter actions
// -----------------------------------------

const changeStatus = (value: string) => {
    updateFilters({ status: value, page: 1 })
}

function changePriority(priority: string) {
    updateFilters({
        priority,
        page: 1,
    })
}

const changePerPage = (value: string | number) => {
    updateFilters({
        per_page: Number(value),
        page: 1,
    })
}

function changeSorting(sortBy: string, sortDirection: string) {
    updateFilters({
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: 1,
    })
}

const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return

    updateFilters({ page }, 'push')
}

const resetFilters = () => {
    searchDraft.value = ''
    router.replace({ query: {} })
}

// -----------------------------------------
// API parameters
// -----------------------------------------

const apiParams = computed(() => {
    const current = filters.value

    return {
        page: current.page,
        per_page: current.per_page,
        search: current.search || undefined,
        status: current.status === 'all' ? undefined : current.status,
        priority: current.priority === 'all' ? undefined : current.priority,
        category: current.category === 'all' ? undefined : current.category,
        sort_by: current.sort_by,
        sort_direction: current.sort_direction,
    }
})

// -----------------------------------------
// TanStack Vue Query
// -----------------------------------------

const {
    data: reportsResponse,
    isPending,
    isError,
    isFetching,
    error,
    refetch,
} = useQuery({
    queryKey: computed(() => ['issues', 'list', filters.value]),
    queryFn: () => issueService.getIssues(apiParams.value),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
})

const reports = computed<IssueReport[]>(
    () => (reportsResponse.value?.data ?? []) as IssueReport[],
)

const pagination = computed(() => reportsResponse.value?.meta)

const totalPages = computed(() => pagination.value?.last_page ?? 1)

const totalReports = computed(() => pagination.value?.total ?? 0)

const currentPage = computed(() => filters.value.page)

const perPage = computed(() => filters.value.per_page)

// Laravel already handles filtering and pagination.
const reportList = reports

// -----------------------------------------
// Summary counts
// -----------------------------------------

interface StatusCounts {
    total: number
    pending: number
    in_progress: number
    resolved: number
    rejected: number
}
const statusCounts = computed<StatusCounts>(() => {
    return reportsResponse.value?.statistics ?? {
        total: 0,
        pending: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
    }
})

// -----------------------------------------
// Presentation helpers
// -----------------------------------------

const errorMessage = computed(() =>
    error.value instanceof Error
        ? error.value.message
        : 'Unable to load your reports. Please try again.',
)

const formatStatus = (status: string) => {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const statusClasses = (status: string) => {
    const classes: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        in_progress: 'bg-blue-100 text-blue-700',
        resolved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    }

    return classes[status] ?? 'bg-gray-100 text-gray-700'
}

const categoryClasses = (category?: Category | null) => {
    return category
        ? 'bg-brand/10 text-brand ring-brand/20'
        : 'bg-gray-100 text-gray-700 ring-gray-200'
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
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
                    value: statusCounts.total,
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
                :class="filters.status === item.key
                    ? 'border-brand ring-2 ring-brand/15'
                    : 'border-border-subtle hover:border-brand/40'
                    " @click="changeStatus(item.key)">
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

                <div v-if="filters.status === item.key" class="absolute inset-x-0 bottom-0 h-1 bg-brand" />
            </button>
        </div>


        <!-- Search and filters -->
        <div class="rounded-2xl border border-border-subtle bg-bg-surface p-4 shadow-sm sm:p-5">
            <div class="flex flex-col gap-3 md:flex-row">

                <!-- Search input -->
                <div class="relative flex-1">
                    <svg viewBox="0 0 24 24" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                        fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                    </svg>

                    <input v-model="searchDraft" type="search"
                        placeholder="Search reports by title, description, category, or ID..."
                        class="w-full rounded-xl border border-border-subtle bg-bg-page py-3.5 pl-12 pr-4 text-sm text-text-heading outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-4 focus:ring-brand/10" />
                </div>

                <!-- Status filter -->
                <div class="relative md:w-56">
                    <select :value="filters.status" @change="changeStatus(($event.target as HTMLSelectElement).value)"
                        class="w-full appearance-none rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5 pr-10 text-sm font-medium text-text-heading outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10">
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

            <!-- Search information -->
            <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs text-text-muted">
                    <span class="font-semibold text-text-heading">
                        {{ totalReports }}
                    </span>
                    {{ totalReports === 1 ? 'report' : 'reports' }} founds

                    <span v-if="searchDraft.trim()">
                        matching "{{ searchDraft.trim() }}"
                    </span>
                </p>

                <button v-if="searchDraft || filters.status !== 'all'" type="button"
                    class="text-xs font-semibold text-brand transition hover:underline" @click="resetFilters">
                    Clear filters
                </button>
            </div>
        </div>


        <!-- Loading state -->
        <div v-if="isPending"
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
        <div v-else-if="isError"
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
                {{ errorMessage ? 'Invalid search result, Please try again' : '' }}
            </p>

            <div class="space-x-2">
                <button type="button"
                    class="mt-6 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-text-body transition hover:border-brand hover:text-brand"
                    @click="resetFilters()">
                    Clear filters
                </button>
                <button type="button"
                    class="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                    @click="refetch()">
                    Try Again
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!isFetching && reportList.length === 0"
            class="rounded-2xl border border-border-subtle bg-bg-surface px-6 py-16 text-center shadow-sm">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
            </div>

            <h2 class="mt-5 text-xl font-bold text-text-heading">
                {{ totalReports === 0 ? 'No reports yet' : 'No matching reports' }}
            </h2>

            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                {{
                    totalReports === 0
                        ? 'Your submitted community issues will appear here so you can track their progress.'
                        : 'Try another search term or choose a different status to find your report.'
                }}
            </p>

            <RouterLink v-if="reportList.length === 0" :to="{ name: 'issue-create' }"
                class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Submit Your First Report
            </RouterLink>

            <button v-else type="button"
                class="mt-6 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-text-body transition hover:border-brand hover:text-brand"
                @click="searchDraft = ''; filters.status = 'all'">
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

            <!-- Pagination -->
            <section v-if="!isPending && totalReports > 0"
                class="flex flex-col justify-between gap-4 border-t border-border-subtle pt-5 sm:flex-row sm:items-center">
                <!-- Results Information -->

                <div class="flex flex-wrap items-center justify-between gap-4">
                    <!-- Pagination information and controls -->
                    <div class="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                        <span>
                            Showing
                            <strong class="text-text-heading">
                                {{ pagination?.from ?? 0 }}–{{ pagination?.to ?? 0 }}
                            </strong>
                            of
                            <strong class="text-text-heading">
                                {{ totalReports }}
                            </strong>
                            reports
                        </span>

                        <!-- Rows per page -->
                        <div class="flex items-center gap-2">
                            <label for="perPage" class="text-xs">Rows:</label>

                            <select id="perPage" :value="perPage"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changePerPage(($event.target as HTMLSelectElement).value)">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="50">50</option>
                                <option :value="100">100</option>
                            </select>
                        </div>

                        <!-- Sort field -->
                        <div class="flex items-center gap-2">
                            <label for="sortBy" class="text-xs">Sort by:</label>

                            <select id="sortBy" :value="filters.sort_by"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changeSorting(($event.target as HTMLSelectElement).value, filters.sort_direction)">
                                <option value="created_at">Date created</option>
                                <option value="updated_at">Last updated</option>
                                <option value="title">Title</option>
                                <option value="priority">Priority</option>
                                <option value="status">Status</option>
                            </select>
                        </div>

                        <!-- Sort direction -->
                        <div class="flex items-center gap-2">
                            <label for="sortDirection" class="text-xs">Order:</label>

                            <select id="sortDirection" :value="filters.sort_direction"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changeSorting(filters.sort_by, ($event.target as HTMLSelectElement).value)">
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>

                        <!-- Priority filter -->
                        <div class="flex items-center gap-2">
                            <label for="priority" class="text-xs">Priority:</label>

                            <select id="priority" :value="filters.priority"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changePriority(($event.target as HTMLSelectElement).value)">
                                <option value="all">All priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <button type="button" class="text-xs font-semibold text-brand transition hover:underline"
                            @click="resetFilters">
                            Clear filters
                        </button>
                    </div>
                </div>


                <!-- Navigation -->
                <div class="flex items-center gap-2">
                    <button type="button" :disabled="currentPage <= 1"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-body transition hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                        @click="goToPage(currentPage - 1)">
                        Previous
                    </button>

                    <span class="px-2 text-sm text-text-muted">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>

                    <button type="button" :disabled="currentPage >= totalPages"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-body transition hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                        @click="goToPage(currentPage + 1)">
                        Next
                    </button>
                </div>
            </section>

            <RouterLink v-for="report in reportList" :key="report.uuid"
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
                                {{ formatDate(report.createdAt) }}
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
            <section v-if="!isPending && totalReports > 0"
                class="flex flex-col justify-between gap-4 border-t border-border-subtle pt-5 sm:flex-row sm:items-center">
                <!-- Results Information -->

                <div class="flex flex-wrap items-center justify-between gap-4">
                    <!-- Pagination information and controls -->
                    <div class="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                        <span>
                            Showing
                            <strong class="text-text-heading">
                                {{ pagination?.from ?? 0 }}–{{ pagination?.to ?? 0 }}
                            </strong>
                            of
                            <strong class="text-text-heading">
                                {{ totalReports }}
                            </strong>
                            reports
                        </span>

                        <!-- Rows per page -->
                        <div class="flex items-center gap-2">
                            <label for="perPage" class="text-xs">Rows:</label>

                            <select id="perPage" :value="perPage"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changePerPage(($event.target as HTMLSelectElement).value)">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="50">50</option>
                                <option :value="100">100</option>
                            </select>
                        </div>

                        <!-- Sort field -->
                        <div class="flex items-center gap-2">
                            <label for="sortBy" class="text-xs">Sort by:</label>

                            <select id="sortBy" :value="filters.sort_by"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changeSorting(($event.target as HTMLSelectElement).value, filters.sort_direction)">
                                <option value="created_at">Date created</option>
                                <option value="updated_at">Last updated</option>
                                <option value="title">Title</option>
                                <option value="priority">Priority</option>
                                <option value="status">Status</option>
                            </select>
                        </div>

                        <!-- Sort direction -->
                        <div class="flex items-center gap-2">
                            <label for="sortDirection" class="text-xs">Order:</label>

                            <select id="sortDirection" :value="filters.sort_direction"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changeSorting(filters.sort_by, ($event.target as HTMLSelectElement).value)">
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>

                        <!-- Priority filter -->
                        <div class="flex items-center gap-2">
                            <label for="priority" class="text-xs">Priority:</label>

                            <select id="priority" :value="filters.priority"
                                class="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-sm text-text-body outline-none focus:border-brand"
                                @change="changePriority(($event.target as HTMLSelectElement).value)">
                                <option value="all">All priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <button type="button" class="text-xs font-semibold text-brand transition hover:underline"
                            @click="resetFilters">
                            Clear filters
                        </button>
                    </div>
                </div>


                <!-- Navigation -->
                <div class="flex items-center gap-2">
                    <button type="button" :disabled="currentPage <= 1"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-body transition hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                        @click="goToPage(currentPage - 1)">
                        Previous
                    </button>

                    <span class="px-2 text-sm text-text-muted">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>

                    <button type="button" :disabled="currentPage >= totalPages"
                        class="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-body transition hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                        @click="goToPage(currentPage + 1)">
                        Next
                    </button>
                </div>
            </section>
        </div>
    </section>
</template>
