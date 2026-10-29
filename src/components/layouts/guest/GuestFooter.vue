
<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border-subtle bg-bg-surface">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-5 sm:flex-row">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-hero text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
              <path d="M12 3 20 7v5c0 4.5-3.1 7.5-8 9-4.9-1.5-8-4.5-8-9V7l8-4Z"
                stroke-linejoin="round" />
              <path d="m8.5 12 2.2 2.2 4.8-5"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="font-bold text-text-heading">Community Portal</span>
        </RouterLink>

        <p class="text-center text-xs leading-5 text-text-muted">
          Building stronger communities, one report at a time.
        </p>

        <p class="text-xs text-text-muted">
          &copy; {{ currentYear }} Community Portal
        </p>
      </div>
    </div>
  </footer>
</template>
