<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">
          <span v-if="isCreateMode">Log Your Catch</span>
          <span v-else-if="isViewMode">{{ catchData?.species || 'Catch' }} Details</span>
          <span v-else-if="isEditMode">Edit {{ catchData?.species || 'Catch' }}</span>
        </h2>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition duration-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="submitCatch" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Catch Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Catch Details</h3>
            
            <!-- Species -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Species *</label>
              <select 
                v-model="formData.species" 
                @change="handleSpeciesChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isReadOnly"
                :required="!isReadOnly"
              >
                <option value="">Select Species</option>
                <option v-for="species in fishSpecies" :key="species" :value="species">
                  {{ species }}
                </option>
              </select>
            </div>

            <!-- Custom Species Input -->
            <div v-if="formData.species === 'Other'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Specify Species *</label>
              <input 
                v-model="formData.customSpecies"
                type="text"
                placeholder="Enter species name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isReadOnly"
                :required="!isReadOnly"
              >
            </div>

            <!-- Length -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Length (inches)</label>
              <input 
                v-model.number="formData.length"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 18.5"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isReadOnly"
              >
            </div>

            <!-- Weight -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input 
                v-model.number="formData.weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 3.2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isReadOnly"
              >
            </div>

            <!-- Lure Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lure Type</label>
              <select 
                v-model="formData.lureType" 
                @change="handleLureChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Lure Type</option>
                <option v-for="lure in lureTypes" :key="lure" :value="lure">
                  {{ lure }}
                </option>
              </select>
            </div>

            <!-- Custom Lure Input -->
            <div v-if="formData.lureType === 'Other'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Specify Lure Type</label>
              <input 
                v-model="formData.customLureType"
                type="text"
                placeholder="Enter lure type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Photo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input 
                ref="photoInput"
                type="file"
                accept="image/*"
                @change="handlePhotoUpload"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <div v-if="photoPreview" class="mt-2">
                <img :src="photoPreview" alt="Photo preview" class="w-full h-32 object-cover rounded-md">
              </div>
            </div>
          </div>

          <!-- Environmental Conditions -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Environmental Conditions</h3>
            
            <!-- Date and Time -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Catch *</label>
                <input 
                  v-model="formData.dateOfCatch"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isReadOnly"
                  :required="!isReadOnly"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Time of Catch *</label>
                <input 
                  v-model="formData.timeOfCatch"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isReadOnly"
                  :required="!isReadOnly"
                >
              </div>
            </div>

            <!-- Water Conditions -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Depth (feet)</label>
                <input 
                  v-model.number="formData.depth"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 12.5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Water Temp (°F)</label>
                <input 
                  v-model.number="formData.waterTemperature"
                  type="number"
                  step="0.1"
                  min="32"
                  max="100"
                  placeholder="e.g., 68.5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>

            <!-- Weather Conditions -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Weather</label>
                <select 
                  v-model="formData.weatherConditions"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Weather</option>
                  <option value="Sunny">Sunny</option>
                  <option value="Partly Cloudy">Partly Cloudy</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Overcast">Overcast</option>
                  <option value="Light Rain">Light Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Foggy">Foggy</option>
                  <option value="Windy">Windy</option>
                  <option value="Stormy">Stormy</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Air Temp (°F)</label>
                <input 
                  v-model.number="formData.airTemperature"
                  type="number"
                  step="0.1"
                  min="-50"
                  max="120"
                  placeholder="e.g., 72"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>

            <!-- Wind Information -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Wind Speed (mph)</label>
                <input 
                  v-model.number="formData.windSpeed"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 8.5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Wind Direction</label>
                <select 
                  v-model="formData.windDirection"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Direction</option>
                  <option value="N">N (North)</option>
                  <option value="NE">NE (Northeast)</option>
                  <option value="E">E (East)</option>
                  <option value="SE">SE (Southeast)</option>
                  <option value="S">S (South)</option>
                  <option value="SW">SW (Southwest)</option>
                  <option value="W">W (West)</option>
                  <option value="NW">NW (Northwest)</option>
                </select>
              </div>
            </div>

            <!-- Atmospheric Conditions -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Barometric Pressure (inHg)</label>
                <input 
                  v-model.number="formData.barometricPressure"
                  type="number"
                  step="0.01"
                  min="28"
                  max="32"
                  placeholder="e.g., 30.15"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pressure Trend</label>
                <select 
                  v-model="formData.pressureTrend"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Trend</option>
                  <option value="Rising">Rising</option>
                  <option value="Steady">Steady</option>
                  <option value="Falling">Falling</option>
                </select>
              </div>
            </div>

            <!-- Lunar Phase -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lunar Phase</label>
              <select 
                v-model="formData.lunarPhase"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Phase</option>
                <option value="New Moon">New Moon</option>
                <option value="Waxing Crescent">Waxing Crescent</option>
                <option value="First Quarter">First Quarter</option>
                <option value="Waxing Gibbous">Waxing Gibbous</option>
                <option value="Full Moon">Full Moon</option>
                <option value="Waning Gibbous">Waning Gibbous</option>
                <option value="Last Quarter">Last Quarter</option>
                <option value="Waning Crescent">Waning Crescent</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            v-model="formData.notes"
            rows="3"
            placeholder="Any additional notes about this catch..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isReadOnly"
          ></textarea>
        </div>

        <!-- Location Display -->
        <div v-if="coordinates" class="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 mb-2">Location</h4>
          <p class="text-sm text-blue-700">
            Latitude: {{ coordinates.lat.toFixed(6) }}, Longitude: {{ coordinates.lng.toFixed(6) }}
          </p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <!-- Left side - Delete button (only in view/edit mode) -->
          <div>
            <button 
              v-if="!isCreateMode && catchData?.id"
              type="button" 
              @click="handleDelete"
              class="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-300"
            >
              🗑️ Delete
            </button>
          </div>
          
          <!-- Right side - Main actions -->
          <div class="flex space-x-3">
            <button 
              type="button" 
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              {{ isViewMode ? 'Close' : 'Cancel' }}
            </button>
            
            <!-- View mode: Edit button -->
            <button 
              v-if="isViewMode"
              type="button"
              @click="switchToEditMode"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              ✏️ Edit
            </button>
            
            <!-- Edit/Create mode: Save button -->
            <button 
              v-if="!isViewMode"
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">Saving...</span>
              <span v-else-if="isEditMode">💾 Save Changes</span>
              <span v-else>Save Catch</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { weatherApi, catchesApi } from '@/services/api'
import { FISH_SPECIES, LURE_TYPES } from '@/utils/constants'

export default {
  name: 'LogCatchModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    coordinates: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'view', 'edit'].includes(value)
    },
    catchData: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save', 'delete', 'mode-changed'],
  setup(props, { emit }) {
    const isSubmitting = ref(false)
    const photoInput = ref(null)
    const photoPreview = ref(null)
    const currentMode = ref(props.mode)
    
    // Mode computed properties
    const isViewMode = computed(() => currentMode.value === 'view')
    const isEditMode = computed(() => currentMode.value === 'edit')
    const isCreateMode = computed(() => currentMode.value === 'create')
    const isReadOnly = computed(() => isViewMode.value)

    // Use fish species from constants to ensure consistency with colors
    const fishSpecies = FISH_SPECIES.map(species => species.name)

    // Use lure types from constants for consistency
    const lureTypes = LURE_TYPES.map(lure => lure.name)

    const formData = ref({
      // Basic catch info
      species: '',
      customSpecies: '',
      length: '',
      weight: '',
      lureType: '',
      customLureType: '',
      photo: null,

      // Environmental conditions
      dateOfCatch: new Date().toISOString().split('T')[0],
      timeOfCatch: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
      depth: '',
      waterTemperature: '',
      weatherConditions: '',
      airTemperature: '',
      windSpeed: '',
      windDirection: '',
      barometricPressure: '',
      pressureTrend: '',
      lunarPhase: '',
      notes: ''
    })

    const resetForm = () => {
      formData.value = {
        species: '',
        customSpecies: '',
        length: '',
        weight: '',
        lureType: '',
        customLureType: '',
        photo: null,
        dateOfCatch: new Date().toISOString().split('T')[0],
        timeOfCatch: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
        depth: '',
        waterTemperature: '',
        weatherConditions: '',
        airTemperature: '',
        windSpeed: '',
        windDirection: '',
        barometricPressure: '',
        pressureTrend: '',
        lunarPhase: '',
        notes: ''
      }
      photoPreview.value = null
      if (photoInput.value) {
        photoInput.value.value = ''
      }
    }

    const initializeFormData = () => {
      if (props.catchData && (isViewMode.value || isEditMode.value)) {
        // Parse the date from the catch data
        const catchDate = new Date(props.catchData.date)
        const dateString = catchDate.toISOString().split('T')[0]
        const timeString = catchDate.toTimeString().split(' ')[0].slice(0, 5)
        
        // Populate formData with existing catch data
        formData.value = {
          species: props.catchData.species || '',
          customSpecies: props.catchData.species === 'Other' ? props.catchData.customSpecies || '' : '',
          length: props.catchData.length || '',
          weight: props.catchData.weight || '',
          lureType: props.catchData.lure_type || '',
          customLureType: props.catchData.lure_type === 'Other' ? props.catchData.customLureType || '' : '',
          photo: null,
          dateOfCatch: dateString,
          timeOfCatch: timeString,
          depth: props.catchData.depth || '',
          waterTemperature: props.catchData.water_temperature || '',
          weatherConditions: props.catchData.weather_conditions || '',
          airTemperature: props.catchData.air_temperature || '',
          windSpeed: props.catchData.wind_speed || '',
          windDirection: props.catchData.wind_direction || '',
          barometricPressure: props.catchData.barometric_pressure || '',
          pressureTrend: props.catchData.pressure_trend || '',
          lunarPhase: props.catchData.lunar_phase || '',
          notes: props.catchData.notes || ''
        }
        
        // Handle existing photos
        if (props.catchData.photo_urls) {
          try {
            // photo_urls comes from database as JSON string, parse it
            const photoUrls = typeof props.catchData.photo_urls === 'string' 
              ? JSON.parse(props.catchData.photo_urls) 
              : props.catchData.photo_urls
            
            if (photoUrls && photoUrls.length > 0) {
              photoPreview.value = photoUrls[0]
            }
          } catch (error) {
            console.error('Error parsing photo URLs:', error)
          }
        }
      } else {
        resetForm()
      }
    }

    const handleSpeciesChange = () => {
      if (formData.value.species !== 'Other') {
        formData.value.customSpecies = ''
      }
    }

    const handleLureChange = () => {
      if (formData.value.lureType !== 'Other') {
        formData.value.customLureType = ''
      }
    }

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        formData.value.photo = file
        const reader = new FileReader()
        reader.onload = (e) => {
          photoPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // Mode transition methods
    const switchToEditMode = () => {
      currentMode.value = 'edit'
      emit('mode-changed', 'edit')
    }

    const switchToViewMode = () => {
      currentMode.value = 'view'
      emit('mode-changed', 'view')
    }

    const closeModal = () => {
      resetForm()
      currentMode.value = props.mode // Reset to original mode
      emit('close')
    }

    const handleDelete = async () => {
      if (props.catchData && props.catchData.id) {
        try {
          await catchesApi.delete(props.catchData.id)
          emit('delete', props.catchData.id)
        } catch (error) {
          console.error('Error deleting catch:', error)
        }
      }
    }

    const submitCatch = async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true

        // Combine date and time into ISO format
        const dateTime = `${formData.value.dateOfCatch}T${formData.value.timeOfCatch}:00.000Z`

        // Prepare catch data according to backend API schema
        const catchData = {
          // Required fields
          species: formData.value.species === 'Other' ? formData.value.customSpecies : formData.value.species,
          location: `${props.coordinates.lat.toFixed(6)}, ${props.coordinates.lng.toFixed(6)}`, // Generate location string
          date: dateTime,
          
          // Optional fields
          weight: formData.value.weight || null,
          length: formData.value.length || null,
          latitude: props.coordinates.lat,
          longitude: props.coordinates.lng,
          notes: formData.value.notes || null,
          
          // Additional fields for our app (will be ignored by current backend validation but useful for future)
          lureType: formData.value.lureType === 'Other' ? formData.value.customLureType : formData.value.lureType,
          depth: formData.value.depth,
          waterTemperature: formData.value.waterTemperature,
          weatherConditions: formData.value.weatherConditions,
          airTemperature: formData.value.airTemperature,
          windSpeed: formData.value.windSpeed,
          windDirection: formData.value.windDirection,
          barometricPressure: formData.value.barometricPressure,
          pressureTrend: formData.value.pressureTrend,
          lunarPhase: formData.value.lunarPhase,
          photo: formData.value.photo
        }

        // Prepare data for API - use FormData if photo is present, otherwise use JSON
        let apiData = catchData
        if (formData.value.photo) {
          // Create FormData for multipart upload
          const formDataToSend = new FormData()
          
          // Add all non-file fields
          Object.keys(catchData).forEach(key => {
            if (key !== 'photo' && catchData[key] !== null && catchData[key] !== undefined) {
              formDataToSend.append(key, catchData[key])
            }
          })
          
          // Add photo file
          formDataToSend.append('photo', formData.value.photo)
          apiData = formDataToSend
        }

        // Call appropriate API based on mode
        if (isEditMode.value && props.catchData?.id) {
          // Update existing catch
          const response = await catchesApi.update(props.catchData.id, apiData)
          emit('save', { 
            ...response.data.catch, 
            mode: currentMode.value 
          })
        } else {
          // Create new catch - emit data for parent to handle
          emit('save', { 
            ...catchData, 
            mode: currentMode.value 
          })
        }
        
        if (isCreateMode.value) {
          resetForm()
        } else {
          // Switch back to view mode after successful edit
          switchToViewMode()
        }
      } catch (error) {
        console.error('Error submitting catch:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    // Initialize form data when modal opens or mode changes
    watch([() => props.isOpen, () => props.mode, () => props.catchData], async ([isOpen, mode, catchData]) => {
      if (isOpen) {
        currentMode.value = mode
        initializeFormData()
        
        // Auto-populate weather data only for create mode
        if (isCreateMode.value && props.coordinates) {
          try {
            const response = await weatherApi.getCurrent(props.coordinates.lat, props.coordinates.lng)
            const weather = response.data.weather?.current || response.data
            
            // Auto-populate weather fields from API response
            if (weather.conditions) {
              formData.value.weatherConditions = weather.conditions.main || weather.conditions.description || ''
            }
            formData.value.airTemperature = weather.temperature || ''
            formData.value.windSpeed = weather.wind?.speed || weather.windSpeed || ''
            formData.value.windDirection = weather.wind?.direction || weather.windDirection || ''
            formData.value.barometricPressure = weather.pressure || ''
            formData.value.pressureTrend = weather.pressureTrend || ''
            formData.value.lunarPhase = weather.lunarPhase || ''
          } catch (error) {
            console.error('Error fetching weather data:', error)
          }
        }
      }
    }, { immediate: true })

    return {
      formData,
      isSubmitting,
      photoInput,
      photoPreview,
      fishSpecies,
      lureTypes,
      currentMode,
      isViewMode,
      isEditMode,
      isCreateMode,
      isReadOnly,
      handleSpeciesChange,
      handleLureChange,
      handlePhotoUpload,
      switchToEditMode,
      switchToViewMode,
      closeModal,
      handleDelete,
      submitCatch
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>