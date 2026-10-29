<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IssueDiscussion from '@/components/issues/IssueDiscussion.vue'

const route = useRoute()

const issueUuid = computed(() => String(route.params.uuid ?? ''))
</script>

<template>
  <main class="mx-auto max-w-4xl space-y-6 p-6">
    <!-- Your existing issue details go here -->

    <IssueDiscussion v-if="issueUuid" :issue-uuid="issueUuid" />
  </main>
</template>