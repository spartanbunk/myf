<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
      </div>
      
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p class="text-xl text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
      
      <div class="space-x-4">
        <router-link to="/" class="btn-primary">
          Go Home
        </router-link>
        <button @click="goBack" class="btn-secondary">
          Go Back
        </button>
      </div>
      
      <div class="mt-12">
        <div class="text-6xl mb-4">🎣</div>
        <p class="text-gray-500">
          Maybe you'll have better luck fishing!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.go(-1)
    }
    
    return {
      goBack
    }
  }
}
</script>