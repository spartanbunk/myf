import axios from 'axios'

// Create axios instance  
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            '/api/auth/refresh',
            { refreshToken: refreshToken }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API methods
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me')
}

export const catchesApi = {
  getAll: (params) => api.get('/catches', { params }),
  getById: (id) => api.get(`/catches/${id}`),
  create: (catchData) => {
    // If catchData is FormData, set proper headers for multipart upload
    if (catchData instanceof FormData) {
      return api.post('/catches', catchData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return api.post('/catches', catchData)
  },
  update: (id, catchData) => {
    // If catchData is FormData, set proper headers for multipart upload
    if (catchData instanceof FormData) {
      return api.put(`/catches/${id}`, catchData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return api.put(`/catches/${id}`, catchData)
  },
  delete: (id) => api.delete(`/catches/${id}`),
  getStats: () => api.get('/catches/stats/summary')
}

export const weatherApi = {
  getCurrent: (lat, lng) => api.get('/weather/current', { params: { lat, lon: lng } }),
  getForecast: (lat, lng, days = 5) => api.get('/weather/forecast', { params: { lat, lon: lng, days } }),
  getMarine: (lat, lng) => api.get('/weather/marine', { params: { lat, lon: lng } }),
  getAlerts: (lat, lng) => api.get('/weather/alerts', { params: { lat, lon: lng } }),
  getHistory: (lat, lng, date) => api.get('/weather/history', { params: { lat, lon: lng, date } })
}

export const uploadApi = {
  uploadCatchPhotos: (formData) => api.post('/upload/catch-photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadProfilePicture: (formData) => api.post('/upload/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPresignedUrl: (filename, contentType) => api.post('/upload/presigned-url', {
    filename,
    content_type: contentType
  }),
  getFiles: () => api.get('/upload/files'),
  deleteFile: (id) => api.delete(`/upload/files/${id}`),
  getStats: () => api.get('/upload/stats')
}

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  updateProfilePicture: (url) => api.put('/users/profile-picture', { profile_picture_url: url }),
  deleteAccount: () => api.delete('/users/account'),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getActivity: () => api.get('/users/activity')
}

export const paymentsApi = {
  createCustomer: (customerData) => api.post('/payments/create-customer', customerData),
  createSetupIntent: () => api.post('/payments/create-setup-intent'),
  createSubscription: (planId, paymentMethodId) => api.post('/payments/create-subscription', {
    plan_id: planId,
    payment_method_id: paymentMethodId
  }),
  createPaymentIntent: (amount, description) => api.post('/payments/create-payment-intent', {
    amount,
    description
  }),
  getSubscription: () => api.get('/payments/subscription'),
  cancelSubscription: () => api.post('/payments/cancel-subscription'),
  getPaymentMethods: () => api.get('/payments/payment-methods'),
  removePaymentMethod: (id) => api.delete(`/payments/payment-methods/${id}`),
  getInvoices: () => api.get('/payments/invoices'),
  getPlans: () => api.get('/payments/plans')
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId, account_status) => api.put(`/admin/users/${userId}/status`, { account_status })
}

export default api