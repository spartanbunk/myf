<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg">🎣</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">Mark Your Fish</h1>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
            :class="{ 'text-primary-600 font-semibold': $route.name === 'Home' }"
          >
            Home
          </router-link>
          
          <template v-if="isAuthenticated">
            <router-link 
              to="/dashboard" 
              class="text-gray-700 hover:text-primary-600 transition-colors"
              :class="{ 'text-primary-600 font-semibold': $route.name === 'Dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/map" 
              class="text-gray-700 hover:text-primary-600 transition-colors"
              :class="{ 'text-primary-600 font-semibold': $route.name === 'Map' }"
            >
              Map
            </router-link>
            <router-link 
              to="/catches" 
              class="text-gray-700 hover:text-primary-600 transition-colors"
              :class="{ 'text-primary-600 font-semibold': $route.name === 'Catches' }"
            >
              My Catches
            </router-link>
          </template>
          
          <router-link 
            to="/about" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
            :class="{ 'text-primary-600 font-semibold': $route.name === 'About' }"
          >
            About
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <div class="relative" ref="userMenuRef">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 text-sm">{{ userInitials }}</span>
                </div>
                <span class="hidden md:block">{{ user?.username || user?.email }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- User Dropdown -->
              <div 
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <router-link 
                  to="/profile" 
                  @click="showUserMenu = false"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </router-link>
                <hr class="border-gray-100">
                <button 
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link 
              to="/login" 
              class="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Login
            </router-link>
            <router-link 
              to="/login?mode=register" 
              class="btn-primary"
            >
              Sign Up
            </router-link>
          </template>

          <!-- Mobile Menu Button -->
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 text-gray-700 hover:text-primary-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden py-4 border-t border-gray-200">
        <nav class="flex flex-col space-y-3">
          <router-link 
            to="/" 
            @click="showMobileMenu = false"
            class="text-gray-700 hover:text-primary-600 transition-colors py-2"
          >
            Home
          </router-link>
          
          <template v-if="isAuthenticated">
            <router-link 
              to="/dashboard" 
              @click="showMobileMenu = false"
              class="text-gray-700 hover:text-primary-600 transition-colors py-2"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/map" 
              @click="showMobileMenu = false"
              class="text-gray-700 hover:text-primary-600 transition-colors py-2"
            >
              Map
            </router-link>
            <router-link 
              to="/catches" 
              @click="showMobileMenu = false"
              class="text-gray-700 hover:text-primary-600 transition-colors py-2"
            >
              My Catches
            </router-link>
            <router-link 
              to="/profile" 
              @click="showMobileMenu = false"
              class="text-gray-700 hover:text-primary-600 transition-colors py-2"
            >
              Profile
            </router-link>
          </template>
          
          <router-link 
            to="/about" 
            @click="showMobileMenu = false"
            class="text-gray-700 hover:text-primary-600 transition-colors py-2"
          >
            About
          </router-link>

          <template v-if="!isAuthenticated">
            <hr class="border-gray-200">
            <router-link 
              to="/login" 
              @click="showMobileMenu = false"
              class="text-gray-700 hover:text-primary-600 transition-colors py-2"
            >
              Login
            </router-link>
            <router-link 
              to="/login?mode=register" 
              @click="showMobileMenu = false"
              class="btn-primary inline-block text-center"
            >
              Sign Up
            </router-link>
          </template>
          
          <template v-else>
            <hr class="border-gray-200">
            <button 
              @click="handleLogout"
              class="text-left text-red-600 hover:text-red-700 transition-colors py-2"
            >
              Logout
            </button>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const showUserMenu = ref(false)
    const showMobileMenu = ref(false)
    const userMenuRef = ref(null)

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)

    const userInitials = computed(() => {
      if (!user.value) return '?'
      const name = user.value.username || user.value.email
      return name.substring(0, 2).toUpperCase()
    })

    const handleLogout = async () => {
      showUserMenu.value = false
      showMobileMenu.value = false
      await authStore.logout()
      router.push('/')
    }

    // Close user menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        showUserMenu.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      showUserMenu,
      showMobileMenu,
      userMenuRef,
      isAuthenticated,
      user,
      userInitials,
      handleLogout
    }
  }
}
</script>