import { Loader } from '@googlemaps/js-api-loader'
import { getSpeciesColor, formatDate, formatTime } from '@/utils/helpers'

class MapsService {
  constructor() {
    this.loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
      loading: 'async'
    })
    this.map = null
    this.google = null
    this.markers = []
    this.infoWindows = []
  }

  async loadGoogleMaps() {
    if (this.google) return this.google
    
    try {
      this.google = await this.loader.load()
      return this.google
    } catch (error) {
      console.error('Error loading Google Maps:', error)
      throw error
    }
  }

  async initializeMap(mapElement, options = {}) {
    await this.loadGoogleMaps()
    
    const defaultOptions = {
      center: { lat: 44.0582, lng: -87.9073 }, // Green Bay, WI (good fishing area)
      zoom: 8,
      mapTypeId: this.google.maps.MapTypeId.TERRAIN,
      // Temporarily remove mapId to test basic functionality
      styles: [
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#4A90E2' }]
        }
      ]
    }

    this.map = new this.google.maps.Map(mapElement, {
      ...defaultOptions,
      ...options
    })

    return this.map
  }

  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      )
    })
  }

  createAdvancedMarker(position, options = {}) {
    if (!this.google) {
      console.error('Google Maps not loaded')
      return null
    }

    const marker = new this.google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position,
      ...options
    })

    this.markers.push(marker)
    return marker
  }

  createSpeciesMarker(position, species, catchData, onClick) {
    // Use centralized color system from constants.js via helpers.js
    const color = getSpeciesColor(species)
    
    // Create custom marker element
    const markerElement = document.createElement('div')
    markerElement.className = 'custom-marker'
    markerElement.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        🐟
      </div>
    `

    const marker = new this.google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position,
      content: markerElement
    })

    // Add click listener
    marker.addListener('click', () => {
      if (onClick) onClick(catchData)
      this.showCatchInfoWindow(marker, catchData)
    })

    this.markers.push(marker)
    return marker
  }

  showCatchInfoWindow(marker, catchData) {
    // Close any open info windows
    this.closeAllInfoWindows()

    const infoWindow = new this.google.maps.InfoWindow({
      content: this.createInfoWindowContent(catchData)
    })

    infoWindow.open(this.map, marker)
    this.infoWindows.push(infoWindow)
  }

  createInfoWindowContent(catchData) {
    // Format date and time from the datetime field
    let dateDisplay = ''
    let timeDisplay = ''
    
    if (catchData.date) {
      try {
        const dateTime = new Date(catchData.date)
        if (!isNaN(dateTime.getTime())) {
          dateDisplay = formatDate(catchData.date, 'MMM dd, yyyy')
          // Extract time in HH:mm format and format it
          const timeString = dateTime.toTimeString().slice(0, 5)
          timeDisplay = formatTime(timeString, 'h:mm a')
        }
      } catch (error) {
        console.error('Error formatting date/time in info window:', error)
        dateDisplay = 'Invalid date'
      }
    }
    
    // Get photo URL from photo_urls array
    let photoUrl = ''
    if (catchData.photo_urls) {
      try {
        const photoUrls = typeof catchData.photo_urls === 'string' 
          ? JSON.parse(catchData.photo_urls) 
          : catchData.photo_urls
        photoUrl = photoUrls && photoUrls.length > 0 ? photoUrls[0] : ''
      } catch (error) {
        console.error('Error parsing photo URLs in info window:', error)
      }
    }
    
    return `
      <div class="info-window p-3 max-w-xs">
        <h3 class="font-semibold text-lg mb-2">${catchData.species || 'Unknown Species'}</h3>
        <div class="space-y-1 text-sm">
          ${dateDisplay ? `<div><strong>Date:</strong> ${dateDisplay}${timeDisplay ? ` at ${timeDisplay}` : ''}</div>` : ''}
          ${catchData.species ? `<div><strong>Species:</strong> ${catchData.species}</div>` : ''}
          ${catchData.length ? `<div><strong>Length:</strong> ${catchData.length}"</div>` : ''}
          ${catchData.weight ? `<div><strong>Weight:</strong> ${catchData.weight} lbs</div>` : ''}
          ${catchData.location ? `<div><strong>Location:</strong> ${catchData.location}</div>` : ''}
          ${catchData.depth ? `<div><strong>Depth:</strong> ${catchData.depth} ft</div>` : ''}
          ${catchData.lure_type ? `<div><strong>Lure:</strong> ${catchData.lure_type}</div>` : ''}
          ${catchData.water_temperature ? `<div><strong>Water Temp:</strong> ${catchData.water_temperature}°F</div>` : ''}
          ${catchData.weather_conditions ? `<div><strong>Weather:</strong> ${catchData.weather_conditions}</div>` : ''}
        </div>
        ${photoUrl ? `<img src="${photoUrl}" alt="Catch photo" class="w-full h-20 object-cover rounded mt-2">` : ''}
        ${catchData.notes ? `<p class="text-xs text-gray-600 mt-2">${catchData.notes}</p>` : ''}
      </div>
    `
  }

  closeAllInfoWindows() {
    this.infoWindows.forEach(infoWindow => infoWindow.close())
    this.infoWindows = []
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null)
    })
    this.markers = []
  }

  addMapClickListener(callback) {
    if (!this.map) return null

    return this.map.addListener('click', (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      callback({ lat, lng }, event)
    })
  }

  panToLocation(position, zoom = null) {
    if (!this.map) return

    this.map.panTo(position)
    if (zoom) {
      this.map.setZoom(zoom)
    }
  }

  fitBounds(bounds) {
    if (!this.map) return

    this.map.fitBounds(bounds)
  }

  calculateDistance(point1, point2) {
    if (!this.google) return null

    const distance = this.google.maps.geometry.spherical.computeDistanceBetween(
      new this.google.maps.LatLng(point1.lat, point1.lng),
      new this.google.maps.LatLng(point2.lat, point2.lng)
    )

    return distance // in meters
  }

  async geocodeLocation(address) {
    if (!this.google) await this.loadGoogleMaps()

    const geocoder = new this.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  async reverseGeocode(position) {
    if (!this.google) await this.loadGoogleMaps()

    const geocoder = new this.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            components: results[0].address_components
          })
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  }
}

export default new MapsService()