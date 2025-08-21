<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="$emit('close')"
  >
    <div class="min-h-screen flex items-center justify-center p-4">
      <div 
        class="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Hero Section -->
        <div class="relative h-80 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
          <!-- Background Photo -->
          <div 
            v-if="photoUrl"
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${photoUrl})` }"
          >
            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <!-- Species Color Background (if no photo) -->
          <div 
            v-else
            class="absolute inset-0"
            :style="{ backgroundColor: getSpeciesColor(catchData?.species) }"
          >
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
            <!-- Large Fish Icon -->
            <div class="absolute inset-0 flex items-center justify-center opacity-20">
              <svg class="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>

          <!-- Hero Content -->
          <div class="relative h-full flex items-end">
            <div class="p-8 text-white">
              <div class="flex items-center space-x-3 mb-4">
                <div 
                  class="w-4 h-4 rounded-full border-2 border-white"
                  :style="{ backgroundColor: getSpeciesColor(catchData?.species) }"
                ></div>
                <span class="text-sm font-medium uppercase tracking-wide opacity-90">
                  {{ catchData?.lure_type || 'Fishing Catch' }}
                </span>
              </div>
              <h1 class="text-4xl font-bold mb-4">
                {{ catchData?.species || 'Unknown Species' }}
              </h1>
              <div class="flex items-center space-x-6">
                <div v-if="catchData?.weight" class="text-center">
                  <div class="text-3xl font-bold">{{ catchData.weight }}</div>
                  <div class="text-sm opacity-90">pounds</div>
                </div>
                <div v-if="catchData?.length" class="text-center">
                  <div class="text-3xl font-bold">{{ catchData.length }}</div>
                  <div class="text-sm opacity-90">inches</div>
                </div>
                <div v-if="catchData?.date" class="text-center">
                  <div class="text-lg font-semibold">{{ formatDate(catchData.date) }}</div>
                  <div class="text-sm opacity-90">caught on</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Catch Details Card -->
            <div class="lg:col-span-2">
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Catch Details
                </h3>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div v-if="catchData?.species">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Species</label>
                      <p class="text-sm font-medium text-gray-900">{{ catchData.species }}</p>
                    </div>
                    <div v-if="catchData?.weight">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                      <p class="text-sm font-medium text-gray-900">{{ catchData.weight }} lbs</p>
                    </div>
                    <div v-if="catchData?.length">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Length</label>
                      <p class="text-sm font-medium text-gray-900">{{ catchData.length }} inches</p>
                    </div>
                    <div v-if="catchData?.lure_type">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Lure Type</label>
                      <p class="text-sm font-medium text-gray-900">{{ catchData.lure_type }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <div v-if="catchData?.depth">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Depth</label>
                      <p class="text-sm font-medium text-gray-900">{{ catchData.depth }} feet</p>
                    </div>
                    <div v-if="catchData?.date">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date Caught</label>
                      <p class="text-sm font-medium text-gray-900">{{ formatDate(catchData.date) }}</p>
                    </div>
                    <div v-if="coordinates">
                      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                      <p class="text-sm font-medium text-gray-900">
                        {{ coordinates.lat.toFixed(4) }}, {{ coordinates.lng.toFixed(4) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Notes Section -->
                <div v-if="catchData?.notes" class="mt-6 pt-6 border-t border-gray-200">
                  <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                  <p class="text-sm text-gray-700 mt-2 leading-relaxed">{{ catchData.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Environmental Conditions Card -->
            <div>
              <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                  </svg>
                  Conditions
                </h3>
                
                <div class="space-y-4">
                  <div v-if="catchData?.weather_conditions">
                    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Weather</label>
                    <p class="text-sm font-medium text-gray-900">{{ catchData.weather_conditions }}</p>
                  </div>
                  <div v-if="catchData?.water_temperature">
                    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Water Temperature</label>
                    <p class="text-sm font-medium text-gray-900">{{ catchData.water_temperature }}°F</p>
                  </div>
                  <div v-if="catchData?.wind_speed">
                    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Wind Speed</label>
                    <p class="text-sm font-medium text-gray-900">{{ catchData.wind_speed }} mph</p>
                  </div>
                  <div v-if="catchData?.barometric_pressure">
                    <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Pressure</label>
                    <p class="text-sm font-medium text-gray-900">{{ catchData.barometric_pressure }} inHg</p>
                  </div>
                </div>
              </div>

              <!-- Photo Gallery -->
              <div v-if="allPhotos.length > 0" class="mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Photos
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <img 
                    v-for="(photo, index) in allPhotos.slice(0, 4)" 
                    :key="index"
                    :src="photo"
                    :alt="`Catch photo ${index + 1}`"
                    class="w-full h-24 object-cover rounded-md hover:scale-105 transition-transform duration-200 cursor-pointer"
                    @click="openPhotoViewer(photo)"
                  >
                </div>
                <p v-if="allPhotos.length > 4" class="text-xs text-gray-500 mt-2 text-center">
                  +{{ allPhotos.length - 4 }} more photos
                </p>
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              Catch ID: #{{ catchData?.id }}
            </div>
            <div class="flex space-x-3">
              <button
                @click="$emit('edit')"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <span>Edit Catch</span>
              </button>
              <button
                @click="$emit('delete')"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Delete Catch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatDate, getSpeciesColor } from '@/utils/helpers'

export default {
  name: 'CatchViewModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    catchData: {
      type: Object,
      default: null
    },
    coordinates: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  setup(props) {
    // Get primary photo URL
    const photoUrl = computed(() => {
      if (!props.catchData || !props.catchData.photo_urls) return null
      try {
        const photoUrls = typeof props.catchData.photo_urls === 'string' 
          ? JSON.parse(props.catchData.photo_urls) 
          : props.catchData.photo_urls
        return photoUrls && photoUrls.length > 0 ? photoUrls[0] : null
      } catch (error) {
        console.error('Error parsing photo URLs:', error)
        return null
      }
    })

    // Get all photos for gallery
    const allPhotos = computed(() => {
      if (!props.catchData || !props.catchData.photo_urls) return []
      try {
        const photoUrls = typeof props.catchData.photo_urls === 'string' 
          ? JSON.parse(props.catchData.photo_urls) 
          : props.catchData.photo_urls
        return photoUrls || []
      } catch (error) {
        console.error('Error parsing photo URLs:', error)
        return []
      }
    })

    const openPhotoViewer = (photo) => {
      // TODO: Implement photo viewer modal
      window.open(photo, '_blank')
    }

    return {
      photoUrl,
      allPhotos,
      openPhotoViewer,
      formatDate,
      getSpeciesColor
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for modal entrance */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: slideInUp 0.3s ease-out;
}
</style>