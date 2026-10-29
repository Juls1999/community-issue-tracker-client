<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'
import {
    issueDiscussionService,
    type IssueComment,
    type IssueAttachment,
} from '@/services/issueDiscussionService'

const props = defineProps<{
    issueUuid: string
}>()

const comments = ref<IssueComment[]>([])
const attachments = ref<IssueAttachment[]>([])
const commentBody = ref('')
const selectedImages = ref<File[]>([])

// Maps attachment IDs to browser image URLs.
const imageUrls = ref<Record<number, string>>({})
const failedImages = ref<number[]>([])

const loading = ref(false)
const submittingComment = ref(false)
const uploadingImage = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

let discussionRequestId = 0

function getErrorMessage(error: unknown): string {
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

function clearImageUrls() {
    Object.values(imageUrls.value).forEach((url) => {
        URL.revokeObjectURL(url)
    })

    imageUrls.value = {}
    failedImages.value = []
}

async function loadAttachmentImages(requestId: number) {
    clearImageUrls()

    const results = await Promise.all(
        attachments.value.map(async (attachment) => {
            try {
                const url = issueDiscussionService.getDownloadUrl(
                    props.issueUuid,
                    attachment.id,
                )

                const response = await axios.get(url, {
                    responseType: 'blob',
                })

                // Ignore results from an outdated issue request.
                if (requestId !== discussionRequestId) {
                    return null
                }

                if (!response.data.type.startsWith('image/')) {
                    return { id: attachment.id, url: null }
                }

                return {
                    id: attachment.id,
                    url: URL.createObjectURL(response.data),
                }
            } catch {
                return { id: attachment.id, url: null }
            }
        }),
    )

    if (requestId !== discussionRequestId) {
        results.forEach((result) => {
            if (result?.url) {
                URL.revokeObjectURL(result.url)
            }
        })
        return
    }

    const urls: Record<number, string> = {}
    const failures: number[] = []

    results.forEach((result) => {
        if (result?.url) {
            urls[result.id] = result.url
        } else if (result) {
            failures.push(result.id)
        }
    })

    imageUrls.value = urls
    failedImages.value = failures
}

async function loadDiscussion() {
    const requestId = ++discussionRequestId

    loading.value = true
    errorMessage.value = ''

    try {
        const [commentResponse, attachmentResponse] =
            await Promise.all([
                issueDiscussionService.getComments(props.issueUuid),
                issueDiscussionService.getAttachments(props.issueUuid),
            ])

        // Prevent an older request overwriting newer issue data.
        if (requestId !== discussionRequestId) return

        comments.value = commentResponse.data
        attachments.value = attachmentResponse.data

        await loadAttachmentImages(requestId)
    } catch (error: unknown) {
        if (requestId === discussionRequestId) {
            errorMessage.value = getErrorMessage(error)
        }
    } finally {
        if (requestId === discussionRequestId) {
            loading.value = false
        }
    }
}

async function submitComment() {
    const body = commentBody.value.trim()

    if (!body || submittingComment.value) return

    submittingComment.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await issueDiscussionService.addComment(
            props.issueUuid,
            body,
        )

        comments.value.unshift(response.data)
        commentBody.value = ''
        successMessage.value = 'Comment added successfully.'
    } catch (error: unknown) {
        errorMessage.value = getErrorMessage(error)
    } finally {
        submittingComment.value = false
    }
}


function handleImageSelection(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files ?? [])

    errorMessage.value = ''
    successMessage.value = ''

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
        (file) => !allowedTypes.includes(file.type),
    )

    if (invalidType) {
        errorMessage.value =
            'All files must be JPG, PNG, or WebP images.'

        input.value = ''
        selectedImages.value = []
        return
    }

    const oversizedFile = files.find(
        (file) => file.size > 5 * 1024 * 1024,
    )

    if (oversizedFile) {
        errorMessage.value =
            'Each image must be 5 MB or smaller.'

        input.value = ''
        selectedImages.value = []
        return
    }

    selectedImages.value = files
}



async function uploadImage() {
    if (
        selectedImages.value.length === 0 ||
        uploadingImage.value
    ) {
        return
    }

    uploadingImage.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        await issueDiscussionService.uploadAttachment(
            props.issueUuid,
            selectedImages.value,
        )

        selectedImages.value = []

        const input = document.getElementById(
            'issue-image',
        ) as HTMLInputElement | null

        if (input) input.value = ''

        successMessage.value =
            'Photos uploaded successfully.'

        await loadDiscussion()
    } catch (error: unknown) {
        errorMessage.value = getErrorMessage(error)
    } finally {
        uploadingImage.value = false
    }
}


async function downloadAttachment(attachmentId: number) {
    errorMessage.value = ''

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
            (item) => item.id === attachmentId,
        )

        link.href = objectUrl
        link.download = attachment?.original_name ?? 'attachment'

        document.body.appendChild(link)
        link.click()
        link.remove()

        // Allow the browser to begin downloading before cleanup.
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (error: unknown) {
        errorMessage.value = getErrorMessage(error)
    }
}

onMounted(loadDiscussion)

watch(
    () => props.issueUuid,
    () => loadDiscussion(),
)

onBeforeUnmount(() => {
    // Invalidate any pending requests for this component.
    discussionRequestId++

    clearImageUrls()
})
</script>

<template>
    <section class="space-y-8">
        <!-- Error message -->
        <div v-if="errorMessage" role="alert"
            class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" role="status"
            class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {{ successMessage }}
        </div>

        <!-- Discussion -->
        <div>
            <h2 class="mb-4 text-lg font-semibold">
                Discussion
            </h2>

            <form class="space-y-3" @submit.prevent="submitComment">
                <label for="issue-comment" class="sr-only">
                    Write a comment
                </label>

                <textarea id="issue-comment" v-model="commentBody" rows="3" maxlength="5000" required
                    placeholder="Write a comment..."
                    class="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none" />

                <div class="flex justify-end">
                    <button type="submit" :disabled="!commentBody.trim() || submittingComment"
                        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ submittingComment ? 'Sending...' : 'Add comment' }}
                    </button>
                </div>
            </form>

            <div v-if="loading" class="py-6 text-sm text-slate-400">
                Loading discussion...
            </div>

            <div v-else-if="comments.length === 0" class="py-6 text-sm text-slate-400">
                No comments yet. Start the discussion.
            </div>

            <ul v-else class="mt-5 space-y-4">
                <li v-for="comment in comments" :key="comment.id"
                    class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <div class="mb-2 flex items-center justify-between gap-3">
                        <span class="font-medium text-white">
                            {{ comment.user?.name ?? 'User' }}
                        </span>

                        <time class="text-xs text-slate-400">
                            {{ new Date(comment.created_at).toLocaleString() }}
                        </time>
                    </div>

                    <p class="whitespace-pre-wrap break-words text-sm text-slate-300">
                        {{ comment.body }}
                    </p>
                </li>
            </ul>
        </div>

        <!-- Supporting photos -->
        <div>
            <h2 class="mb-4 text-lg font-semibold">
                Supporting photos
            </h2>


            <form class="mb-5 space-y-3 rounded-lg border border-slate-800 p-4" @submit.prevent="uploadImage">
                <label for="issue-image" class="block text-sm text-slate-300">
                    Choose images (JPG, PNG, or WebP; max 5 MB each)
                </label>

                <input id="issue-image" type="file" accept="image/jpeg,image/png,image/webp" multiple
                    class="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-white"
                    @change="handleImageSelection" />

                <ul v-if="selectedImages.length" class="space-y-1 text-xs text-slate-400">
                    <li v-for="(file, index) in selectedImages" :key="`${file.name}-${file.size}-${index}`">
                        {{ file.name }}
                        ({{ (file.size / 1024).toFixed(1) }} KB)
                    </li>
                </ul>

                <p v-if="selectedImages.length" class="text-sm text-slate-300">
                    {{ selectedImages.length }} image(s) selected
                </p>

                <button type="submit" :disabled="!selectedImages.length || uploadingImage"
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {{
                        uploadingImage
                            ? 'Uploading...'
                            : `Upload ${selectedImages.length || ''} photo${selectedImages.length === 1 ? '' : 's'}`
                    }}
                </button>
            </form>


            <div v-if="loading && attachments.length === 0" class="py-4 text-sm text-slate-400">
                Loading photos...
            </div>

            <p v-else-if="attachments.length === 0" class="text-sm text-slate-400">
                No supporting photos uploaded.
            </p>

            <ul v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <li v-for="attachment in attachments" :key="attachment.id"
                    class="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                    <!-- Display the actual image -->
                    <button v-if="imageUrls[attachment.id]" type="button" class="block w-full cursor-zoom-in"
                        :aria-label="`View ${attachment.original_name}`" @click="downloadAttachment(attachment.id)">
                        <img :src="imageUrls[attachment.id]" :alt="attachment.original_name"
                            class="aspect-square w-full object-cover transition hover:opacity-80" loading="lazy" />
                    </button>

                    <!-- Image unavailable -->
                    <div v-else
                        class="flex aspect-square flex-col items-center justify-center gap-2 p-3 text-center text-sm text-slate-400">
                        <span class="text-2xl">🖼️</span>
                        <span>
                            {{
                                failedImages.includes(attachment.id)
                                    ? 'Unable to load image'
                                    : 'Loading image...'
                            }}
                        </span>
                    </div>

                    <!-- Attachment details -->
                    <div class="space-y-1 p-3">
                        <p class="truncate text-sm font-medium text-white" :title="attachment.original_name">
                            {{ attachment.original_name }}
                        </p>

                        <p class="text-xs text-slate-400">
                            {{ (attachment.file_size / 1024).toFixed(1) }} KB
                        </p>

                        <p v-if="attachment.uploader" class="truncate text-xs text-slate-400">
                            Uploaded by {{ attachment.uploader.name }}
                        </p>

                        <button type="button" class="pt-1 text-xs text-indigo-400 hover:text-indigo-300"
                            @click="downloadAttachment(attachment.id)">
                            Download original
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
