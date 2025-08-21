<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">Mark Your Catch</h1>
            <p class="text-gray-600 mt-1">Click anywhere on the map to log a new catch</p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link 
              to="/catches" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              View Catch Log
            </router-link>
            <router-link 
              to="/dashboard" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="flex-1 p-6">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden" style="height: calc(100vh - 200px);">
        <!-- Map Component -->
        <GoogleMap 
          ref="mapRef"
          :catches="catches" 
          :center="mapCenter"
          :zoom="mapZoom"
          :clickable="true"
          @map-click="handleMapClick"
          @marker-click="handleMarkerClick"
          class="w-full h-full"
        />

        <!-- Loading Overlay for Map Data -->
        <div v-if="loadingCatches" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p class="text-gray-600">Loading your catches...</p>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-blue-800 mb-1">How to Use</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Click anywhere on the map to mark a new catch location</li>
              <li>• Click on existing markers to view catch details</li>
              <li>• Use the filter button to show/hide specific fish species</li>
              <li>• Use the location button to center the map on your current position</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Catch Modal -->
    <LogCatchModal 
      :is-open="showLogCatchModal"
      :coordinates="selectedCoordinates"
      @close="closeLogCatchModal"
      @save="saveCatch"
    />

    <!-- Catch Details Modal -->
    <div 
      v-if="selectedCatch" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">Catch Details</h2>
          <button 
            @click="closeDetailsModal"
            class="text-gray-400 hover:text-gray-600 transition duration-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <!-- Photo -->
          <div v-if="getPhotoUrl(selectedCatch)" class="mb-4">
            <img 
              :src="getPhotoUrl(selectedCatch)" 
              :alt="selectedCatch.species"
              class="w-full h-48 object-cover rounded-lg"
            >
          </div>

          <!-- Basic Info -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="font-medium text-gray-700">Species:</span>
              <span class="text-gray-900">{{ selectedCatch.species }}</span>
            </div>
            
            <div v-if="selectedCatch.weight" class="flex justify-between">
              <span class="font-medium text-gray-700">Weight:</span>
              <span class="text-gray-900">{{ selectedCatch.weight }} lbs</span>
            </div>
            
            <div v-if="selectedCatch.length" class="flex justify-between">
              <span class="font-medium text-gray-700">Length:</span>
              <span class="text-gray-900">{{ selectedCatch.length }} inches</span>
            </div>
            
            <div v-if="selectedCatch.lureType" class="flex justify-between">
              <span class="font-medium text-gray-700">Lure:</span>
              <span class="text-gray-900">{{ selectedCatch.lureType }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="font-medium text-gray-700">Date:</span>
              <span class="text-gray-900">{{ formatDate(selectedCatch.dateOfCatch) }}</span>
            </div>
            
            <div v-if="selectedCatch.depth" class="flex justify-between">
              <span class="font-medium text-gray-700">Depth:</span>
              <span class="text-gray-900">{{ selectedCatch.depth }} feet</span>
            </div>
            
            <div v-if="selectedCatch.waterTemperature" class="flex justify-between">
              <span class="font-medium text-gray-700">Water Temp:</span>
              <span class="text-gray-900">{{ selectedCatch.waterTemperature }}°F</span>
            </div>

            <div v-if="selectedCatch.weatherConditions" class="flex justify-between">
              <span class="font-medium text-gray-700">Weather:</span>
              <span class="text-gray-900">{{ selectedCatch.weatherConditions }}</span>
            </div>
            
            <div v-if="selectedCatch.notes" class="border-t pt-3 mt-3">
              <span class="font-medium text-gray-700 block mb-1">Notes:</span>
              <p class="text-gray-900 text-sm">{{ selectedCatch.notes }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              @click="editCatch"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Edit
            </button>
            <button 
              @click="deleteCatch"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showSuccessToast"
      class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300"
      :class="{ 'translate-y-0 opacity-100': showSuccessToast, 'translate-y-2 opacity-0': !showSuccessToast }"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Catch saved successfully!
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { catchesApi } from '@/services/api'
import GoogleMap from '@/components/maps/GoogleMap.vue'
import LogCatchModal from '@/components/maps/LogCatchModal.vue'

export default {
  name: 'Map',
  components: {
    GoogleMap,
    LogCatchModal
  },
  setup() {
    const authStore = useAuthStore()
    const mapRef = ref(null)
    const catches = ref([])
    const loadingCatches = ref(true)
    const showLogCatchModal = ref(false)
    const selectedCoordinates = ref(null)
    const selectedCatch = ref(null)
    const showSuccessToast = ref(false)

    const mapCenter = ref({ lat: 44.9778, lng: -93.2650 }) // Minneapolis, MN default
    const mapZoom = ref(10)

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadCatches = async () => {
      try {
        loadingCatches.value = true
        console.log('Loading catches...')
        
        const response = await catchesApi.getAll()
        const catchesData = response.data.catches || []
        
        console.log('Raw catches data from API:', catchesData)
        
        // Transform catches to include coordinates object for map display
        catches.value = catchesData.map(catch_ => ({
          ...catch_,
          coordinates: catch_.latitude && catch_.longitude ? {
            lat: catch_.latitude,
            lng: catch_.longitude
          } : null
        }))
        
        console.log('Transformed catches with coordinates:', catches.value)
      } catch (error) {
        console.error('Error loading catches:', error)
      } finally {
        loadingCatches.value = false
      }
    }

    const handleMapClick = (coordinates) => {
      selectedCoordinates.value = coordinates
      showLogCatchModal.value = true
    }

    const handleMarkerClick = (catch_) => {
      selectedCatch.value = catch_
    }

    const closeLogCatchModal = () => {
      showLogCatchModal.value = false
      selectedCoordinates.value = null
    }

    const closeDetailsModal = () => {
      selectedCatch.value = null
    }

    const saveCatch = async (catchData) => {
      try {
        console.log('Saving catch data:', catchData)
        
        // Create FormData for file upload
        const formData = new FormData()
        
        // Add all catch data to FormData
        Object.keys(catchData).forEach(key => {
          if (catchData[key] !== null && catchData[key] !== '') {
            if (key === 'photo' && catchData[key] instanceof File) {
              formData.append('photo', catchData[key])
            } else if (key !== 'photo') {
              formData.append(key, catchData[key])
            }
          }
        })

        console.log('FormData contents:')
        for (let [key, value] of formData.entries()) {
          console.log(key, value)
        }

        const response = await catchesApi.create(formData)
        const newCatch = response.data.catch
        
        console.log('API response:', response.data)
        console.log('New catch data:', newCatch)
        
        // Add coordinates object for map display
        if (newCatch.latitude && newCatch.longitude) {
          newCatch.coordinates = { lat: newCatch.latitude, lng: newCatch.longitude }
          console.log('Added coordinates:', newCatch.coordinates)
        }
        
        catches.value.push(newCatch)
        console.log('Updated catches array length:', catches.value.length)
        console.log('All catches:', catches.value)
        
        showLogCatchModal.value = false
        selectedCoordinates.value = null
        
        // Show success toast
        showSuccessToast.value = true
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
      } catch (error) {
        console.error('Error saving catch:', error)
        console.error('Error details:', error.response?.data)
        alert('Failed to save catch. Please try again.')
      }
    }

    const editCatch = () => {
      // TODO: Implement edit functionality
      console.log('Edit catch:', selectedCatch.value)
      alert('Edit functionality coming soon!')
    }

    const deleteCatch = async () => {
      if (!selectedCatch.value || !confirm('Are you sure you want to delete this catch?')) {
        return
      }

      try {
        const response = await fetch(`/api/catches/${selectedCatch.value.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          // Remove from local array
          catches.value = catches.value.filter(c => c.id !== selectedCatch.value.id)
          selectedCatch.value = null
          
          // Show success toast
          showSuccessToast.value = true
          setTimeout(() => {
            showSuccessToast.value = false
          }, 3000)
        } else {
          console.error('Failed to delete catch')
          alert('Failed to delete catch. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting catch:', error)
        alert('Failed to delete catch. Please try again.')
      }
    }

    // Set user's location as map center if available
    const initializeUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            mapCenter.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            mapZoom.value = 12
          },
          (error) => {
            console.log('Geolocation error:', error)
            // Keep default location
          }
        )
      }
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
      initializeUserLocation()
      loadCatches()
    })

    return {
      mapRef,
      catches,
      loadingCatches,
      showLogCatchModal,
      selectedCoordinates,
      selectedCatch,
      showSuccessToast,
      mapCenter,
      mapZoom,
      handleMapClick,
      handleMarkerClick,
      closeLogCatchModal,
      closeDetailsModal,
      saveCatch,
      editCatch,
      deleteCatch,
      formatDate,
      getPhotoUrl
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>