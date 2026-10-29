
<script setup lang="ts">
import GuestHeader from '@/components/layouts/guest/GuestHeader.vue'
import GuestFooter from '@/components/layouts/guest/GuestFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg-page">
    <GuestHeader />

    <main class="flex flex-1 flex-col">
      <RouterView />
    </main>

    <GuestFooter />
  </div>
</template>
