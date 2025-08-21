import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
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

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

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

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      localStorage.setItem('user', JSON.stringify(newUser))

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

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      const { accessToken, refreshToken: newRefreshToken } = response.data
      token.value = accessToken
      refreshToken.value = newRefreshToken
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

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
      localStorage.setItem('user', JSON.stringify(response.data.user))
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
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Initialize auth state
  async function initializeAuth() {
    loading.value = true
    try {
      if (token.value) {
        console.log('Initializing auth with existing token')
        const success = await fetchUserProfile()
        if (!success) {
          console.log('Profile fetch failed, attempting token refresh')
          // Try to refresh token
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            console.log('Token refreshed successfully, fetching profile again')
            await fetchUserProfile()
          } else {
            console.log('Token refresh failed, clearing auth state')
            // Clear invalid tokens
            token.value = null
            refreshToken.value = null
            user.value = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
          }
        }
      } else {
        console.log('No token found, user not authenticated')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Clear potentially corrupted auth state
      token.value = null
      refreshToken.value = null
      user.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    } finally {
      loading.value = false
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