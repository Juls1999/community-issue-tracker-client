<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'

import { issueService } from '@/services/issueService'
import IssueDiscussion from '@/components/issues/IssueDiscussion.vue'
import type { Issue, IssueEditForm, IssuesResponse, IssueUpdatePayload } from '@/types'
import Swal from 'sweetalert2'

const route = useRoute()
const queryClient = useQueryClient()

const originalForm = ref<IssueEditForm | null>(null)

const populateEditForm = () => {
  if (!issue.value) return

  editForm.title = issue.value.title ?? ''
  editForm.description = issue.value.description ?? ''
  editForm.category.id = issue.value.category?.id ?? 0

  editForm.latitude =
    issue.value.latitude != null
      ? String(issue.value.latitude)
      : ''

  editForm.longitude =
    issue.value.longitude != null
      ? String(issue.value.longitude)
      : ''

  // Save original values
  originalForm.value = {
    title: editForm.title,
    description: editForm.description,
    category: {
      id: editForm.category.id,
    },
    latitude: editForm.latitude,
    longitude: editForm.longitude,
  }

  formError.value = ''
  successMessage.value = ''
}

const isDirty = computed(() => {
  if (!originalForm.value) return false

  return (
    editForm.title !== originalForm.value.title ||
    editForm.description !== originalForm.value.description ||
    editForm.category.id !== originalForm.value.category.id ||
    editForm.latitude !== originalForm.value.latitude ||
    editForm.longitude !== originalForm.value.longitude
  )
})

// --------------------------------------------------
// State
// --------------------------------------------------

const issueUuid = computed(() => String(route.params.uuid ?? ''))

const isEditModalOpen = ref(false)
const formError = ref('')
const successMessage = ref('')
const canEdit = computed(() => {
  return issue.value?.status === 'pending'
})



const editForm = reactive<IssueEditForm>({
  title: '',
  description: '',
  category: {
    id: 0,
  },
  latitude: '',
  longitude: '',
})

// --------------------------------------------------
// Issue Query
// --------------------------------------------------

const {
  data: issue,
  isPending,
  isError,
  isFetching,
  error,
  refetch,
} = useQuery({
  queryKey: ['issue', issueUuid],
  queryFn: () => issueService.getIssue(issueUuid.value),
  enabled: computed(() => !!issueUuid.value),
  staleTime: Infinity,
})

// --------------------------------------------------
// Categories Query
// --------------------------------------------------

const {
  data: issueCategories,
  isPending: loadingCategories,
  isError: failCategories,
  refetch: refetchCategories,
} = useQuery({
  queryKey: ['issue-categories'],
  queryFn: () => issueService.getIssueCategories(),
  staleTime: Infinity,
})

// --------------------------------------------------
// Form Helpers
// --------------------------------------------------

const startEditing = () => {
  populateEditForm()
  isEditModalOpen.value = true
}

const cancelEditing = () => {
  populateEditForm()
  isEditModalOpen.value = false
  formError.value = ''
}

const validateForm = (): boolean => {
  if (!editForm.title.trim()) {
    formError.value = 'Please enter an issue title.'
    return false
  }

  if (!editForm.description.trim()) {
    formError.value = 'Please enter an issue description.'
    return false
  }

  if (!editForm.category.id) {
    formError.value = 'Please select an issue category.'
    return false
  }

  if (
    editForm.latitude !== '' &&
    (!Number.isFinite(Number(editForm.latitude)) ||
      Number(editForm.latitude) < -90 ||
      Number(editForm.latitude) > 90)
  ) {
    formError.value = 'Please enter a valid latitude between -90 and 90.'
    return false
  }

  if (
    editForm.longitude !== '' &&
    (!Number.isFinite(Number(editForm.longitude)) ||
      Number(editForm.longitude) < -180 ||
      Number(editForm.longitude) > 180)
  ) {
    formError.value = 'Please enter a valid longitude between -180 and 180.'
    return false
  }

  return true
}

// --------------------------------------------------
// Update Mutation
// --------------------------------------------------


const {
  mutateAsync: updateIssue,
  isPending: isSaving,
} = useMutation({
  mutationFn: (payload: IssueUpdatePayload) =>
    issueService.updateIssue(issueUuid.value, payload),

  onSuccess: async () => {
    isEditModalOpen.value = false
    formError.value = ''

    // Find the selected category
    const selectedCategory = issueCategories.value?.find(
      (category) => category.id === editForm.category.id
    )

    // date and time of update
    const updateTime = new Date().toISOString()

    // Update individual issue cache
    const updatedIssue = queryClient.setQueryData<Issue>(
      ['issue', issueUuid.value],
      (oldData) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          title: editForm.title,
          description: editForm.description,
          category: selectedCategory
            ? { ...selectedCategory }
            : oldData.category,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          updatedAt: updateTime
        }
      }
    )

    // Update dashboard issues cache
    queryClient.setQueryData<IssuesResponse>(
      ['issues'],
      (oldData) => {
        if (!oldData || !updatedIssue) return oldData

        return {
          ...oldData,
          data: oldData.data.map((item) =>
            item.uuid === issueUuid.value
              ? updatedIssue
              : item
          ),
        }
      }
    )

    // Update my reports page issues cache for all status
    queryClient.setQueriesData<IssuesResponse>(
      { queryKey: ['issues', 'list'] },
      (oldData) => {
        if (!oldData || !updatedIssue) return oldData

        return {
          ...oldData,
          data: oldData.data.map((item) =>
            item.uuid === issueUuid.value
              ? updatedIssue
              : item
          ),
        }
      }
    )

    await Swal.fire({
      title: 'Success!',
      text: 'Issue updated successfully.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#16a34a',
    })
  },

  onError: (err: Error) => {
    Swal.fire({
      title: 'Update Failed!',
      text: err.message || 'Unable to update issue. Please try again.',
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#dc2626',
    })
  },
})


const saveIssue = async () => {
  formError.value = ''

  if (!validateForm()) {
    await Swal.fire({
      title: 'Invalid Information',
      text: formError.value,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d97706',
    })

    return
  }

  const payload: IssueUpdatePayload = {
    title: editForm.title.trim(),
    description: editForm.description.trim(),
    issue_category_id: editForm.category.id,
    latitude:
      editForm.latitude === ''
        ? null
        : Number(editForm.latitude),
    longitude:
      editForm.longitude === ''
        ? null
        : Number(editForm.longitude),
  }

  try {
    await updateIssue(payload)
  } catch {
    // Error popup is handled by mutation onError.
  }
}

// --------------------------------------------------
// Status and Priority
// --------------------------------------------------

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  }

  return issue.value
    ? labels[issue.value.status] ?? issue.value.status
    : ''
})

const statusClass = computed(() => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return issue.value
    ? classes[issue.value.status] ?? 'bg-gray-100 text-gray-700'
    : ''
})

const priorityClass = computed(() => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }

  return issue.value
    ? classes[issue.value.priority] ?? 'bg-gray-100 text-gray-700'
    : ''
})

// --------------------------------------------------
// Date and Error Helpers
// --------------------------------------------------

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const errorMessage = computed(() =>
  error.value instanceof Error
    ? error.value.message
    : 'Unable to load this issue. Please try again.',
)
</script>


<template>
  <main class="mx-auto max-w-4xl space-y-6 p-6">

    <!-- Initial Loading -->
    <section v-if="isPending" class="space-y-4 rounded-xl border border-border-subtle bg-bg-surface p-6">
      <div class="h-6 w-2/3 animate-pulse rounded bg-bg-page" />
      <div class="h-4 w-1/3 animate-pulse rounded bg-bg-page" />
      <div class="h-24 animate-pulse rounded bg-bg-page" />
    </section>

    <!-- Fetch Error -->
    <section v-else-if="isError" class="rounded-xl border border-border-subtle bg-bg-surface p-8 text-center">
      <p class="font-medium text-text-heading">
        Something went wrong
      </p>

      <p class="mt-2 text-sm text-text-muted">
        {{ errorMessage }}
      </p>

      <button type="button" class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        @click="refetch()">
        Try Again
      </button>
    </section>

    <!-- Issue Details -->
    <template v-else-if="issue">

      <!-- Success Message -->
      <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        role="status">
        {{ successMessage }}
      </div>

      <!-- Edit Form -->

      <!-- Edit Report Modal -->
      <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="isEditModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div class="my-auto w-full max-w-2xl rounded-xl border border-border-subtle bg-bg-surface shadow-xl"
              role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">

              <!-- Modal Header -->
              <div class="flex items-center justify-between border-b border-border-subtle p-6">
                <div>
                  <h2 id="edit-modal-title" class="text-xl font-bold text-text-heading">
                    Edit Report
                  </h2>

                  <p class="mt-1 text-sm text-text-muted">
                    Update the information about your submitted issue.
                  </p>
                </div>

              </div>

              <!-- Modal Body -->
              <form class="space-y-5 p-6" @submit.prevent="saveIssue">

                <!-- Title -->
                <div class="space-y-2">
                  <label for="issue-title" class="text-sm font-medium text-text-heading">
                    Issue Title
                  </label>

                  <input id="issue-title" v-model="editForm.title" type="text" maxlength="255" required
                    :disabled="isSaving"
                    class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand disabled:opacity-60"
                    placeholder="Enter issue title" />
                </div>

                <!-- Description -->
                <div class="space-y-2">
                  <label for="issue-description" class="text-sm font-medium text-text-heading">
                    Description
                  </label>

                  <textarea id="issue-description" v-model="editForm.description" rows="5" maxlength="10000" required
                    :disabled="isSaving"
                    class="w-full resize-y rounded-lg border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand disabled:opacity-60"
                    placeholder="Describe the issue..." />
                </div>

                <!-- Category -->
                <div class="space-y-2">
                  <label for="issue-category" class="text-sm font-medium text-text-heading">
                    Issue Category
                  </label>

                  <select id="issue-category" v-model.number="editForm.category.id" required
                    :disabled="loadingCategories || failCategories || isSaving"
                    class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand disabled:opacity-60">
                    <option :value="0" disabled>
                      Select a category
                    </option>

                    <option v-for="category in issueCategories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>

                  <p v-if="loadingCategories" class="text-xs text-text-muted">
                    Loading categories...
                  </p>

                  <p v-if="failCategories" class="text-xs text-red-600">
                    Unable to load categories.

                    <button type="button" class="font-semibold underline" @click="refetchCategories()">
                      Try again
                    </button>
                  </p>
                </div>

                <!-- Coordinates -->
                <div class="grid gap-4 sm:grid-cols-2">

                  <div class="space-y-2">
                    <label for="issue-latitude" class="text-sm font-medium text-text-heading">
                      Latitude
                    </label>

                    <input id="issue-latitude" v-model="editForm.latitude" type="number" step="any" min="-90" max="90"
                      :disabled="isSaving"
                      class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand disabled:opacity-60"
                      placeholder="Latitude" />
                  </div>

                  <div class="space-y-2">
                    <label for="issue-longitude" class="text-sm font-medium text-text-heading">
                      Longitude
                    </label>

                    <input id="issue-longitude" v-model="editForm.longitude" type="number" step="any" min="-180"
                      max="180" :disabled="isSaving"
                      class="w-full rounded-lg border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-heading outline-none focus:border-brand disabled:opacity-60"
                      placeholder="Longitude" />
                  </div>

                </div>

                <!-- Error -->
                <div v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert">
                  {{ formError }}
                </div>

                <!-- Modal Footer -->
                <div class="flex flex-col-reverse justify-end gap-3 border-t border-border-subtle pt-5 sm:flex-row">

                  <button type="button" :disabled="isSaving"
                    class="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-semibold text-text-body transition hover:bg-bg-page disabled:opacity-50"
                    @click="cancelEditing">
                    Cancel
                  </button>

                  <button type="submit" :disabled="isSaving ||
                    loadingCategories ||
                    failCategories ||
                    !editForm.title.trim() ||
                    !editForm.description.trim() ||
                    !editForm.category.id ||
                    !isDirty
                    "
                    class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                    {{ isSaving ? 'Saving Changes...' : 'Save Changes' }}
                  </button>

                </div>

              </form>
            </div>
          </div>
        </Transition>
      </Teleport>


      <!-- Issue Information -->
      <section v-if="!isEditModalOpen" class="space-y-6 rounded-xl border border-border-subtle bg-bg-surface p-6">

        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

          <div class="space-y-2">
            <p class="text-sm text-text-muted">
              Issue Reference
            </p>

            <p class="break-all text-xs text-text-muted">
              {{ issue.uuid }}
            </p>

            <h1 class="text-2xl font-bold text-text-heading">
              {{ issue.title }}
            </h1>
          </div>

          <!-- Status and Priority -->
          <div class="flex flex-wrap gap-2">

            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass">
              {{ statusLabel }}
            </span>

            <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize" :class="priorityClass">
              {{ issue.priority }} Priority
            </span>

          </div>
        </div>

        <div class="border-t border-border-subtle" />

        <!-- Issue Information -->
        <div class="grid gap-5 sm:grid-cols-2">

          <!-- Category -->
          <div>
            <p class="text-sm text-text-muted">
              Category
            </p>

            <p class="mt-1 font-medium text-text-heading">
              {{ issue.category?.name ?? 'Uncategorized' }}
            </p>
          </div>

          <!-- Barangay -->
          <div>
            <p class="text-sm text-text-muted">
              Barangay
            </p>

            <p class="mt-1 font-medium text-text-heading">
              {{ issue.barangay?.name ?? 'Not specified' }}
            </p>
          </div>

          <!-- Date Submitted -->
          <div>
            <p class="text-sm text-text-muted">
              Date Submitted
            </p>

            <p class="mt-1 font-medium text-text-heading">
              {{ formatDate(issue.createdAt) }}
            </p>
          </div>

          <!-- Last Updated -->
          <div>
            <p class="text-sm text-text-muted">
              Last Updated
            </p>

            <p class="mt-1 font-medium text-text-heading">
              {{ formatDate(issue.updatedAt) }}
            </p>
          </div>

        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h2 class="font-semibold text-text-heading">
            Description
          </h2>

          <p class="whitespace-pre-line text-sm leading-7 text-text-body">
            {{ issue.description }}
          </p>
        </div>

        <!-- Fetching Indicator -->
        <div v-if="isFetching" class="text-xs text-text-muted">
          Updating issue information...
        </div>

        <!-- Edit Button -->
        <div class="flex justify-end border-t border-border-subtle pt-4">
          <button type="button"
            class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            @click="startEditing">
            Edit Report
          </button>
        </div>

      </section>

      <!-- Issue Discussion -->
      <IssueDiscussion :issue-uuid="issueUuid" />

    </template>

  </main>
</template>
