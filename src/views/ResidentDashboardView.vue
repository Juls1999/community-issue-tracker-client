```vue
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
    }

    return labels[status]
}

function statusClass(status: Issue['status']) {
    const classes: Record<Issue['status'], string> = {
        pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
        in_progress: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
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
    <main class="mx-auto max-w-6xl space-y-8 bg-bg-page px-4 py-8 sm:px-6">
        <!-- Page heading -->
        <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <p class="text-sm text-text-muted">
                    Community Issue Tracker
                </p>

                <h1 class="mt-1 text-3xl font-bold text-text-heading">
                    Resident Dashboard
                </h1>

                <p class="mt-2 text-text-body">
                    Track the community issues you've reported.
                </p>
            </div>

            <RouterLink :to="{ name: 'issue-create' }"
                class="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 font-medium text-brand-foreground transition hover:opacity-90">
                Report an issue
            </RouterLink>
        </header>

        <!-- Error message -->
        <div v-if="errorMessage" role="alert"
            class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {{ errorMessage }}

            <button class="ml-2 font-medium underline underline-offset-4" type="button" @click="loadIssues">
                Retry
            </button>
        </div>

        <!-- Issue statistics -->
        <section class="grid gap-4 sm:grid-cols-3">
            <article class="rounded-xl border border-border-subtle bg-bg-surface p-5">
                <p class="text-sm text-text-muted">Pending</p>

                <p class="mt-2 text-3xl font-bold text-amber-400">
                    {{ loading ? '—' : statusCounts.pending }}
                </p>
            </article>

            <article class="rounded-xl border border-border-subtle bg-bg-surface p-5">
                <p class="text-sm text-text-muted">In progress</p>

                <p class="mt-2 text-3xl font-bold text-blue-400">
                    {{ loading ? '—' : statusCounts.in_progress }}
                </p>
            </article>

            <article class="rounded-xl border border-border-subtle bg-bg-surface p-5">
                <p class="text-sm text-text-muted">Resolved</p>

                <p class="mt-2 text-3xl font-bold text-emerald-400">
                    {{ loading ? '—' : statusCounts.resolved }}
                </p>
            </article>
        </section>

        <!-- Recent reports -->
        <section class="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
            <div class="flex items-center justify-between gap-3 border-b border-border-subtle p-5">
                <div>
                    <h2 class="text-lg font-semibold text-text-heading">
                        My recent reports
                    </h2>

                    <p class="mt-1 text-sm text-text-muted">
                        The latest issues submitted from your account.
                    </p>
                </div>

                <RouterLink :to="{ name: 'resident-reports' }"
                    class="shrink-0 text-sm font-medium text-brand transition hover:opacity-80">
                    View all
                </RouterLink>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="space-y-3 p-5" aria-live="polite" aria-label="Loading reports">
                <div v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-lg bg-bg-page" />
            </div>

            <!-- Empty state -->
            <div v-else-if="issues.length === 0" class="p-10 text-center">
                <h3 class="font-semibold text-text-heading">
                    No reports yet
                </h3>

                <p class="mt-2 text-sm text-text-muted">
                    Report a community issue to get started.
                </p>

                <RouterLink :to="{ name: 'issue-create' }"
                    class="mt-4 inline-block font-medium text-brand hover:opacity-80">
                    Create your first report
                </RouterLink>
            </div>

            <!-- Reports list -->
            <ul v-else class="divide-y divide-border-subtle">
                <li v-for="issue in issues.slice(0, 5)" :key="issue.uuid"
                    class="flex flex-col justify-between gap-3 p-5 transition hover:bg-bg-page/50 sm:flex-row sm:items-center">
                    <div class="min-w-0">
                        <RouterLink :to="`/issues/${issue.uuid}`"
                            class="font-medium text-text-heading transition hover:text-brand">
                            {{ issue.title }}
                        </RouterLink>

                        <p class="mt-1 text-sm text-text-muted">
                            {{ issue.category?.name ?? 'Uncategorized' }}

                            <span v-if="issue.barangay">
                                · {{ issue.barangay.name }}
                            </span>

                            · {{ new Date(issue.created_at).toLocaleDateString() }}
                        </p>
                    </div>

                    <span
                        class="inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset"
                        :class="statusClass(issue.status)">
                        {{ statusLabel(issue.status) }}
                    </span>
                </li>
            </ul>
        </section>
    </main>
</template>