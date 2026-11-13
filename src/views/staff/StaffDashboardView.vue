<script setup lang="ts">
import {
    ClipboardList,
    Clock3,
    CheckCircle2,
    CircleAlert,
    ArrowRight,
    RefreshCw,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useStaffDashboard } from '@/composables/useStaffDashboard'

const {
    statistics,
    recentIssues,
    isLoading,
    isError,
    refetch,
} = useStaffDashboard()

const statCards = computed(() => [
    {
        label: 'Total Issues',
        value: statistics.value?.total ?? 0,
        icon: ClipboardList,
        color: 'text-brand',
        background: 'bg-brand/10',
    },
    {
        label: 'Pending',
        value: statistics.value?.pending ?? 0,
        icon: CircleAlert,
        color: 'text-amber-600',
        background: 'bg-amber-500/10',
    },
    {
        label: 'In Progress',
        value: statistics.value?.inProgress ?? 0,
        icon: Clock3,
        color: 'text-blue-600',
        background: 'bg-blue-500/10',
    },
    {
        label: 'Resolved',
        value: statistics.value?.resolved ?? 0,
        icon: CheckCircle2,
        color: 'text-green-600',
        background: 'bg-green-500/10',
    },
])

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
    }

    return classes[status] ?? 'bg-gray-500/10 text-gray-600'
}

function statusLabel(status: string) {
    return status.replace('_', ' ')
}
</script>

<template>
    <main class="space-y-8">
        <!-- Page heading -->
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">
                    Staff Dashboard
                </h1>

                <p class="mt-1 text-sm text-text-muted">
                    Monitor and manage community issues in your barangay.
                </p>
            </div>

            <button type="button" @click="refetch()" :disabled="isLoading"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-medium text-text-body transition hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-50">
                <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
                Refresh
            </button>
        </header>

        <!-- Loading state -->
        <section v-if="isLoading && !statistics" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="item in 4" :key="item"
                class="h-32 animate-pulse rounded-xl border border-border-subtle bg-bg-surface" />
        </section>

        <!-- Error state -->
        <section v-else-if="isError" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p class="font-semibold text-red-700">
                Unable to load dashboard data.
            </p>

            <p class="mt-1 text-sm text-red-600">
                Please check your connection and try again.
            </p>

            <button type="button" @click="refetch()"
                class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Try Again
            </button>
        </section>

        <template v-else>
            <!-- Statistics cards -->
            <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article v-for="card in statCards" :key="card.label"
                    class="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-text-muted">
                            {{ card.label }}
                        </p>

                        <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="card.background">
                            <component :is="card.icon" class="h-5 w-5" :class="card.color" />
                        </div>
                    </div>

                    <p class="mt-4 text-3xl font-bold text-text-heading">
                        {{ card.value }}
                    </p>
                </article>
            </section>

            <!-- Recent issues -->
            <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
                <div
                    class="flex flex-col justify-between gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 class="font-semibold text-text-heading">
                            Recent Issues
                        </h2>

                        <p class="mt-1 text-sm text-text-muted">
                            Latest issues available in your barangay.
                        </p>
                    </div>

                    <!-- <RouterLink :to="{ name: 'staff-issues' }"
                        class="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
                        View Issue Queue
                        <ArrowRight class="h-4 w-4" />
                    </RouterLink> -->
                </div>

                <div v-if="!recentIssues?.length" class="px-5 py-12 text-center">
                    <ClipboardList class="mx-auto h-10 w-10 text-text-muted" />

                    <h3 class="mt-3 font-semibold text-text-heading">
                        No issues found
                    </h3>

                    <p class="mt-1 text-sm text-text-muted">
                        There are currently no issues available for your account.
                    </p>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="w-full min-w-175 text-left text-sm">
                        <thead class="bg-bg-page text-xs uppercase text-text-muted">
                            <tr>
                                <th class="px-5 py-4 font-semibold">Issue</th>
                                <th class="px-5 py-4 font-semibold">Category</th>
                                <th class="px-5 py-4 font-semibold">Reporter</th>
                                <th class="px-5 py-4 font-semibold">Status</th>
                                <th class="px-5 py-4 font-semibold">Date Submitted</th>
                                <th class="px-5 py-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-border-subtle">
                            <tr v-for="issue in recentIssues" :key="issue.uuid" class="transition hover:bg-bg-page/70">
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
                                    <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize"
                                        :class="statusClass(issue.status)">
                                        {{ statusLabel(issue.status) }}
                                    </span>
                                </td>

                                <td class="px-5 py-4 text-text-muted">
                                    {{ formatDate(issue.createdAt) }}
                                </td>

                                <td class="px-5 py-4 text-right">
                                    <RouterLink :to="{
                                        name: 'issueDiscussion',
                                        params: { uuid: issue.uuid },
                                    }" class="font-semibold text-brand hover:text-brand-dark">
                                        View
                                    </RouterLink>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </template>
    </main>
</template>
