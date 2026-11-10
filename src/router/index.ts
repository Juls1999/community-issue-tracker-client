import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import GuestLayout from '@/layouts/GuestLayout.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import type { Role } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Guest pages
    {
      path: '/',
      component: GuestLayout,
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
        {
          path: '/how-it-works',
          name: 'how-it-works',
          component: () => import('@/views/HowItWorksView.vue'),
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
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { role: 'resident' },
        },
        {
          path: 'resident/notifications',
          name: 'resident-notifications',
          component: () => import('@/views/resident/NotificationsView.vue'),
          meta: {
            requiresAuth: true,
            role: 'resident',
          },
        },
      ],
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    // Restore previous scroll position
    if (savedPosition) {
      return savedPosition
    }

    // Preserve scroll when navigating with hash
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Preserve viewport when navigating query parameters
    if (to.path === from.path) {
      return false
    }

    // Scroll to top for new page navigation
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})

function getDashboardRoute(role: string | null | undefined) {
  switch (role) {
    case 'resident':
      return { name: 'resident-dashboard' }

    case 'staff':
      return { name: 'staff-dashboard' }

    default:
      return { name: 'home' }
  }
}

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const role = authStore.user?.role?.name

  // Redirect authenticated users away from guest-only pages
  if (to.meta.guest && isAuthenticated) {
    const dashboard = getDashboardRoute(role)

    // Avoid redirecting to the same route
    if (to.name !== dashboard.name) {
      return dashboard
    }
  }

  // Require authentication for protected pages
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.name === 'login') {
      return true
    }

    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // Check role-based access
  if (to.meta.role && role !== to.meta.role) {
    const dashboard = getDashboardRoute(role)

    // Avoid redirect loops
    if (to.name !== dashboard.name) {
      return dashboard
    }

    return { name: 'home' }
  }

  return true
})

export default router
