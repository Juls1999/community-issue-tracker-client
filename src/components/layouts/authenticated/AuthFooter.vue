
<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto border-t border-border-subtle bg-bg-surface">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
      <p class="text-xs text-text-muted">
        &copy; {{ currentYear }} Community Portal
      </p>

      <p class="text-center text-xs text-text-muted">
        Making our community better, together.
      </p>
    </div>
  </footer>
</template>
