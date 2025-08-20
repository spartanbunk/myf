<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
      <div class="absolute inset-0 bg-black opacity-20"></div>
      <div class="relative container mx-auto px-6 py-24 lg:py-32">
        <div class="text-center">
          <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6">
            Mark Your Fish
          </h1>
          <p class="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            The ultimate fishing companion app. Mark your catches on interactive maps, 
            track weather conditions, and build your fishing legacy.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              @click="$router.push('/login')" 
              class="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Get Started
            </button>
            <button 
              @click="scrollToFeatures"
              class="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 lg:py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Mark Your Fish?
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced features designed by anglers, for anglers. Track every detail of your fishing adventures.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1: Interactive Maps -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Interactive Maps</h3>
            <p class="text-gray-600 text-center">
              Mark your catches directly on Google Maps with precision. Each species gets a unique pin color for easy identification.
            </p>
          </div>

          <!-- Feature 2: Detailed Logging -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Detailed Logging</h3>
            <p class="text-gray-600 text-center">
              Log species, depth, water temperature, lure type, and more. Comprehensive data to improve your fishing success.
            </p>
          </div>

          <!-- Feature 3: Weather Integration -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Weather Tracking</h3>
            <p class="text-gray-600 text-center">
              Automatic weather data capture including wind speed, barometric pressure, and lunar phases for pattern analysis.
            </p>
          </div>

          <!-- Feature 4: Photo Upload -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Photo Gallery</h3>
            <p class="text-gray-600 text-center">
              Upload and organize photos of your catches. Build a visual diary of your fishing adventures.
            </p>
          </div>

          <!-- Feature 5: Advanced Filtering -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Smart Filtering</h3>
            <p class="text-gray-600 text-center">
              Filter your catches by species, date, location, and weather conditions. Find patterns in your data.
            </p>
          </div>

          <!-- Feature 6: Data Analytics -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Analytics Dashboard</h3>
            <p class="text-gray-600 text-center">
              View your fishing statistics, success rates, and trends. Make data-driven decisions for better catches.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-blue-600 py-16">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Start Marking Your Fish?
        </h2>
        <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of anglers who are already using Mark Your Fish to track their catches and improve their success rate.
        </p>
        <button 
          @click="$router.push('/login')"
          class="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
        >
          Sign Up Free Today
        </button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    scrollToFeatures() {
      const featuresSection = document.getElementById('features')
      if (featuresSection) {
        featuresSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>