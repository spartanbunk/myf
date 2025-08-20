import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Views
import Home from '@/views/Home.vue'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: false }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: { requiresAuth: false }
  },
  {
    path: '/catches',
    name: 'Catches',
    component: () => import('@/views/Catches.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Redirect to login page
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    // Public route
    next()
  }
})

export default router