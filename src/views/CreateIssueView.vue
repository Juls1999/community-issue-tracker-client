<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { issueService } from '@/services/issueService'

interface Category {
    id: number
    name: string
}

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
            errorMessage.value = 'Could not submit your report. Please try again.'
        }
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div class="mb-6">
            <RouterLink to="/resident/dashboard" class="text-sm text-slate-400 hover:text-white">
                ← Back to dashboard
            </RouterLink>

            <h1 class="mt-4 text-3xl font-bold text-white">
                Report a community issue
            </h1>

            <p class="mt-2 text-slate-400">
                Provide enough detail to help the appropriate team investigate.
            </p>
        </div>

        <div v-if="errorMessage" role="alert"
            class="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {{ errorMessage }}
        </div>

        <form class="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-7"
            @submit.prevent="submitIssue">
            <div>
                <label for="title" class="mb-2 block text-sm font-medium text-slate-200">
                    Issue title
                </label>
                <input id="title" v-model="title" required maxlength="255"
                    placeholder="e.g. Damaged road near the barangay hall"
                    class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none" />
            </div>

            <div>
                <label for="description" class="mb-2 block text-sm font-medium text-slate-200">
                    Description
                </label>
                <textarea id="description" v-model="description" required maxlength="10000" rows="5"
                    placeholder="Describe the location, problem, and any relevant details..."
                    class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none" />
            </div>

            <div>
                <label for="category" class="mb-2 block text-sm font-medium text-slate-200">
                    Category
                </label>
                <select id="category" v-model="categoryId" required
                    :disabled="loadingCategories || categories.length === 0"
                    class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-rose-500 focus:outline-none disabled:opacity-50">
                    <option value="" disabled>
                        {{ loadingCategories ? 'Loading categories...' : 'Select a category' }}
                    </option>
                    <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                        {{ category.name }}
                    </option>
                </select>
            </div>

            <div>
                <label for="priority" class="mb-2 block text-sm font-medium text-slate-200">
                    Priority
                </label>
                <select id="priority" v-model="priority"
                    class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-rose-500 focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
                <p class="mt-2 text-xs text-slate-400">
                    Priority is a request for attention; staff can review it.
                </p>
            </div>

            <button type="submit" :disabled="submitting || loadingCategories || categories.length === 0"
                class="w-full rounded-lg bg-rose-600 px-5 py-3 font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50">
                {{ submitting ? 'Submitting report...' : 'Submit report' }}
            </button>
        </form>
    </main>
</template>
