import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userProfile = computed(() => user.value)

  // Actions
  async function login(email, password) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data

      token.value = accessToken
      refreshToken.value = newRefreshToken
      user.value = userData

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', newRefreshToken)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    try {
      const response = await api.post('/auth/register', userData)
      const { accessToken, refreshToken: newRefreshToken, user: newUser } = response.data

      token.value = accessToken
      refreshToken.value = newRefreshToken
      user.value = newUser

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', newRefreshToken)

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken.value
      })
      
      const { accessToken } = response.data
      token.value = accessToken
      localStorage.setItem('access_token', accessToken)

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return false

    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
      return true
    } catch (error) {
      console.error('Fetch user profile error:', error)
      if (error.response?.status === 401) {
        logout()
      }
      return false
    }
  }

  // Set auth data manually
  function setAuth(accessToken, userData) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem('access_token', accessToken)
  }

  // Initialize auth state
  async function initializeAuth() {
    if (token.value) {
      const success = await fetchUserProfile()
      if (!success) {
        // Try to refresh token
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          await fetchUserProfile()
        }
      }
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userProfile,
    login,
    register,
    logout,
    setAuth,
    refreshAccessToken,
    fetchUserProfile,
    initializeAuth
  }
})