<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

interface BreadcrumbItem {
    label: string
    to?: string | { name: string }
}

const route = useRoute()

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
        { label: 'Dashboard', to: { name: 'resident-dashboard' } },
    ]

    if (route.name === 'resident-dashboard') {
        return [{ label: 'Dashboard' }]
    }

    if (route.name === 'resident-reports') {
        items.push({ label: 'My Reports' })
        return items
    }

    if (route.name === 'issue-create') {
        items.push(
            { label: 'My Reports', to: { name: 'resident-reports' } },
            { label: 'Create Report' },
        )
        return items
    }

    if (route.name === 'issueDiscussion') {
        items.push(
            { label: 'My Reports', to: { name: 'resident-reports' } },
            { label: 'Issue Details' },
        )
        return items
    }

    return items
})
</script>

<template>
    <nav aria-label="Breadcrumb" class="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <template v-for="(item, index) in breadcrumbs" :key="item.label">
            <svg v-if="index > 0" viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-text-muted" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
            </svg>

            <RouterLink v-if="item.to" :to="item.to" class="text-text-muted transition hover:text-brand">
                {{ item.label }}
            </RouterLink>

            <span v-else class="font-semibold text-text-heading" aria-current="page">
                {{ item.label }}
            </span>
        </template>
    </nav>
</template>
