<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const features = [
  {
    number: '01',
    title: 'Report community issues',
    description:
      'Submit concerns about infrastructure, sanitation, safety, and other local community problems.',
    icon: 'report',
  },
  {
    number: '02',
    title: 'Track every update',
    description:
      'Check the status of your reports and stay informed as your community concerns progress.',
    icon: 'track',
  },
  {
    number: '03',
    title: 'Build better communities',
    description:
      'Help local officials identify concerns and make more informed decisions for residents.',
    icon: 'community',
  },
]

const steps = [
  {
    number: '1',
    title: 'Create a report',
    description:
      'Describe the issue and provide the details needed to understand the concern.',
  },
  {
    number: '2',
    title: 'Let the team review it',
    description:
      'Your report can be reviewed and assigned to the appropriate staff.',
  },
  {
    number: '3',
    title: 'Follow its progress',
    description:
      'Return to your dashboard to check for status changes and updates.',
  },
]

let revealObserver: IntersectionObserver | undefined

onMounted(() => {
  const elements = document.querySelectorAll('.reveal-on-scroll')

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    },
  )

  elements.forEach((element) => revealObserver?.observe(element))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <main class="overflow-hidden bg-bg-page text-text-body">
    <!-- HERO SECTION -->
    <section class="relative isolate">
      <div
        class="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl animate-glow"
        aria-hidden="true" />

      <div
        class="pointer-events-none absolute -right-20 top-24 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-glow-delayed"
        aria-hidden="true" />

      <div
        class="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <!-- Hero copy -->
        <div class="hero-copy">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>

            A better way to improve your community
          </div>

          <h1
            class="mt-7 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-text-heading sm:text-5xl lg:text-6xl">
            Your community.
            <span class="text-brand">Your voice.</span>
            <span class="block">Real progress.</span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-8 text-text-muted sm:text-lg">
            Help make your neighborhood better. Report local concerns,
            track their progress, and stay connected with the people
            working to address them.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink :to="{ name: 'login' }"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-brand-foreground shadow-lg shadow-brand/15 transition duration-300 hover:-translate-y-1 hover:opacity-90">
              Report an issue

              <svg class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 12h14m-7-7 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </RouterLink>

            <RouterLink :to="{ name: 'how-it-works' }"
              class="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-bg-surface px-6 py-3.5 font-semibold text-text-heading transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:bg-brand/5">
              Learn how it works
            </RouterLink>
          </div>

          <div class="mt-9 flex items-center gap-3">
            <div class="flex -space-x-2" aria-hidden="true">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-page bg-brand/20 text-brand">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" stroke-linecap="round" />
                </svg>
              </div>

              <div
                class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-page bg-fuchsia-500/15 text-fuchsia-400">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <div
                class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-page bg-blue-500/15 text-blue-400">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 10h18M5 10V6l7-3 7 3v4M5 21h14M7 10v8m5-8v8m5-8v8" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
            </div>

            <p class="text-sm text-text-muted">
              <span class="font-semibold text-text-heading">
                Every report matters.
              </span>
              <span class="block">Every voice counts.</span>
            </p>
          </div>
        </div>

        <!-- Animated dashboard preview -->
        <div class="hero-preview relative mx-auto w-full max-w-xl">
          <div
            class="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-transparent to-fuchsia-500/15 blur-2xl animate-glow"
            aria-hidden="true" />

          <div class="dashboard-float">
            <div
              class="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-2xl shadow-black/10">
              <div class="flex items-center justify-between border-b border-border-subtle px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M4 20V5m0 0c6-4 10 4 16 0v11c-6 4-10-4-16 0" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>

                  <div>
                    <p class="font-semibold text-text-heading">
                      Community reports
                    </p>
                    <p class="text-xs text-text-muted">
                      Dashboard preview
                    </p>
                  </div>
                </div>

                <span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  Issue tracking
                </span>
              </div>

              <div class="space-y-5 p-5 sm:p-6">
                <!-- Statistics -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="rounded-xl border border-border-subtle bg-bg-page p-3 sm:p-4">
                    <div
                      class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" stroke-linecap="round" />
                      </svg>
                    </div>

                    <p class="text-xl font-bold text-text-heading sm:text-2xl">
                      01
                    </p>
                    <p class="mt-1 text-xs text-text-muted">Pending</p>
                  </div>

                  <div class="rounded-xl border border-border-subtle bg-bg-page p-3 sm:p-4">
                    <div class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12h16m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>

                    <p class="text-xl font-bold text-text-heading sm:text-2xl">
                      02
                    </p>
                    <p class="mt-1 text-xs text-text-muted">
                      In progress
                    </p>
                  </div>

                  <div class="rounded-xl border border-border-subtle bg-bg-page p-3 sm:p-4">
                    <div
                      class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m5 12 4 4L19 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>

                    <p class="text-xl font-bold text-text-heading sm:text-2xl">
                      05
                    </p>
                    <p class="mt-1 text-xs text-text-muted">Resolved</p>
                  </div>
                </div>

                <!-- Example reports -->
                <div>
                  <div class="mb-4 flex items-center justify-between">
                    <h2 class="font-semibold text-text-heading">
                      Recent activity
                    </h2>
                    <span class="text-xs text-text-muted">
                      Example reports
                    </span>
                  </div>

                  <div class="space-y-3">
                    <div
                      class="flex items-start gap-3 rounded-xl border border-border-subtle p-3.5 transition duration-300 hover:border-amber-500/40">
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M3 17 8 12l4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M15 7h5v5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>

                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-text-heading">
                          Damaged road pavement
                        </p>
                        <p class="mt-1 text-xs text-text-muted">
                          Infrastructure
                        </p>
                      </div>

                      <span
                        class="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                        Pending
                      </span>
                    </div>

                    <div
                      class="flex items-start gap-3 rounded-xl border border-border-subtle p-3.5 transition duration-300 hover:border-blue-500/40">
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M3 10h18l-2 10H5L3 10Z" stroke-linejoin="round" />
                          <path d="m7 10 2-6h6l2 6M8 14h8" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>

                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-text-heading">
                          Community waste collection
                        </p>
                        <p class="mt-1 text-xs text-text-muted">
                          Sanitation
                        </p>
                      </div>

                      <span class="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                        In progress
                      </span>
                    </div>

                    <div
                      class="flex items-start gap-3 rounded-xl border border-border-subtle p-3.5 transition duration-300 hover:border-emerald-500/40">
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                          <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>

                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-text-heading">
                          Broken streetlight
                        </p>
                        <p class="mt-1 text-xs text-text-muted">
                          Public safety
                        </p>
                      </div>

                      <span
                        class="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Resolved
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Dashboard message -->
                <div class="flex items-center gap-3 rounded-xl bg-brand/5 p-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="5" />
                      <path
                        d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42"
                        stroke-linecap="round" />
                    </svg>
                  </div>

                  <div>
                    <p class="text-sm font-semibold text-text-heading">
                      Your voice makes a difference
                    </p>
                    <p class="mt-1 text-xs leading-5 text-text-muted">
                      Every report is a step toward a better community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating notification -->
          <div
            class="floating-notification absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-xl sm:flex lg:-left-8">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m5 12 4 4L19 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <div>
              <p class="text-sm font-semibold text-text-heading">
                Progress you can follow
              </p>
              <p class="text-xs text-text-muted">
                Stay informed about your reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="border-y border-border-subtle bg-bg-surface/50">
      <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div class="reveal-on-scroll mx-auto max-w-2xl text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            A simpler way to speak up
          </p>

          <h2 class="mt-4 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
            Turn community concerns into action
          </h2>

          <p class="mt-4 leading-7 text-text-muted">
            A centralized place for residents to raise concerns and follow
            their progress without losing track of what matters.
          </p>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <article v-for="(feature, index) in features" :key="feature.number"
            class="reveal-on-scroll feature-card group rounded-2xl border border-border-subtle bg-bg-surface p-6 sm:p-7"
            :style="{ '--reveal-delay': `${index * 120}ms` }">
            <div class="flex items-center justify-between">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition duration-300 group-hover:rotate-3 group-hover:bg-brand group-hover:text-brand-foreground">
                <svg v-if="feature.icon === 'report'" class="h-6 w-6" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>

                <svg v-else-if="feature.icon === 'track'" class="h-6 w-6" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M10 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <span class="text-sm font-semibold text-text-muted">
                {{ feature.number }}
              </span>
            </div>

            <h3 class="mt-6 text-xl font-bold text-text-heading">
              {{ feature.title }}
            </h3>

            <p class="mt-3 leading-7 text-text-muted">
              {{ feature.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div class="reveal-on-scroll">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            How it works
          </p>

          <h2 class="mt-4 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
            Getting started is simple.
          </h2>

          <p class="mt-4 max-w-lg leading-7 text-text-muted">
            You don't need a complicated process to make your concerns
            heard. Follow a few simple steps to submit a report and
            monitor its progress.
          </p>

          <RouterLink :to="{ name: 'login' }"
            class="group mt-7 inline-flex items-center gap-2 font-semibold text-brand">
            Get started today

            <svg class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>

        <div class="space-y-7">
          <div v-for="(step, index) in steps" :key="step.number" class="reveal-on-scroll flex gap-4 sm:gap-5"
            :style="{ '--reveal-delay': `${index * 120}ms` }">
            <div class="flex shrink-0 flex-col items-center">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-lg font-bold text-brand transition duration-300 hover:scale-110">
                {{ step.number }}
              </div>

              <div v-if="step.number !== '3'" class="mt-3 h-full min-h-8 w-px bg-border-subtle" />
            </div>

            <div class="pb-3">
              <h3 class="text-lg font-semibold text-text-heading">
                {{ step.title }}
              </h3>

              <p class="mt-2 leading-7 text-text-muted">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CALL TO ACTION -->
    <section class="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
      <div class="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand px-6 py-12 sm:px-12 sm:py-16">
        <div class="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-white/10"
          aria-hidden="true" />

        <div class="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl"
          aria-hidden="true" />

        <div class="reveal-on-scroll relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-foreground/75">
              Make a difference
            </p>

            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-foreground sm:text-4xl">
              A better community starts with you.
            </h2>

            <p class="mt-4 max-w-xl leading-7 text-brand-foreground/80">
              Have a concern that needs attention? Take the first step
              and help make your neighborhood a better place for everyone.
            </p>
          </div>

          <RouterLink :to="{ name: 'login' }"
            class="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-bg-surface px-6 py-3.5 font-semibold text-text-heading shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            Start reporting

            <svg class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Hero entrance animations */
.hero-copy {
  animation: hero-enter 800ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero-preview {
  animation: hero-enter 900ms 150ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating dashboard card */
.dashboard-float {
  animation: dashboard-float 5s ease-in-out infinite;
  will-change: transform;
}

@keyframes dashboard-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

/* Background glow */
.animate-glow {
  animation: glow-pulse 7s ease-in-out infinite;
}

.animate-glow-delayed {
  animation: glow-pulse 8s ease-in-out 1s infinite;
}

@keyframes glow-pulse {

  0%,
  100% {
    opacity: 0.55;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

/* Floating notification */
.floating-notification {
  animation: notification-float 4s ease-in-out 1s infinite;
}

@keyframes notification-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

/* Reveal elements as they enter the viewport */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 650ms ease,
    transform 650ms cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Feature cards */
.feature-card {
  transition:
    transform 300ms ease,
    border-color 300ms ease,
    box-shadow 300ms ease;
}

@media (hover: hover) {
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 35px -20px rgb(0 0 0 / 25%);
  }
}



@keyframes cta-shimmer {

  0%,
  100% {
    background-position: 100% 0;
  }

  50% {
    background-position: -100% 0;
  }
}


/* Accessibility: minimize motion when requested */
@media (prefers-reduced-motion: reduce) {

  .hero-copy,
  .hero-preview,
  .dashboard-float,
  .animate-glow,
  .animate-glow-delayed,
  .floating-notification,
  .reveal-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .feature-card {
    transition: none;
  }
}
</style>
