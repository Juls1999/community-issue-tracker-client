<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/vue-query'

import {
    issueDiscussionService,
} from '@/services/issueDiscussionService'

import { issueDiscussionKeys } from '@/queries/issueDiscussionKeys'
import type { IssueAttachment, IssueComment } from '@/types'

import { toast } from 'vue3-toastify'

// -----------------------------------------
// Props
// -----------------------------------------

const props = defineProps<{
    issueUuid: string
}>()

// -----------------------------------------
// Query client
// -----------------------------------------

const queryClient = useQueryClient()

// -----------------------------------------
// Local UI state
// -----------------------------------------

const commentBody = ref('')
const selectedImages = ref<File[]>([])

const actionError = ref('')

const imageUrls = ref<Record<number, string>>({})
const failedImages = ref<number[]>([])

// -----------------------------------------
// Query keys
// -----------------------------------------

const commentsKey = computed(() =>
    issueDiscussionKeys.comments(props.issueUuid)
)

const attachmentsKey = computed(() =>
    issueDiscussionKeys.attachments(props.issueUuid)
)

// -----------------------------------------
// Comments query
// -----------------------------------------

const {
    data: commentsData,
    isPending: commentsPending,
    isError: commentsError,
    error: commentsQueryError,
    refetch: refetchComments,
} = useQuery({
    queryKey: commentsKey,

    queryFn: () =>
        issueDiscussionService.getComments(props.issueUuid),

    enabled: computed(() => !!props.issueUuid),

    staleTime: 10000 * 60 * 5,
})

// -----------------------------------------
// Attachments query
// -----------------------------------------

const {
    data: attachmentsData,
    isPending: attachmentsPending,
    isError: attachmentsError,
    error: attachmentsQueryError,
    refetch: refetchAttachments,
} = useQuery({
    queryKey: attachmentsKey,

    queryFn: () =>
        issueDiscussionService.getAttachments(props.issueUuid),

    enabled: computed(() => !!props.issueUuid),

    staleTime: 1000 * 60 * 5,
})

// -----------------------------------------
// Derived server data
// -----------------------------------------

const comments = computed<IssueComment[]>(() =>
    commentsData.value ?? []
)

const attachments = computed<IssueAttachment[]>(() =>
    attachmentsData.value?.data ?? []
)

const loading = computed(() =>
    commentsPending.value || attachmentsPending.value
)

// -----------------------------------------
// Error handling
// -----------------------------------------

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
            return 'Your session has expired. Please sign in again.'
        }

        if (error.response?.status === 403) {
            return 'You do not have permission to access this issue.'
        }

        if (error.response?.status === 422) {
            return Object.values(
                error.response.data?.errors ?? {},
            )
                .flat()
                .join(' ') || 'Please check the submitted information.'
        }
    }

    return 'Something went wrong. Please try again.'
}

const errorMessage = computed(() => {
    if (actionError.value) {
        return actionError.value
    }

    if (commentsError.value) {
        return getErrorMessage(commentsQueryError.value)
    }

    if (attachmentsError.value) {
        return getErrorMessage(attachmentsQueryError.value)
    }

    return ''
})

// -----------------------------------------
// Add comment mutation
// -----------------------------------------

const addCommentMutation = useMutation({
    mutationFn: (body: string) =>
        issueDiscussionService.addComment(
            props.issueUuid,
            body,
        ),

    onSuccess: async () => {
        commentBody.value = ''
        actionError.value = ''
        toast.success('Comment added sucessfully')

        await queryClient.invalidateQueries({
            queryKey: commentsKey.value,
        })
    },

    onError: (error: unknown) => {
        actionError.value = getErrorMessage(error)
    },
})

const submittingComment = computed(() =>
    addCommentMutation.isPending.value
)

const submitComment = () => {
    const body = commentBody.value.trim()

    if (!body || submittingComment.value || !props.issueUuid) {
        return
    }

    actionError.value = ''

    addCommentMutation.mutate(body)
}

// -----------------------------------------
// Image selection
// -----------------------------------------


const handleImageSelection = (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files ?? [])

    actionError.value = ''

    if (files.length === 0) {
        selectedImages.value = []
        return
    }

    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ]

    const invalidType = files.find(
        file => !allowedTypes.includes(file.type)
    )

    if (invalidType) {
        actionError.value =
            'All files must be JPG, PNG, or WebP images.'

        input.value = ''
        selectedImages.value = []
        return
    }

    const oversizedFile = files.find(
        file => file.size > 5 * 1024 * 1024
    )

    if (oversizedFile) {
        actionError.value =
            'Each image must be 5 MB or smaller.'

        input.value = ''
        selectedImages.value = []
        return
    }

    selectedImages.value = files
}

// -----------------------------------------
// Upload attachment mutation
// -----------------------------------------

const uploadAttachmentMutation = useMutation({
    mutationFn: (files: File[]) =>
        issueDiscussionService.uploadAttachment(
            props.issueUuid,
            files,
        ),

    onSuccess: async () => {
        selectedImages.value = []

        const input = document.getElementById(
            'issue-image',
        ) as HTMLInputElement | null

        if (input) input.value = ''

        actionError.value = ''
        toast.success('Photo/s uploaded successfully')

        await queryClient.invalidateQueries({
            queryKey: attachmentsKey.value,
        })
    },

    onError: (error: unknown) => {
        actionError.value = getErrorMessage(error)
    },
})

const uploadingImage = computed(() =>
    uploadAttachmentMutation.isPending.value
)


const uploadImage = () => {
    if (
        selectedImages.value.length === 0 ||
        uploadingImage.value ||
        !props.issueUuid
    ) {
        return
    }

    actionError.value = ''

    uploadAttachmentMutation.mutate([
        ...selectedImages.value,
    ])
}

// -----------------------------------------
// Attachment image query
// -----------------------------------------

const imageBlobsQuery = useQuery({
    queryKey: computed(() => [
        'issueDiscussion',
        'attachmentImages',
        props.issueUuid,
        attachments.value.map(item => item.id),
    ]),

    queryFn: async () => {
        const results = await Promise.all(
            attachments.value.map(async attachment => {
                try {
                    const url = issueDiscussionService.getDownloadUrl(
                        props.issueUuid,
                        attachment.id,
                    )

                    const response = await axios.get(url, {
                        responseType: 'blob',
                    })

                    if (!response.data.type.startsWith('image/')) {
                        return {
                            id: attachment.id,
                            blob: null,
                        }
                    }

                    return {
                        id: attachment.id,
                        blob: response.data as Blob,
                    }
                } catch {
                    return {
                        id: attachment.id,
                        blob: null,
                    }
                }
            })
        )

        return results
    },

    enabled: computed(() =>
        !!props.issueUuid && attachments.value.length > 0
    ),

    staleTime: 1000 * 60 * 5,
})

// -----------------------------------------
// Convert image blobs to browser URLs
// -----------------------------------------

const clearImageUrls = () => {
    Object.values(imageUrls.value).forEach(url => {
        URL.revokeObjectURL(url)
    })

    imageUrls.value = {}
    failedImages.value = []
}

watch(
    () => imageBlobsQuery.data.value,
    results => {
        clearImageUrls()

        if (!results) return

        const urls: Record<number, string> = {}
        const failures: number[] = []

        results.forEach(result => {
            if (result.blob) {
                urls[result.id] = URL.createObjectURL(result.blob)
            } else {
                failures.push(result.id)
            }
        })

        imageUrls.value = urls
        failedImages.value = failures
    },
    { immediate: true },
)

// -----------------------------------------
// Download attachment
// -----------------------------------------



const downloadAttachment = async (attachmentId: number) => {
    actionError.value = ''

    try {
        const url = issueDiscussionService.getDownloadUrl(
            props.issueUuid,
            attachmentId,
        )

        const response = await axios.get(url, {
            responseType: 'blob',
        })

        const objectUrl = URL.createObjectURL(response.data)
        const link = document.createElement('a')

        const attachment = attachments.value.find(
            item => item.id === attachmentId
        )

        link.href = objectUrl
        link.download = attachment?.original_name ?? 'attachment'

        document.body.appendChild(link)
        link.click()
        link.remove()

        window.setTimeout(() => {
            URL.revokeObjectURL(objectUrl)
        }, 1000)

    } catch (error: unknown) {
        actionError.value = getErrorMessage(error)
    }
}

// -----------------------------------------
// Refresh discussion
// -----------------------------------------

const refreshDiscussion = async () => {
    await Promise.all([
        refetchComments(),
        refetchAttachments(),
    ])
}


// -----------------------------------------
// Cleanup
// -----------------------------------------

onBeforeUnmount(() => {
    clearImageUrls()
})
</script>


<template>
    <section class="space-y-8">
        <!-- Error message -->
        <div v-if="errorMessage" role="alert"
            class="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" stroke-linecap="round" />
            </svg>

            <p>{{ errorMessage }}</p>
        </div>


        <!-- Discussion -->
        <div class="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            <div class="border-b border-border-subtle p-5 sm:p-6">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path
                                d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div>
                        <h2 class="text-lg font-semibold text-text-heading">
                            Discussion
                        </h2>

                        <p class="mt-0.5 text-sm text-text-muted">
                            Share updates or discuss this community issue.
                        </p>
                    </div>

                    <span class="ml-auto rounded-full bg-bg-page px-3 py-1 text-xs font-medium text-text-muted">
                        {{ comments.length }}
                        {{ comments.length === 1 ? 'comment' : 'comments' }}
                    </span>
                </div>
            </div>

            <div class="space-y-5 p-5 sm:p-6">
                <!-- Comment form -->
                <form class="space-y-3" @submit.prevent="submitComment">
                    <label for="issue-comment" class="block text-sm font-medium text-text-heading">
                        Add to the discussion
                    </label>

                    <textarea id="issue-comment" v-model="commentBody" rows="3" maxlength="5000" required
                        placeholder="Write a comment or share an update..."
                        class="w-full resize-y rounded-xl border border-border-subtle bg-bg-page px-4 py-3 text-sm text-text-body outline-none transition placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"></textarea>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p class="text-xs text-text-muted">
                            Be respectful and keep your comments relevant.
                        </p>

                        <button type="submit" :disabled="!commentBody.trim() || submittingComment"
                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:cursor-not-allowed disabled:opacity-50">
                            <svg v-if="!submittingComment" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="m22 2-7 20-4-9-9-4Z" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M22 2 11 13" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                            </svg>

                            {{ submittingComment ? 'Sending...' : 'Add comment' }}
                        </button>
                    </div>
                </form>

                <div class="border-t border-border-subtle"></div>

                <!-- Loading comments -->
                <div v-if="loading" class="flex items-center justify-center gap-3 py-8 text-sm text-text-muted">
                    <svg class="h-5 w-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>

                    Loading discussion...
                </div>

                <!-- Empty comments -->
                <div v-else-if="comments.length === 0"
                    class="rounded-xl border border-dashed border-border-subtle px-4 py-10 text-center">
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                            <path d="M8 10h8M8 14h5m-8 7 1.5-4.5A8 8 0 1 1 12 20a8 8 0 0 1-3.5-.8L5 21Z"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <p class="mt-3 font-medium text-text-heading">
                        No comments yet
                    </p>

                    <p class="mt-1 text-sm text-text-muted">
                        Start the conversation by sharing an update.
                    </p>
                </div>

                <!-- Comments list -->
                <ul v-else class="space-y-4">
                    <li v-for="comment in comments" :key="comment.id"
                        class="rounded-xl border border-border-subtle bg-bg-page/50 p-4 transition-colors hover:border-brand/30 sm:p-5">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                                {{
                                    (comment.user?.fullName ?? 'User')
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()
                                }}
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <span class="font-semibold text-text-heading">
                                        {{ comment.user?.fullName ?? 'User' }}
                                    </span>

                                    <time class="text-xs text-text-muted" :datetime="comment.created_at">
                                        {{ new Date(comment.created_at).toLocaleString() }}
                                    </time>
                                </div>

                                <p class="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-text-body">
                                    {{ comment.body }}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Supporting photos -->
        <div class="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            <div class="border-b border-border-subtle p-5 sm:p-6">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div>
                        <h2 class="text-lg font-semibold text-text-heading">
                            Supporting photos
                        </h2>

                        <p class="mt-0.5 text-sm text-text-muted">
                            Attach images that help explain the issue.
                        </p>
                    </div>

                    <span class="ml-auto rounded-full bg-bg-page px-3 py-1 text-xs font-medium text-text-muted">
                        {{ attachments.length }}
                    </span>
                </div>
            </div>

            <div class="space-y-5 p-5 sm:p-6">
                <!-- Image upload form -->
                <form class="space-y-4 rounded-xl border border-border-subtle bg-bg-page/50 p-4 sm:p-5"
                    @submit.prevent="uploadImage">
                    <div>
                        <label for="issue-image" class="block text-sm font-semibold text-text-heading">
                            Upload photos
                        </label>

                        <p class="mt-1 text-sm text-text-muted">
                            JPG, PNG, or WebP. Maximum 5 MB per image.
                        </p>
                    </div>

                    <input id="issue-image" type="file" accept="image/jpeg,image/png,image/webp" multiple
                        class="block w-full cursor-pointer rounded-xl border border-border-subtle bg-bg-surface text-sm text-text-body file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-border-subtle file:bg-brand/10 file:px-4 file:py-3 file:font-semibold file:text-brand hover:file:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                        @change="handleImageSelection" />

                    <!-- Selected files -->
                    <div v-if="selectedImages.length"
                        class="space-y-3 rounded-lg border border-brand/20 bg-brand/5 p-3">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-semibold text-text-heading">
                                Selected files
                            </p>

                            <span class="text-xs font-medium text-brand">
                                {{ selectedImages.length }}
                                {{ selectedImages.length === 1 ? 'image' : 'images' }}
                            </span>
                        </div>

                        <ul class="space-y-2">
                            <li v-for="(file, index) in selectedImages" :key="`${file.name}-${file.size}-${index}`"
                                class="flex items-center justify-between gap-3 text-sm">
                                <span class="min-w-0 truncate text-text-body">
                                    {{ file.name }}
                                </span>

                                <span class="shrink-0 text-xs text-text-muted">
                                    {{ (file.size / 1024).toFixed(1) }} KB
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p class="text-xs text-text-muted">
                            Only upload photos relevant to this issue.
                        </p>

                        <button type="submit" :disabled="!selectedImages.length || uploadingImage"
                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:cursor-not-allowed disabled:opacity-50">
                            <svg v-if="!uploadingImage" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M12 16V4m-5 5 5-5 5 5M4 20h16" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>

                            <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                            </svg>

                            {{
                                uploadingImage
                                    ? 'Uploading...'
                                    : `Upload ${selectedImages.length || ''} photo${selectedImages.length === 1 ? '' : 's'}`
                            }}
                        </button>
                    </div>
                </form>

                <div class="border-t border-border-subtle"></div>

                <!-- Loading photos -->
                <div v-if="loading && attachments.length === 0"
                    class="flex items-center justify-center gap-3 py-8 text-sm text-text-muted">
                    <svg class="h-5 w-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>

                    Loading photos...
                </div>

                <!-- Empty photos -->
                <div v-else-if="attachments.length === 0"
                    class="rounded-xl border border-dashed border-border-subtle px-4 py-10 text-center">
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <p class="mt-3 font-medium text-text-heading">
                        No supporting photos
                    </p>

                    <p class="mt-1 text-sm text-text-muted">
                        Uploaded photos will appear here.
                    </p>
                </div>

                <!-- Attachment gallery -->
                <ul v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <li v-for="attachment in attachments" :key="attachment.id"
                        class="group overflow-hidden rounded-xl border border-border-subtle bg-bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                        <!-- Image preview -->
                        <button v-if="imageUrls[attachment.id]" type="button"
                            class="relative block w-full overflow-hidden bg-bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                            :aria-label="`View ${attachment.original_name}`" @click="downloadAttachment(attachment.id)">
                            <img :src="imageUrls[attachment.id]" :alt="attachment.original_name"
                                class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-90"
                                loading="lazy" />

                            <span
                                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Download image
                            </span>
                        </button>

                        <!-- Image unavailable -->
                        <div v-else
                            class="flex aspect-square flex-col items-center justify-center gap-2 bg-bg-page p-3 text-center">
                            <svg v-if="!failedImages.includes(attachment.id)" class="h-7 w-7 animate-spin text-brand"
                                viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                            </svg>

                            <svg v-else class="h-8 w-8 text-text-muted" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <path d="m8 14 2-2 3 3 2-2 3 3" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M4 4l16 16" stroke-linecap="round" />
                            </svg>

                            <span class="text-xs text-text-muted">
                                {{
                                    failedImages.includes(attachment.id)
                                        ? 'Unable to load image'
                                        : 'Loading image...'
                                }}
                            </span>
                        </div>

                        <!-- Attachment details -->
                        <div class="space-y-2 p-3">
                            <p class="truncate text-sm font-semibold text-text-heading"
                                :title="attachment.original_name">
                                {{ attachment.original_name }}
                            </p>

                            <p class="text-xs text-text-muted">
                                {{ (attachment.file_size / 1024).toFixed(1) }} KB
                            </p>

                            <p v-if="attachment.uploader" class="truncate text-xs text-text-muted">
                                Uploaded by {{ attachment.uploader.fullName }}
                            </p>

                            <button type="button"
                                class="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-brand transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                @click="downloadAttachment(attachment.id)">
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                    <path d="m7 10 5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                                Download original
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>