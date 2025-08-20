<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div class="container mx-auto px-6 py-16">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">Contact Us</h1>
          <p class="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you!
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
          
          <!-- Success Message -->
          <div v-if="showSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <p class="text-green-700">Thank you for your message! We'll get back to you within 24 hours.</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p class="text-red-700">{{ errorMessage }}</p>
            </div>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name and Email Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input 
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input 
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                >
              </div>
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select 
                v-model="form.subject"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership/Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea 
                v-model="form.message"
                required
                rows="6"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <!-- Priority Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" v-model="form.priority" value="low" class="mr-2">
                  <span class="text-sm text-gray-700">Low</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" v-model="form.priority" value="medium" class="mr-2">
                  <span class="text-sm text-gray-700">Medium</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" v-model="form.priority" value="high" class="mr-2">
                  <span class="text-sm text-gray-700">High</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" v-model="form.priority" value="urgent" class="mr-2">
                  <span class="text-sm text-gray-700">Urgent</span>
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">Sending Message...</span>
              <span v-else>Send Message</span>
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Details -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">Email Support</h3>
                  <p class="text-gray-600">support@markyourfish.com</p>
                  <p class="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">Support Hours</h3>
                  <p class="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM CST</p>
                  <p class="text-gray-600">Weekend: 10:00 AM - 4:00 PM CST</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">Location</h3>
                  <p class="text-gray-600">Minneapolis, Minnesota</p>
                  <p class="text-sm text-gray-500 mt-1">Land of 10,000 Lakes</p>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Quick Links -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Quick Help</h2>
            <div class="space-y-4">
              <div class="border-l-4 border-blue-600 pl-4">
                <h3 class="font-semibold text-gray-800">Getting Started</h3>
                <p class="text-sm text-gray-600">New to Mark Your Fish? Check out our quick start guide.</p>
              </div>
              <div class="border-l-4 border-green-600 pl-4">
                <h3 class="font-semibold text-gray-800">Technical Issues</h3>
                <p class="text-sm text-gray-600">Having trouble with the app? Visit our troubleshooting section.</p>
              </div>
              <div class="border-l-4 border-yellow-600 pl-4">
                <h3 class="font-semibold text-gray-800">Feature Requests</h3>
                <p class="text-sm text-gray-600">Got an idea for a new feature? We'd love to hear it!</p>
              </div>
              <div class="border-l-4 border-purple-600 pl-4">
                <h3 class="font-semibold text-gray-800">Account Help</h3>
                <p class="text-sm text-gray-600">Issues with your account? We can help you get back on track.</p>
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Follow Us</h2>
            <div class="flex space-x-4">
              <a href="#" class="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="w-12 h-12 bg-blue-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-900 transition duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="w-12 h-12 bg-pink-600 text-white rounded-lg flex items-center justify-center hover:bg-pink-700 transition duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.75.099.120.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.160-1.507-.7-2.448-2.78-2.448-4.958 0-3.778 2.745-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.014C24.007 5.36 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" class="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <p class="text-sm text-gray-600 mt-4">
              Follow us for fishing tips, app updates, and community highlights!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Contact',
  setup() {
    const isSubmitting = ref(false)
    const showSuccess = ref(false)
    const errorMessage = ref('')

    const form = ref({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    })

    const resetForm = () => {
      form.value = {
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      }
    }

    const submitForm = async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true
        errorMessage.value = ''

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form.value)
        })

        if (response.ok) {
          showSuccess.value = true
          resetForm()
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            showSuccess.value = false
          }, 5000)
        } else {
          const error = await response.json()
          errorMessage.value = error.message || 'Failed to send message. Please try again.'
        }
      } catch (error) {
        console.error('Contact form error:', error)
        errorMessage.value = 'Network error. Please check your connection and try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      form,
      isSubmitting,
      showSuccess,
      errorMessage,
      submitForm
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>