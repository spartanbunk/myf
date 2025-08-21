<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Show loading overlay while auth is initializing -->
    <div v-if="authStore.loading && !authInitialized" class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Initializing...</p>
      </div>
    </div>
    
    <Header />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useAuthStore } from './store/auth'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  setup() {
    const authStore = useAuthStore()
    const authInitialized = ref(false)
    
    onMounted(async () => {
      console.log('Markyourfish app initialized')
      // Initialize authentication state from localStorage
      await authStore.initializeAuth()
      authInitialized.value = true
    })

    return {
      authStore,
      authInitialized
    }
  }
}
</script>