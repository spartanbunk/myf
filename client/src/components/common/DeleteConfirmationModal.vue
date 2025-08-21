<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    @click="$emit('close')"
  >
    <div 
      class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      @click.stop
    >
      <!-- Warning Icon -->
      <div class="flex items-center justify-center pt-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
          Delete Catch
        </h3>
        <p class="text-sm text-gray-500 text-center mb-4">
          Are you sure you want to delete this catch? This action cannot be undone.
        </p>

        <!-- Catch Preview -->
        <div v-if="catchData" class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex items-center space-x-3">
            <!-- Thumbnail -->
            <div class="flex-shrink-0">
              <img 
                v-if="photoUrl"
                :src="photoUrl"
                :alt="catchData.species"
                class="w-12 h-12 rounded-md object-cover"
              >
              <div 
                v-else
                class="w-12 h-12 rounded-md flex items-center justify-center"
                :style="{ backgroundColor: getSpeciesColor(catchData.species) }"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            
            <!-- Catch Details -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ catchData.species || 'Unknown Species' }}
              </p>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span v-if="catchData.weight">{{ catchData.weight }}lbs</span>
                <span v-if="catchData.length">{{ catchData.length }}in</span>
                <span v-if="catchData.date">{{ formatDate(catchData.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
          Delete Catch
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatDate, getSpeciesColor } from '@/utils/helpers'

export default {
  name: 'DeleteConfirmationModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    catchData: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'confirm'],
  setup(props) {
    // Get photo URL from photo_urls array
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

    return {
      photoUrl,
      formatDate,
      getSpeciesColor
    }
  }
}
</script>

<style scoped>
/* Custom styles for modal animations */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>