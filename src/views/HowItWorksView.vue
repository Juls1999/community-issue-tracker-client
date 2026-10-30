<script setup lang="ts">
import { RouterLink } from 'vue-router'

const steps = [
    {
        number: '01',
        title: 'Report a community issue',
        description:
            'Notice a problem in your community? Submit a report with a clear title, description, category, and priority so the concern can be understood.',
        icon: 'report',
        tag: 'Submit a report',
    },
    {
        number: '02',
        title: 'The concern is reviewed',
        description:
            'The responsible administrators can review submitted reports, assess their details, and manage the concerns that need attention.',
        icon: 'review',
        tag: 'Administrative review',
    },
    {
        number: '03',
        title: 'Track progress and updates',
        description:
            'Visit your reports to check their current status. Use the discussion section to follow updates and exchange relevant information.',
        icon: 'track',
        tag: 'Stay informed',
    },
    {
        number: '04',
        title: 'Follow the resolution',
        description:
            'Keep checking your report for progress and resolution updates, helping you stay informed about the concern you raised.',
        icon: 'resolve',
        tag: 'Community impact',
    },
]

const benefits = [
    {
        title: 'Easy reporting',
        description:
            'Provide important details about community concerns in one organized place.',
        icon: 'clipboard',
    },
    {
        title: 'Transparent progress',
        description:
            'Follow report statuses and see updates without losing track of your concern.',
        icon: 'eye',
    },
    {
        title: 'Organized communication',
        description:
            'Keep issue-related discussions and attachments connected to the report.',
        icon: 'chat',
    },
]
</script>

<template>
    <main class="overflow-hidden bg-bg-page text-text-body">
        <!-- Hero -->
        <section class="relative px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
            <div class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
                aria-hidden="true" />

            <div class="relative mx-auto max-w-5xl text-center">
                <span
                    class="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-medium text-brand">
                    <span class="h-2 w-2 rounded-full bg-brand" />
                    A better way to raise community concerns
                </span>

                <h1
                    class="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-text-heading sm:text-5xl lg:text-6xl">
                    From reporting a problem to
                    <span class="text-brand"> making a difference.</span>
                </h1>

                <p class="mx-auto mt-6 max-w-2xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
                    Our Community Issue Tracker helps residents report local concerns,
                    follow their progress, and stay informed as the community works
                    toward solutions.
                </p>

                <div class="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                    <RouterLink :to="{ name: 'login' }"
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-brand-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
                        Get Started
                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"
                            aria-hidden="true">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </RouterLink>

                    <a href="#steps"
                        class="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-bg-surface px-6 py-3.5 font-semibold text-text-heading transition hover:border-brand hover:text-brand">
                        See How It Works
                    </a>
                </div>

                <!-- Process preview -->
                <div class="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div v-for="(step, index) in steps" :key="step.number"
                        class="relative rounded-2xl border border-border-subtle bg-bg-surface p-4 text-left sm:p-5">
                        <span class="text-sm font-bold text-brand">
                            {{ step.number }}
                        </span>

                        <p class="mt-2 text-sm font-semibold text-text-heading">
                            {{ step.title }}
                        </p>

                        <div v-if="index < steps.length - 1"
                            class="absolute -right-2.5 top-7 z-10 hidden h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-bg-page text-text-muted sm:flex"
                            aria-hidden="true">
                            <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Steps -->
        <section id="steps" class="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div class="mx-auto max-w-6xl">
                <div class="mx-auto max-w-2xl text-center">
                    <p class="text-sm font-semibold uppercase tracking-widest text-brand">
                        The process
                    </p>

                    <h2 class="mt-3 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
                        How it works
                    </h2>

                    <p class="mt-4 leading-7 text-text-muted">
                        Getting a community concern noticed is simple. Follow these
                        four steps to submit a report and stay updated.
                    </p>
                </div>

                <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
                    <article v-for="step in steps" :key="step.number"
                        class="group relative rounded-2xl border border-border-subtle bg-bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/50 sm:p-8">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <svg v-if="step.icon === 'report'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                                    stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                                    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
                                </svg>

                                <svg v-else-if="step.icon === 'review'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                                    stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4m-8-5 2 2 4-4" />
                                </svg>

                                <svg v-else-if="step.icon === 'track'" viewBox="0 0 24 24" class="h-6 w-6" fill="none"
                                    stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                                </svg>

                                <svg v-else viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor"
                                    stroke-width="1.8" aria-hidden="true">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <path d="m9 11 3 3L22 4" />
                                </svg>
                            </div>

                            <span class="text-3xl font-bold text-brand/40">
                                {{ step.number }}
                            </span>
                        </div>

                        <h3 class="mt-6 text-xl font-bold text-text-heading">
                            {{ step.title }}
                        </h3>

                        <p class="mt-3 leading-7 text-text-muted">
                            {{ step.description }}
                        </p>

                        <div class="mt-6 border-t border-border-subtle pt-4">
                            <span class="inline-flex items-center gap-2 text-sm font-medium text-brand">
                                <span class="h-1.5 w-1.5 rounded-full bg-brand" />
                                {{ step.tag }}
                            </span>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- Benefits -->
        <section class="border-y border-border-subtle bg-bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div class="mx-auto max-w-6xl">
                <div class="max-w-2xl">
                    <p class="text-sm font-semibold uppercase tracking-widest text-brand">
                        Why use the platform?
                    </p>

                    <h2 class="mt-3 text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
                        Community concerns, better organized.
                    </h2>

                    <p class="mt-4 leading-7 text-text-muted">
                        Keep reports, progress updates, and conversations in one
                        place to make following community concerns easier.
                    </p>
                </div>

                <div class="mt-10 grid gap-6 md:grid-cols-3">
                    <article v-for="benefit in benefits" :key="benefit.title"
                        class="rounded-2xl border border-border-subtle bg-bg-page p-6">
                        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <svg v-if="benefit.icon === 'clipboard'" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                                stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <rect x="5" y="4" width="14" height="18" rx="2" />
                                <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
                            </svg>

                            <svg v-else-if="benefit.icon === 'eye'" viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                                stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                            <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor"
                                stroke-width="1.8" aria-hidden="true">
                                <path
                                    d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                            </svg>
                        </div>

                        <h3 class="mt-5 text-lg font-bold text-text-heading">
                            {{ benefit.title }}
                        </h3>

                        <p class="mt-2 leading-7 text-text-muted">
                            {{ benefit.description }}
                        </p>
                    </article>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div
                class="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand px-6 py-10 text-brand-foreground sm:px-12 sm:py-14">
                <div class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-current opacity-10"
                    aria-hidden="true" />
                <div class="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border border-current opacity-10"
                    aria-hidden="true" />

                <div class="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div class="max-w-xl">
                        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
                            Ready to make your concern heard?
                        </h2>

                        <p class="mt-3 leading-7 opacity-90">
                            Sign in to submit a report and follow your community
                            concerns through the platform.
                        </p>
                    </div>

                    <RouterLink :to="{ name: 'login' }"
                        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-bg-surface px-6 py-3.5 font-semibold text-text-heading transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-bg-surface focus:ring-offset-2 focus:ring-offset-transparent">
                        Get Started
                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"
                            aria-hidden="true">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </RouterLink>
                </div>
            </div>
        </section>
    </main>
</template>
