<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Header />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import { onMounted } from 'vue'
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
    
    onMounted(async () => {
      console.log('Markyourfish app initialized')
      // Initialize authentication state from localStorage
      await authStore.initializeAuth()
    })
  }
}
</script>