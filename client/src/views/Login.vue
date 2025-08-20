<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">Mark Your Fish</h1>
        <p class="text-gray-600">Sign in to your fishing account</p>
      </div>

      <!-- Auth Toggle -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="flex">
          <button 
            @click="isLogin = true"
            :class="[
              'flex-1 py-3 px-4 text-center font-medium transition duration-300',
              isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Sign In
          </button>
          <button 
            @click="isLogin = false"
            :class="[
              'flex-1 py-3 px-4 text-center font-medium transition duration-300',
              !isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Sign Up
          </button>
        </div>

        <div class="p-8">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p class="text-red-700 text-sm">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <p class="text-green-700 text-sm">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Login Form -->
          <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                v-model="loginForm.email"
                type="email"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input 
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                >
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showPassword" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" v-model="loginForm.rememberMe" class="mr-2">
                <span class="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" class="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Signing In...</span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input 
                  v-model="registerForm.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input 
                  v-model="registerForm.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                v-model="registerForm.email"
                type="email"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input 
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Create a password"
                >
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showPassword" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input 
                v-model="registerForm.confirmPassword"
                type="password"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                :class="{ 'border-red-300': passwordMismatch }"
              >
              <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Passwords do not match</p>
            </div>

            <div>
              <label class="flex items-start">
                <input type="checkbox" v-model="registerForm.agreeToTerms" required class="mr-2 mt-1">
                <span class="text-sm text-gray-600">
                  I agree to the 
                  <a href="/terms" class="text-blue-600 hover:text-blue-700" target="_blank">Terms of Service</a> 
                  and 
                  <a href="/privacy" class="text-blue-600 hover:text-blue-700" target="_blank">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button 
              type="submit"
              :disabled="isLoading || passwordMismatch"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <!-- Social Login Options -->
          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div class="mt-6">
              <button 
                @click="signInWithGoogle"
                :disabled="isLoading"
                class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition duration-300 disabled:opacity-50"
              >
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="text-gray-700 font-medium">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <router-link 
          to="/" 
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLogin = ref(true)
    const isLoading = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const loginForm = ref({
      email: '',
      password: '',
      rememberMe: false
    })

    const registerForm = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    })

    const passwordMismatch = computed(() => {
      return registerForm.value.password !== registerForm.value.confirmPassword && 
             registerForm.value.confirmPassword !== ''
    })

    // Clear messages when switching between forms
    watch(isLogin, () => {
      errorMessage.value = ''
      successMessage.value = ''
    })

    const handleLogin = async () => {
      if (isLoading.value) return

      try {
        isLoading.value = true
        errorMessage.value = ''

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: loginForm.value.email,
            password: loginForm.value.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          // Store auth data
          authStore.setAuth(data.accessToken, data.user)
          
          // Redirect to dashboard or intended page
          const redirectTo = router.currentRoute.value.query.redirect || '/dashboard'
          router.push(redirectTo)
        } else {
          errorMessage.value = data.message || 'Login failed. Please try again.'
        }
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = 'Network error. Please check your connection.'
      } finally {
        isLoading.value = false
      }
    }

    const handleRegister = async () => {
      if (isLoading.value || passwordMismatch.value) return

      try {
        isLoading.value = true
        errorMessage.value = ''

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: registerForm.value.firstName,
            lastName: registerForm.value.lastName,
            email: registerForm.value.email,
            password: registerForm.value.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          successMessage.value = 'Account created successfully! Please sign in.'
          isLogin.value = true
          
          // Pre-fill login form
          loginForm.value.email = registerForm.value.email
          
          // Reset register form
          registerForm.value = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false
          }
        } else {
          errorMessage.value = data.message || 'Registration failed. Please try again.'
        }
      } catch (error) {
        console.error('Registration error:', error)
        errorMessage.value = 'Network error. Please check your connection.'
      } finally {
        isLoading.value = false
      }
    }

    const signInWithGoogle = async () => {
      try {
        isLoading.value = true
        errorMessage.value = ''

        // Initialize Firebase Auth and sign in with Google
        // This would integrate with Firebase Auth
        console.log('Google sign in not implemented yet')
        errorMessage.value = 'Google sign-in coming soon!'
      } catch (error) {
        console.error('Google sign-in error:', error)
        errorMessage.value = 'Google sign-in failed. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      isLogin,
      isLoading,
      showPassword,
      errorMessage,
      successMessage,
      loginForm,
      registerForm,
      passwordMismatch,
      handleLogin,
      handleRegister,
      signInWithGoogle
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>