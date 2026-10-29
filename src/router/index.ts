import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import GuestLayout from '@/layouts/GuestLayout.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Guest pages
    {
      path: '/',
      component: GuestLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          meta: { guest: true },
          component: () => import('@/views/AboutView.vue'),
        },
        {
          path: 'login',
          name: 'login',
          meta: { guest: true },
          component: () => import('@/views/auth/LoginView.vue'),
        },
      ],
    },

    // Authenticated pages
    {
      path: '/',
      component: AuthenticatedLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'resident/dashboard',
          name: 'resident-dashboard',
          component: () => import('@/views/ResidentDashboardView.vue'),
          meta: { role: 'resident' },
        },
        {
          path: 'issues/create',
          name: 'issue-create',
          component: () => import('@/views/CreateIssueView.vue'),
          meta: { role: 'resident' },
        },
        {
          path: 'issues/:uuid',
          name: 'issueDiscussion',
          component: () => import('@/views/issues/IssueDetailsView.vue'),
        },
        {
          path: 'resident/reports',
          name: 'resident-reports',
          component: () => import('@/views/issues/MyReportsView.vue'),
          meta: { role: 'resident' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Protected routes require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // Guest-only routes are unavailable to authenticated users
  if (to.meta.guest && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // Check the user's role when the route requires one
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    return { name: 'home' }
  }

  return true
})

export default router
