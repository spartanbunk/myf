<template>
  <div class="page-container">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Information -->
        <div class="lg:col-span-2">
          <div class="card">
            <h2 class="text-xl font-semibold mb-6">Profile Information</h2>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  v-model="profile.username"
                  type="text"
                  class="input-field"
                  placeholder="Enter your username"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="profile.email"
                  type="email"
                  class="input-field"
                  disabled
                >
                <p class="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div class="flex gap-4">
                <button type="submit" class="btn-primary">
                  Update Profile
                </button>
                <button type="button" class="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Profile Stats -->
        <div class="space-y-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Your Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Catches</span>
                <span class="font-semibold">{{ stats.total_catches || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Species Caught</span>
                <span class="font-semibold">{{ stats.unique_species || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">This Month</span>
                <span class="font-semibold">{{ stats.monthly_catches || 0 }}</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Subscription</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan</span>
                <span class="font-semibold capitalize">{{ user?.subscription_status || 'Free' }}</span>
              </div>
              <button class="btn-primary w-full">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    
    const profile = ref({
      username: '',
      email: ''
    })
    
    const stats = ref({
      total_catches: 0,
      unique_species: 0,
      monthly_catches: 0
    })
    
    const user = computed(() => authStore.user)
    
    const updateProfile = () => {
      console.log('Update profile:', profile.value)
      // TODO: Implement profile update
    }
    
    onMounted(() => {
      if (user.value) {
        profile.value = {
          username: user.value.username || '',
          email: user.value.email || ''
        }
      }
    })
    
    return {
      profile,
      stats,
      user,
      updateProfile
    }
  }
}
</script>