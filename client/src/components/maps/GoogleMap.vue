<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    
    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">Loading map...</p>
      </div>
    </div>

    <!-- Error overlay -->
    <div v-if="error" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
      <div class="text-center p-4">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Map Error</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="initializeMap" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button 
        @click="getCurrentLocation"
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200"
        title="Current Location"
      >
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
      
      <div v-if="showFilters" class="bg-white rounded-lg shadow-md p-3 border border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Filter by Species</h4>
        <div class="space-y-1">
          <label v-for="species in fishSpecies" :key="species" class="flex items-center">
            <input 
              type="checkbox" 
              :value="species" 
              v-model="activeFilters"
              @change="filterMarkers"
              class="mr-2"
            >
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :style="{ backgroundColor: getSpeciesColor(species) }"
            ></div>
            <span class="text-xs text-gray-700">{{ species }}</span>
          </label>
        </div>
      </div>

      <button 
        @click="showFilters = !showFilters"
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200"
        title="Filter Catches"
      >
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import mapsService from '@/services/maps'

export default {
  name: 'GoogleMap',
  props: {
    catches: {
      type: Array,
      default: () => []
    },
    center: {
      type: Object,
      default: () => ({ lat: 44.9778, lng: -93.2650 }) // Minneapolis, MN
    },
    zoom: {
      type: Number,
      default: 10
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['mapClick', 'markerClick'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const map = ref(null)
    const markers = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showFilters = ref(false)
    const activeFilters = ref([])

    const fishSpecies = [
      'Musky', 'Pike', 'Bass(Smallmouth)', 'Bass(Largemouth)', 
      'Walleye', 'Perch', 'Bluegill', 'Catfish', 'Trout', 'Salmon', 'Other'
    ]

    const speciesColors = {
      'Musky': '#FF6B6B',
      'Pike': '#4ECDC4', 
      'Bass(Smallmouth)': '#45B7D1',
      'Bass(Largemouth)': '#96CEB4',
      'Walleye': '#FFEAA7',
      'Perch': '#DDA0DD',
      'Bluegill': '#87CEEB',
      'Catfish': '#F4A261',
      'Trout': '#E9C46A',
      'Salmon': '#F76C6C',
      'Other': '#95A5A6'
    }

    const getSpeciesColor = (species) => {
      return speciesColors[species] || speciesColors['Other']
    }

    const initializeMap = async () => {
      try {
        loading.value = true
        error.value = null

        if (!mapContainer.value) {
          throw new Error('Map container not found')
        }

        // Initialize map using mapsService with minimal configuration for testing
        map.value = await mapsService.initializeMap(mapContainer.value, {
          center: props.center,
          zoom: props.zoom
          // Remove conflicting configurations temporarily
        })

        console.log('Map initialized successfully:', !!map.value)
        console.log('Map bounds:', map.value.getBounds())
        console.log('Map center:', map.value.getCenter())

        // Add a test marker to verify basic functionality
        const testMarker = new google.maps.Marker({
          map: map.value,
          position: { lat: 44.9778, lng: -93.2650 }, // Minneapolis
          title: 'Test Marker',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FF0000',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })
        console.log('Test marker created at Minneapolis:', testMarker.getPosition().toString())

        // Add click listener for marking new catches
        if (props.clickable) {
          mapsService.addMapClickListener((coordinates) => {
            emit('mapClick', coordinates)
          })
        }

        // Load existing catch markers
        loadMarkers()

        loading.value = false
      } catch (err) {
        console.error('Map initialization error:', err)
        error.value = err.message
        loading.value = false
      }
    }

    const loadMarkers = () => {
      console.log('GoogleMap: loadMarkers called')
      console.log('Map ready:', !!map.value)
      console.log('Google Maps API ready:', !!window.google?.maps?.marker?.AdvancedMarkerElement)
      console.log('Catches to process:', props.catches)
      
      if (!map.value || !window.google?.maps?.marker?.AdvancedMarkerElement) {
        console.log('GoogleMap: loadMarkers aborted - missing dependencies')
        return
      }

      // Clear existing markers
      markers.value.forEach(marker => {
        marker.map = null
      })
      markers.value = []

      // Add markers for catches
      props.catches.forEach((catch_, index) => {
        console.log(`Processing catch ${index}:`, catch_)
        if (catch_.coordinates) {
          console.log(`Creating marker for catch ${index} at:`, catch_.coordinates)
          const marker = createAdvancedMarker(catch_)
          if (marker) {
            markers.value.push(marker)
            console.log(`Marker created for catch ${index}`)
          } else {
            console.log(`Failed to create marker for catch ${index}`)
          }
        } else {
          console.log(`Catch ${index} has no coordinates:`, catch_)
        }
      })

      console.log('Total markers created:', markers.value.length)

      // Initialize filters with all species
      activeFilters.value = [...fishSpecies]

      // If we have markers, fit the map bounds to include all markers
      if (markers.value.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        markers.value.forEach(marker => {
          bounds.extend(marker.position)
        })
        map.value.fitBounds(bounds)
        console.log('Map bounds fitted to markers:', bounds.toJSON())
      }
    }

    const createAdvancedMarker = (catch_) => {
      try {
        // Validate coordinates exist
        if (!catch_.coordinates || typeof catch_.coordinates !== 'object') {
          console.error(`Catch ${catch_.id} has invalid coordinates object:`, catch_.coordinates)
          return null
        }

        if (catch_.coordinates.lat == null || catch_.coordinates.lng == null) {
          console.error(`Catch ${catch_.id} has missing lat/lng:`, catch_.coordinates)
          return null
        }

        // Ensure coordinates are numbers, not strings
        const lat = Number(catch_.coordinates.lat)
        const lng = Number(catch_.coordinates.lng)
        
        // Validate parsed coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.error(`Catch ${catch_.id} has invalid coordinate values - lat: ${lat}, lng: ${lng}`)
          return null
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error(`Catch ${catch_.id} has out-of-range coordinates - lat: ${lat}, lng: ${lng}`)
          return null
        }
        
        console.log(`Creating marker for catch ${catch_.id} with lat: ${lat} (type: ${typeof lat}), lng: ${lng} (type: ${typeof lng})`)

        // Create custom marker element
        const markerElement = document.createElement('div')
        markerElement.className = 'custom-marker'
        markerElement.innerHTML = `
          <div class="marker-pin" style="
            width: 24px; 
            height: 24px; 
            background-color: ${getSpeciesColor(catch_.species)}; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
          "></div>
        `

        // Add hover effects
        markerElement.addEventListener('mouseenter', () => {
          markerElement.firstElementChild.style.transform = 'scale(1.2)'
          markerElement.firstElementChild.style.zIndex = '1000'
        })

        markerElement.addEventListener('mouseleave', () => {
          markerElement.firstElementChild.style.transform = 'scale(1)'
          markerElement.firstElementChild.style.zIndex = 'auto'
        })
        
        // Create LatLng object to ensure proper coordinate format
        const position = new google.maps.LatLng(lat, lng)
        
        // Test with standard marker first to verify basic functionality
        const marker = new google.maps.Marker({
          map: map.value,
          position: position,
          title: `${catch_.species} - ${catch_.weight}lb`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getSpeciesColor(catch_.species),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        console.log(`Standard marker created for catch ${catch_.id} at position:`, position.toString())

        // Add click listener
        marker.addListener('click', () => {
          emit('markerClick', catch_)
        })

        // Store catch data with marker for filtering
        marker.catchData = catch_

        console.log(`Marker successfully created for catch ${catch_.id}, map attached:`, !!marker.map)
        console.log(`Marker position:`, marker.position)
        console.log(`Total markers in array:`, markers.value.length + 1)

        return marker
      } catch (error) {
        console.error(`Error creating marker for catch ${catch_.id}:`, error)
        console.error('Catch data:', catch_)
        return null
      }
    }

    const filterMarkers = () => {
      markers.value.forEach(marker => {
        const shouldShow = activeFilters.value.includes(marker.catchData.species)
        marker.map = shouldShow ? map.value : null
      })
    }

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        loading.value = true
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            map.value.setCenter(pos)
            map.value.setZoom(12)
            loading.value = false
          },
          () => {
            error.value = 'Error: The Geolocation service failed.'
            loading.value = false
          }
        )
      } else {
        error.value = 'Error: Your browser doesn\'t support geolocation.'
      }
    }

    // Watch for changes in catches prop
    watch(() => props.catches, (newCatches) => {
      console.log('GoogleMap: catches prop updated', newCatches)
      if (map.value) {
        loadMarkers()
      }
    }, { deep: true })

    onMounted(() => {
      nextTick(() => {
        initializeMap()
      })
    })

    onUnmounted(() => {
      // Cleanup markers
      markers.value.forEach(marker => {
        marker.map = null
      })
    })

    return {
      mapContainer,
      loading,
      error,
      showFilters,
      activeFilters,
      fishSpecies,
      initializeMap,
      getCurrentLocation,
      getSpeciesColor,
      filterMarkers
    }
  }
}
</script>

<style scoped>
.custom-marker {
  cursor: pointer;
}

.marker-pin:hover {
  transform: scale(1.1);
}
</style>