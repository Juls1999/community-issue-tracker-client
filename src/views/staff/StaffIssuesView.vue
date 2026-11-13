<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
    Search,
    RefreshCw,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
} from 'lucide-vue-next'

import { issueService } from '@/services/issueService'
import { queryKeys } from '@/constants/queryKeys'


import { useIssueAssignment } from '@/composables/useIssueAssignment'
import Swal from 'sweetalert2'
import type { IssueListParams } from '@/types'

const queryClient = useQueryClient()
const claimingIssueId = ref('')

const claimIssueMutation = useMutation({
    mutationFn: (uuid: string) => issueService.claimIssue(uuid),

    onMutate: (uuid: string) => claimingIssueId.value = uuid,

    onSettled: () => claimingIssueId.value = '',

    onSuccess: async () => {
        await queryClient.invalidateQueries({
            queryKey: [
                ...queryKeys.issues.all,
                'staff-queue',
            ],
        })

        await Swal.fire({
            title: 'Success!',
            text: 'Issue claimed successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#16a34a',
        })
    },

    onError: (err: Error) => {
        Swal.fire({
            title: 'Update Failed!',
            text: err.message || 'Unable to claim issue. Please try again.',
            icon: 'error',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#dc2626',
        })
    },
})

const {
    assignIssue,
    isAssigning,
    assignmentError,
    isAssignmentError,
} = useIssueAssignment()

const route = useRoute()
const router = useRouter()

const searchInput = ref(String(route.query.search ?? ''))

const page = computed(() => {
    const value = Number(route.query.page)
    return Number.isInteger(value) && value > 0 ? value : 1
})

const perPage = computed(() => {
    const value = Number(route.query.per_page)
    return [5, 10, 20, 50, 100].includes(value) ? value : 10
})

const getQueryParam = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
        return value
    }

    return undefined
}

const filters = computed<IssueListParams>(() => ({
    page: page.value,
    per_page: perPage.value,
    search: String(route.query.search ?? ''),
    status: getQueryParam(route.query.status),
    priority: getQueryParam(route.query.priority),
    category: getQueryParam(route.query.category),
    sort_by: String(route.query.sort_by ?? 'created_at'),
    sort_direction: String(route.query.sort_direction ?? 'desc'),
}))

const issuesQuery = useQuery({
    queryKey: computed(() => [
        ...queryKeys.issues.all,
        'staff-queue',
        filters.value,
    ]),
    queryFn: () => issueService.getIssues(filters.value),
    placeholderData: keepPreviousData,
})

const issues = computed(() => issuesQuery.data.value?.data ?? [])
const pagination = computed(() => issuesQuery.data.value?.meta)

const categoriesQuery = useQuery({
    queryKey: queryKeys.issueCategories,
    queryFn: () => issueService.getIssueCategories(),
    staleTime: Infinity,
})

const categories = computed(() => {
    const result = categoriesQuery.data.value
    return Array.isArray(result) ? result : result ?? []
})

watch(
    () => route.query.search,
    (value) => {
        searchInput.value = String(value ?? '')
    },
)

function updateFilters(values: Record<string, string | number>) {
    router.replace({
        query: {
            ...route.query,
            ...values,
            page: '1',
        },
    })
}

function applySearch() {
    updateFilters({ search: searchInput.value.trim() })
}

function changePage(nextPage: number) {
    if (!pagination.value) return

    if (nextPage < 1 || nextPage > pagination.value.last_page) return

    router.push({
        query: {
            ...route.query,
            page: String(nextPage),
        },
    })
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

function statusClass(status: string) {
    const classes: Record<string, string> = {
        pending: 'bg-amber-500/10 text-amber-700',
        in_progress: 'bg-blue-500/10 text-blue-700',
        resolved: 'bg-green-500/10 text-green-700',
        rejected: 'bg-red-500/10 text-red-700',
    }

    return classes[status] ?? 'bg-gray-500/10 text-gray-600'
}

function priorityClass(priority: string) {
    const classes: Record<string, string> = {
        low: 'bg-gray-500/10 text-gray-600',
        medium: 'bg-blue-500/10 text-blue-700',
        high: 'bg-orange-500/10 text-orange-700',
        urgent: 'bg-red-500/10 text-red-700',
    }

    return classes[priority] ?? 'bg-gray-500/10 text-gray-600'
}

function clearFilters() {
    searchInput.value = ''

    router.replace({
        query: {
            page: '1',
            per_page: String(perPage.value),
        },
    })
}
</script>

<template>
    <main class="space-y-6">
        <!-- Heading -->
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">
                    Issue Queue
                </h1>

                <p class="mt-1 text-sm text-text-muted">
                    Review and manage community reports assigned to you or awaiting assignment.
                </p>
            </div>

            <button type="button" @click="issuesQuery.refetch()" :disabled="issuesQuery.isFetching.value"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-medium text-text-body hover:bg-bg-page disabled:opacity-50">
                <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': issuesQuery.isFetching.value }" />
                Refresh
            </button>
        </header>

        <!-- Filters -->
        <section class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-sm">
            <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <!-- Search -->
                <form class="flex gap-2 xl:col-span-2" @submit.prevent="applySearch">
                    <div class="relative flex-1">
                        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

                        <input v-model="searchInput" type="search" placeholder="Search title, description, or UUID..."
                            class="w-full rounded-lg border border-border-subtle bg-bg-page py-2.5 pl-10 pr-3 text-sm text-text-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
                    </div>

                    <button type="submit"
                        class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                        Search
                    </button>
                </form>

                <!-- Status -->
                <select :value="filters.status"
                    @change="updateFilters({ status: ($event.target as HTMLSelectElement).value })"
                    class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2.5 text-sm text-text-body outline-none focus:border-brand">
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <!-- Priority -->
                <select :value="filters.priority"
                    @change="updateFilters({ priority: ($event.target as HTMLSelectElement).value })"
                    class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2.5 text-sm text-text-body outline-none focus:border-brand">
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>

                <!-- Category -->
                <select :value="filters.category"
                    @change="updateFilters({ category: ($event.target as HTMLSelectElement).value })"
                    class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2.5 text-sm text-text-body outline-none focus:border-brand">
                    <option value="">All categories</option>

                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>

                <!-- Sort -->
                <select :value="filters.sort_by"
                    @change="updateFilters({ sort_by: ($event.target as HTMLSelectElement).value })"
                    class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2.5 text-sm text-text-body outline-none focus:border-brand">
                    <option value="created_at">Date submitted</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="updated_at">Last updated</option>
                </select>

                <select :value="filters.sort_direction"
                    @change="updateFilters({ sort_direction: ($event.target as HTMLSelectElement).value })"
                    class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2.5 text-sm text-text-body outline-none focus:border-brand">
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                </select>

                <button type="button" @click="clearFilters"
                    class="text-left text-sm font-semibold text-brand hover:text-brand-dark">
                    Clear filters
                </button>
            </div>
        </section>

        <!-- Error -->
        <section v-if="issuesQuery.isError.value"
            class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Unable to load the issue queue.

            <button type="button" @click="issuesQuery.refetch()" class="ml-2 font-semibold underline">
                Try again
            </button>
        </section>

        <!-- Issue table -->
        <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
            <div
                class="flex flex-col justify-between gap-2 border-b border-border-subtle p-5 sm:flex-row sm:items-center">
                <div>
                    <h2 class="font-semibold text-text-heading">
                        Community Reports
                    </h2>

                    <p class="mt-1 text-sm text-text-muted">
                        {{ pagination?.total ?? 0 }} issues found
                    </p>
                </div>

                <select :value="perPage" @change="updateFilters({
                    per_page: Number(($event.target as HTMLSelectElement).value)
                })" class="rounded-lg border border-border-subtle bg-bg-page px-3 py-2 text-sm text-text-body">
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
            </div>

            <div v-if="issuesQuery.isLoading.value" class="p-12 text-center text-sm text-text-muted">
                Loading issues...
            </div>

            <div v-else-if="issues.length === 0" class="px-5 py-14 text-center">
                <ClipboardList class="mx-auto h-10 w-10 text-text-muted" />

                <h3 class="mt-3 font-semibold text-text-heading">
                    No issues found
                </h3>

                <p class="mt-1 text-sm text-text-muted">
                    Try changing your search or filters.
                </p>
            </div>

            <div v-if="isAssignmentError" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ assignmentError?.message ?? 'Unable to claim this issue. Please refresh and try again.' }}
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[950px] text-left text-sm">
                    <thead class="bg-bg-page text-xs uppercase text-text-muted">
                        <tr>
                            <th class="px-5 py-4 font-semibold">Issue</th>
                            <th class="px-5 py-4 font-semibold">Category</th>
                            <th class="px-5 py-4 font-semibold">Reporter</th>
                            <th class="px-5 py-4 font-semibold">Priority</th>
                            <th class="px-5 py-4 font-semibold">Status</th>
                            <th class="px-5 py-4 font-semibold">Assigned To</th>
                            <th class="px-5 py-4 font-semibold">Submitted</th>
                            <th class="px-5 py-4 text-right font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-border-subtle">
                        <tr v-for="issue in issues" :key="issue.uuid" class="transition hover:bg-bg-page/70">
                            <td class="px-5 py-4">
                                <p class="font-medium text-text-heading">
                                    {{ issue.title }}
                                </p>

                                <p class="mt-1 text-xs text-text-muted">
                                    {{ issue.uuid }}
                                </p>
                            </td>

                            <td class="px-5 py-4 text-text-body">
                                {{ issue.category?.name ?? 'Uncategorized' }}
                            </td>

                            <td class="px-5 py-4 text-text-body">
                                {{ issue.reporter?.fullName ?? 'Unknown' }}
                            </td>

                            <td class="px-5 py-4">
                                <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                                    :class="priorityClass(issue.priority)">
                                    {{ issue.priority }}
                                </span>
                            </td>

                            <td class="px-5 py-4">
                                <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                                    :class="statusClass(issue.status)">
                                    {{ issue.status.replace('_', ' ') }}
                                </span>
                            </td>

                            <td class="px-5 py-4 text-text-body">
                                {{ issue.assignee?.fullName ?? 'Unassigned' }}
                            </td>

                            <td class="px-5 py-4 text-text-muted">
                                {{ formatDate(issue.createdAt) }}
                            </td>

                            <td class="px-5 py-4 text-right">
                                <div class="inline-flex items-center justify-end gap-3">
                                    <button v-if="issue.status === 'pending' && !issue.assignee"
                                        class="rounded-lg cursor-pointer bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                                        :disabled="claimingIssueId === issue.uuid"
                                        @click="claimIssueMutation.mutate(issue.uuid)">
                                        <Loader2 v-if="claimingIssueId === issue.uuid" /> {{ claimingIssueId ===
                                        issue.uuid ? '' : 'Claim' }}
                                    </button>

                                    <RouterLink :to="{
                                        name: 'issueDiscussion',
                                        params: { uuid: issue.uuid },
                                    }"
                                        class="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark">
                                        <Eye class="h-4 w-4" />
                                        View
                                    </RouterLink>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination && pagination.last_page > 1"
                class="flex flex-col justify-between gap-3 border-t border-border-subtle p-5 sm:flex-row sm:items-center">
                <p class="text-sm text-text-muted">
                    Showing
                    <strong class="text-text-heading">
                        {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }}
                    </strong>
                    of
                    <strong class="text-text-heading">
                        {{ pagination.total }}
                    </strong>
                    issues
                </p>

                <div class="flex items-center gap-2">
                    <button type="button" @click="changePage(page - 1)" :disabled="page <= 1"
                        class="rounded-lg border border-border-subtle p-2 text-text-body hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronLeft class="h-4 w-4" />
                    </button>

                    <span class="text-sm text-text-body">
                        Page {{ pagination.current_page }} of {{ pagination.last_page }}
                    </span>

                    <button type="button" @click="changePage(page + 1)" :disabled="page >= pagination.last_page"
                        class="rounded-lg border border-border-subtle p-2 text-text-body hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronRight class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    </main>
</template>
