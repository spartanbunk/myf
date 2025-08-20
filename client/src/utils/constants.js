// Fish species with color codes for map markers
export const FISH_SPECIES = [
  { id: 1, name: 'Musky', color: '#8B4513', icon: '🐟' },
  { id: 2, name: 'Pike', color: '#228B22', icon: '🐟' },
  { id: 3, name: 'Bass (Smallmouth)', color: '#4B0082', icon: '🐟' },
  { id: 4, name: 'Bass (Largemouth)', color: '#006400', icon: '🐟' },
  { id: 5, name: 'Walleye', color: '#FFD700', icon: '🐟' },
  { id: 6, name: 'Perch', color: '#FFA500', icon: '🐟' },
  { id: 7, name: 'Bluegill', color: '#4169E1', icon: '🐟' },
  { id: 8, name: 'Catfish', color: '#696969', icon: '🐟' },
  { id: 9, name: 'Trout', color: '#FF69B4', icon: '🐟' },
  { id: 10, name: 'Salmon', color: '#FA8072', icon: '🐟' },
  { id: 11, name: 'Other', color: '#800080', icon: '🐟' }
]

// Lure types
export const LURE_TYPES = [
  { id: 1, name: 'Bucktail', category: 'Spinner' },
  { id: 2, name: 'Spoon', category: 'Metal' },
  { id: 3, name: 'Topwater', category: 'Surface' },
  { id: 4, name: 'Crankbait', category: 'Diving' },
  { id: 5, name: 'Spinnerbait', category: 'Spinner' },
  { id: 6, name: 'Jig', category: 'Bottom' },
  { id: 7, name: 'Swimbait', category: 'Soft' },
  { id: 8, name: 'Soft Plastic', category: 'Soft' },
  { id: 9, name: 'Drop Shot', category: 'Finesse' },
  { id: 10, name: 'Rapala', category: 'Minnow' },
  { id: 11, name: 'Rattle Trap', category: 'Lipless' },
  { id: 12, name: 'Live Bait', category: 'Natural' },
  { id: 13, name: 'Other', category: 'Custom' }
]

// Weather conditions
export const WEATHER_CONDITIONS = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Overcast',
  'Light Rain',
  'Heavy Rain',
  'Drizzle',
  'Thunderstorms',
  'Fog',
  'Snow',
  'Windy',
  'Calm'
]

// Wind directions
export const WIND_DIRECTIONS = [
  { value: 'N', label: 'North' },
  { value: 'NE', label: 'Northeast' },
  { value: 'E', label: 'East' },
  { value: 'SE', label: 'Southeast' },
  { value: 'S', label: 'South' },
  { value: 'SW', label: 'Southwest' },
  { value: 'W', label: 'West' },
  { value: 'NW', label: 'Northwest' }
]

// Lunar phases
export const LUNAR_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
]

// Barometric pressure trends
export const PRESSURE_TRENDS = [
  { value: 'rising', label: 'Rising' },
  { value: 'falling', label: 'Falling' },
  { value: 'steady', label: 'Steady' }
]

// Default map center (Green Bay, WI - good fishing area)
export const DEFAULT_MAP_CENTER = {
  lat: 44.0582,
  lng: -87.9073
}

// Map zoom levels
export const MAP_ZOOM_LEVELS = {
  COUNTRY: 4,
  STATE: 6,
  REGION: 8,
  CITY: 10,
  LOCAL: 12,
  DETAILED: 15
}

// Measurement units
export const UNITS = {
  TEMPERATURE: '°F',
  DEPTH: 'ft',
  LENGTH: 'in',
  WEIGHT: 'lbs',
  WIND_SPEED: 'mph',
  PRESSURE: 'inHg'
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  CATCHES: {
    BASE: '/catches',
    STATS: '/catches/stats/summary'
  },
  WEATHER: {
    CURRENT: '/weather/current',
    FORECAST: '/weather/forecast',
    MARINE: '/weather/marine',
    ALERTS: '/weather/alerts',
    HISTORY: '/weather/history'
  },
  UPLOAD: {
    CATCH_PHOTOS: '/upload/catch-photos',
    PROFILE_PICTURE: '/upload/profile-picture',
    PRESIGNED_URL: '/upload/presigned-url',
    FILES: '/upload/files'
  },
  USERS: {
    PROFILE: '/users/profile',
    PASSWORD: '/users/password',
    PREFERENCES: '/users/preferences',
    ACTIVITY: '/users/activity'
  },
  PAYMENTS: {
    CUSTOMER: '/payments/create-customer',
    SUBSCRIPTION: '/payments/subscription',
    PLANS: '/payments/plans',
    PAYMENT_METHODS: '/payments/payment-methods'
  }
}

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    catches_limit: 10,
    features: [
      '10 catches per month',
      'Basic map features',
      'Weather data',
      'Photo upload'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    catches_limit: null,
    features: [
      'Unlimited catches',
      'Advanced analytics',
      'Export data',
      'Priority support',
      'Advanced map features'
    ]
  }
}

// Image upload constraints
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 5
}

// Form validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]+$/
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD: 'Failed to upload file. Please try again.',
  LOCATION: 'Unable to get your location. Please enable location services.',
  MAPS: 'Failed to load map. Please refresh the page.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  CATCH_SAVED: 'Catch logged successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PHOTO_UPLOADED: 'Photo uploaded successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
}

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

export default {
  FISH_SPECIES,
  LURE_TYPES,
  WEATHER_CONDITIONS,
  WIND_DIRECTIONS,
  LUNAR_PHASES,
  PRESSURE_TRENDS,
  DEFAULT_MAP_CENTER,
  MAP_ZOOM_LEVELS,
  UNITS,
  API_ENDPOINTS,
  SUBSCRIPTION_PLANS,
  IMAGE_UPLOAD,
  VALIDATION_PATTERNS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES
}