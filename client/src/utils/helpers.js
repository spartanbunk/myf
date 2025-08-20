import { format, parseISO, isValid } from 'date-fns'
import { FISH_SPECIES, LURE_TYPES } from './constants'

// Date formatting utilities
export function formatDate(date, formatString = 'MMM dd, yyyy') {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return format(dateObj, formatString)
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}

export function formatTime(time, formatString = 'HH:mm') {
  if (!time) return ''
  
  try {
    // Handle time string like "14:30"
    const timeObj = new Date(`2000-01-01T${time}`)
    if (!isValid(timeObj)) return ''
    return format(timeObj, formatString)
  } catch (error) {
    console.error('Time formatting error:', error)
    return ''
  }
}

export function formatDateTime(dateTime, formatString = 'MMM dd, yyyy HH:mm') {
  if (!dateTime) return ''
  
  try {
    const dateObj = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
    if (!isValid(dateObj)) return ''
    return format(dateObj, formatString)
  } catch (error) {
    console.error('DateTime formatting error:', error)
    return ''
  }
}

// Species utilities
export function getSpeciesById(id) {
  return FISH_SPECIES.find(species => species.id === id)
}

export function getSpeciesByName(name) {
  return FISH_SPECIES.find(species => species.name === name)
}

export function getSpeciesColor(speciesName) {
  const species = getSpeciesByName(speciesName)
  return species ? species.color : '#800080' // Default to "Other" color
}

// Lure utilities
export function getLureById(id) {
  return LURE_TYPES.find(lure => lure.id === id)
}

export function getLureByName(name) {
  return LURE_TYPES.find(lure => lure.name === name)
}

// Measurement utilities
export function formatMeasurement(value, unit) {
  if (value === null || value === undefined || value === '') return ''
  return `${value} ${unit}`
}

export function convertFahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9
}

export function convertCelsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32
}

export function convertFeetToMeters(feet) {
  return feet * 0.3048
}

export function convertMetersToFeet(meters) {
  return meters / 0.3048
}

export function convertPoundsToKilograms(pounds) {
  return pounds * 0.453592
}

export function convertKilogramsToPounds(kilograms) {
  return kilograms / 0.453592
}

// Location utilities
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`
  } else {
    return `${Math.round(distanceKm)}km`
  }
}

// Validation utilities
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function validateCatchData(catchData) {
  const errors = {}
  
  if (!catchData.species && !catchData.species_other) {
    errors.species = 'Species is required'
  }
  
  if (!catchData.latitude || !catchData.longitude) {
    errors.location = 'Location is required'
  }
  
  if (!catchData.catch_date) {
    errors.catch_date = 'Catch date is required'
  }
  
  if (catchData.depth && (catchData.depth < 0 || catchData.depth > 1000)) {
    errors.depth = 'Depth must be between 0 and 1000 feet'
  }
  
  if (catchData.length && (catchData.length < 0 || catchData.length > 100)) {
    errors.length = 'Length must be between 0 and 100 inches'
  }
  
  if (catchData.weight && (catchData.weight < 0 || catchData.weight > 1000)) {
    errors.weight = 'Weight must be between 0 and 1000 pounds'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// File utilities
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}

// Array utilities
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = (typeof key === 'function') ? key(item) : item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key]
    const bVal = typeof key === 'function' ? key(b) : b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// String utilities
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + suffix
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// URL utilities
export function buildQueryString(params) {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key])
    }
  })
  
  return searchParams.toString()
}

export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params) {
    result[key] = value
  }
  
  return result
}

// Weather utilities
export function getLunarPhase(date) {
  const phases = [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
  ]
  
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  
  // Simple lunar phase calculation (approximate)
  const c = year / 100
  const epact = (11 * (year % 19) + Math.floor(3 * c / 4) - Math.floor((8 * c + 5) / 25) + 5) % 30
  const daysIntoPhase = (day + epact) % 30
  const phaseIndex = Math.floor(daysIntoPhase / 3.75)
  
  return phases[Math.min(phaseIndex, 7)]
}

// Debounce utility
export function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle utility
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Local storage utilities
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error writing to localStorage:', error)
    return false
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}