<template>
  <div 
    v-if="catchData"
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Compact variant (Dashboard) -->
    <template v-if="variant === 'compact'">
      <div class="flex items-center">
        <!-- Photo thumbnail or species color indicator -->
        <div class="mr-3 flex-shrink-0">
          <img 
            v-if="photoUrl"
            :src="photoUrl"
            :alt="catchData.species || 'Fish'"
            class="w-12 h-12 rounded-lg object-cover"
          >
          <div 
            v-else
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: getSpeciesColor(catchData.species || 'Unknown') }"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        </div>
        <div>
          <h3 class="font-medium text-gray-800">{{ catchData.species || 'Unknown Species' }}</h3>
          <p class="text-sm text-gray-600">
            {{ catchData.weight || 0 }}lb - {{ formatDate(catchData.date) }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-600">{{ catchData.lure_type || 'Unknown' }}</p>
        <p class="text-xs text-gray-500">{{ catchData.depth || 0 }}ft deep</p>
      </div>
    </template>

    <!-- List variant (Dashboard recent catches) -->
    <template v-else-if="variant === 'list'">
      <div class="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
        <!-- Left: Thumbnail and primary info -->
        <div class="flex items-center min-w-0 flex-1">
          <!-- Thumbnail -->
          <div class="mr-3 flex-shrink-0">
            <img 
              v-if="photoUrl"
              :src="photoUrl"
              :alt="catchData.species || 'Fish'"
              class="w-8 h-8 rounded-md object-cover"
            >
            <div 
              v-else
              class="w-8 h-8 rounded-md flex items-center justify-center"
              :style="{ backgroundColor: getSpeciesColor(catchData.species || 'Unknown') }"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          
          <!-- Primary Info -->
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-gray-900 truncate">{{ catchData.species || 'Unknown Species' }}</h4>
            <div class="flex items-center space-x-3 text-sm text-gray-600">
              <span>{{ catchData.weight || 0 }}lb</span>
              <span v-if="catchData.length">{{ catchData.length }}in</span>
              <span>{{ formatDate(catchData.date) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Right: Secondary info -->
        <div class="text-right text-sm text-gray-500 ml-4 flex-shrink-0">
          <div v-if="catchData.lure_type">{{ catchData.lure_type }}</div>
          <div v-if="catchData.depth" class="text-xs">{{ catchData.depth }}ft</div>
        </div>
      </div>
    </template>

    <!-- Full variant (Catches grid) -->
    <template v-else-if="variant === 'full'">
      <!-- Photo -->
      <div class="aspect-w-16 aspect-h-12 bg-gray-200">
        <img 
          v-if="photoUrl"
          :src="photoUrl"
          :alt="catchData.species || 'Fish'"
          class="w-full h-48 object-cover"
        >
        <div v-else class="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      </div>
      <!-- Content -->
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-gray-800">{{ catchData.species || 'Unknown Species' }}</h3>
          <div 
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: getSpeciesColor(catchData.species || 'Unknown') }"
          ></div>
        </div>
        
        <div class="space-y-1 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Weight:</span>
            <span class="font-medium">{{ catchData.weight ? `${catchData.weight} lbs` : '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span>Length:</span>
            <span class="font-medium">{{ catchData.length ? `${catchData.length} in` : '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span>Date:</span>
            <span class="font-medium">{{ formatDate(catchData.date) }}</span>
          </div>
          <div v-if="catchData.lure_type" class="flex justify-between">
            <span>Lure:</span>
            <span class="font-medium">{{ catchData.lure_type }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatDate, getSpeciesColor } from '@/utils/helpers'

export default {
  name: 'CatchCard',
  props: {
    catchData: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'full',
      validator: (value) => ['compact', 'full', 'list'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
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

    // Dynamic CSS classes based on variant
    const cardClasses = computed(() => {
      const baseClasses = props.clickable ? 'cursor-pointer transition duration-300' : ''
      
      if (props.variant === 'compact') {
        return `flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${baseClasses}`
      } else if (props.variant === 'list') {
        return `bg-white border border-gray-200 hover:bg-gray-50 ${baseClasses}`
      } else {
        return `bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md ${baseClasses}`
      }
    })

    const handleClick = () => {
      if (props.clickable) {
        emit('click', props.catchData)
      }
    }

    return {
      photoUrl,
      cardClasses,
      handleClick,
      formatDate,
      getSpeciesColor
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>