<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
              Welcome back, {{ user?.displayName || 'Angler' }}!
            </h1>
            <p class="text-gray-600 mt-1">Here's your fishing summary</p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link 
              to="/map" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Mark New Catch
            </router-link>
            <router-link 
              to="/catches" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              View All Catches
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ stats.totalCatches }}</h3>
              <p class="text-gray-600">Total Catches</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ stats.thisMonth }}</h3>
              <p class="text-gray-600">This Month</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ stats.favoriteSpecies }}</h3>
              <p class="text-gray-600">Top Species</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">{{ stats.biggestCatch }}lb</h3>
              <p class="text-gray-600">Biggest Catch</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity and Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Catches -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Recent Catches</h2>
                <router-link 
                  to="/catches" 
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="recentCatches.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
                <p class="text-gray-500 mb-4">No catches recorded yet</p>
                <router-link 
                  to="/map" 
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark your first catch
                </router-link>
              </div>
              <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CatchCard
                  v-for="catch_ in recentCatches"
                  :key="catch_.id"
                  :catchData="catch_"
                  variant="list"
                  :showActions="true"
                  @view="openCatchView"
                  @edit="openCatchEdit"
                  @delete="openDeleteConfirmation"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Weather -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div class="space-y-3">
              <router-link 
                to="/map" 
                class="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-300"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Log New Catch
              </router-link>
              <router-link 
                to="/catches" 
                class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-300"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                View Catch Log
              </router-link>
              <router-link 
                to="/profile" 
                class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-300"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Edit Profile
              </router-link>
            </div>
          </div>

          <!-- Current Weather -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Current Conditions</h2>
            <div v-if="weather" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Temperature</span>
                <span class="font-medium">{{ weather.temperature }}°F</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Wind</span>
                <span class="font-medium">{{ weather.windSpeed }} mph {{ weather.windDirection }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Pressure</span>
                <span class="font-medium">{{ weather.pressure }} inHg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Conditions</span>
                <span class="font-medium">{{ weather.conditions }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-gray-500">Enable location to see current weather</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Edit Modal -->
    <LogCatchModal
      :isOpen="showCatchModal"
      :mode="modalMode"
      :catchData="selectedCatchData"
      :coordinates="selectedCatchData?.coordinates"
      @close="closeCatchModal"
      @save="handleCatchUpdate"
      @delete="handleCatchDelete"
      @mode-changed="handleModeChanged"
    />

    <!-- View Modal -->
    <CatchViewModal
      :isOpen="showViewModal"
      :catchData="selectedCatchData"
      :coordinates="selectedCatchData?.coordinates"
      @close="closeViewModal"
      @edit="switchToEdit"
      @delete="openDeleteConfirmation"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :isOpen="showDeleteModal"
      :catchData="selectedCatchData"
      @close="closeDeleteModal"
      @confirm="handleCatchDelete"
    />
    
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { formatDate, getSpeciesColor } from '@/utils/helpers'
import LogCatchModal from '@/components/maps/LogCatchModal.vue'
import CatchCard from '@/components/common/CatchCard.vue'
import CatchViewModal from '@/components/modals/CatchViewModal.vue'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal.vue'

export default {
  name: 'Dashboard',
  components: {
    LogCatchModal,
    CatchCard,
    CatchViewModal,
    DeleteConfirmationModal
  },
  setup() {
    const authStore = useAuthStore()
    const stats = ref({
      totalCatches: 0,
      thisMonth: 0,
      favoriteSpecies: 'N/A',
      biggestCatch: 0
    })
    const recentCatches = ref([])
    const weather = ref(null)

    // Modal state management
    const showCatchModal = ref(false)
    const showViewModal = ref(false)
    const showDeleteModal = ref(false)
    const modalMode = ref('edit')
    const selectedCatchData = ref(null)

    const user = computed(() => authStore.user)

    // Using imported utilities from helpers.js for consistent date formatting and species colors

    const loadDashboardData = async () => {
      try {
        // Load user statistics
        const statsResponse = await fetch('/api/catches/stats/summary', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          stats.value = statsData
        }

        // Load recent catches
        const catchesResponse = await fetch('/api/catches?limit=5', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })
        if (catchesResponse.ok) {
          const catchesData = await catchesResponse.json()
          recentCatches.value = catchesData.catches || []
        }

        // Load current weather if geolocation is available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            try {
              const weatherResponse = await fetch(`/api/weather/current?lat=${latitude}&lon=${longitude}`)
              if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json()
                weather.value = weatherData
              }
            } catch (error) {
              console.error('Error fetching weather:', error)
            }
          })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    // Modal handler functions
    const openCatchView = (catch_) => {
      selectedCatchData.value = {
        ...catch_,
        coordinates: {
          lat: parseFloat(catch_.latitude),
          lng: parseFloat(catch_.longitude)
        }
      }
      showViewModal.value = true
    }

    const openCatchEdit = (catch_) => {
      selectedCatchData.value = {
        ...catch_,
        coordinates: {
          lat: parseFloat(catch_.latitude),
          lng: parseFloat(catch_.longitude)
        }
      }
      modalMode.value = 'edit'
      showCatchModal.value = true
    }

    const openDeleteConfirmation = (catch_) => {
      selectedCatchData.value = catch_
      showDeleteModal.value = true
    }

    // Legacy handler for backward compatibility
    const openCatchDetails = (catch_) => {
      openCatchView(catch_)
    }

    const closeCatchModal = () => {
      showCatchModal.value = false
      selectedCatchData.value = null
      modalMode.value = 'edit'
    }

    const closeViewModal = () => {
      showViewModal.value = false
      selectedCatchData.value = null
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      selectedCatchData.value = null
    }

    const switchToEdit = () => {
      showViewModal.value = false
      modalMode.value = 'edit'
      showCatchModal.value = true
    }

    const handleCatchUpdate = async (updatedCatchData) => {
      try {
        // Update the catch data locally
        const index = recentCatches.value.findIndex(c => c.id === updatedCatchData.id)
        if (index !== -1) {
          recentCatches.value[index] = { ...recentCatches.value[index], ...updatedCatchData }
        }
        
        // Reload dashboard data to refresh statistics
        await loadDashboardData()
        
        closeCatchModal()
      } catch (error) {
        console.error('Error updating catch:', error)
      }
    }

    const handleCatchDelete = async (catch_) => {
      try {
        const catchId = catch_?.id || selectedCatchData.value?.id
        
        const response = await fetch(`/api/catches/${catchId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          // Remove from local data
          recentCatches.value = recentCatches.value.filter(c => c.id !== catchId)
          
          // Reload dashboard data to refresh statistics
          await loadDashboardData()
          
          // Close all modals
          closeDeleteModal()
          closeCatchModal()
          closeViewModal()
        }
      } catch (error) {
        console.error('Error deleting catch:', error)
      }
    }

    const handleModeChanged = (newMode) => {
      modalMode.value = newMode
    }

    // Get photo URL from photo_urls array
    const getPhotoUrl = (catch_) => {
      if (!catch_ || !catch_.photo_urls) return null
      try {
        const photoUrls = typeof catch_.photo_urls === 'string' 
          ? JSON.parse(catch_.photo_urls) 
          : catch_.photo_urls
        return photoUrls && photoUrls.length > 0 ? photoUrls[0] : null
      } catch (error) {
        console.error('Error parsing photo URLs:', error)
        return null
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      user,
      stats,
      recentCatches,
      weather,
      showCatchModal,
      showViewModal,
      showDeleteModal,
      modalMode,
      selectedCatchData,
      getSpeciesColor,
      formatDate,
      getPhotoUrl,
      openCatchView,
      openCatchEdit,
      openDeleteConfirmation,
      openCatchDetails,
      closeCatchModal,
      closeViewModal,
      closeDeleteModal,
      switchToEdit,
      handleCatchUpdate,
      handleCatchDelete,
      handleModeChanged
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>