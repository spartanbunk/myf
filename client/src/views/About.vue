<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div class="container mx-auto px-6 py-16">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">About Mark Your Fish</h1>
          <p class="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Revolutionizing the way anglers track, analyze, and improve their fishing success
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-16">
      <!-- Mission Statement -->
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
        <p class="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          We believe that fishing is more than just a hobby - it's a passion that connects us with nature, 
          creates lasting memories, and teaches us patience and persistence. Mark Your Fish was created to 
          help anglers of all levels track their catches, understand patterns in their fishing success, 
          and ultimately become better fishermen through data-driven insights.
        </p>
      </div>

      <!-- The Story -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Our Story</h3>
          <div class="space-y-4 text-gray-600">
            <p>
              Mark Your Fish was born from the frustration of forgetting the details of great fishing trips. 
              How many times have you caught an amazing fish, only to forget exactly where, when, or what 
              conditions led to that success?
            </p>
            <p>
              Our founder, an avid angler with over 20 years of experience, realized that the most successful 
              fishermen keep detailed logs of their catches. However, traditional paper logbooks were cumbersome 
              and didn't provide the analytical insights needed to identify patterns.
            </p>
            <p>
              By combining modern technology with traditional fishing wisdom, we created an app that not only 
              records your catches but helps you understand what makes you successful on the water.
            </p>
          </div>
        </div>
        <div class="bg-blue-50 rounded-lg p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Why It Matters</h3>
          <ul class="space-y-4 text-gray-600">
            <li class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              <span>Preserve memories of your best fishing moments</span>
            </li>
            <li class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Identify patterns in weather, time, and location for better success</span>
            </li>
            <li class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Never forget that perfect fishing spot again</span>
            </li>
            <li class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span>Share your success with the fishing community</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Features Deep Dive -->
      <div class="mb-16">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 text-center mb-12">What Makes Us Different</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Advanced Mapping -->
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Advanced Google Maps Integration</h3>
            <p class="text-gray-600">
              Use Google's latest Advanced Marker technology to pinpoint exact catch locations with precision. 
              Each species gets its own color-coded marker for easy identification.
            </p>
          </div>

          <!-- Comprehensive Data -->
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Comprehensive Data Capture</h3>
            <p class="text-gray-600">
              Record everything from basic catch details to environmental conditions including weather, 
              lunar phases, barometric pressure, and water temperature for complete fishing intelligence.
            </p>
          </div>

          <!-- Smart Analytics -->
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Smart Analytics</h3>
            <p class="text-gray-600">
              Advanced filtering and sorting capabilities help you identify patterns in your catches. 
              Discover your most productive times, locations, and conditions.
            </p>
          </div>
        </div>
      </div>

      <!-- Technology Stack -->
      <div class="bg-gray-100 rounded-lg p-8 mb-16">
        <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">Built with Modern Technology</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600 mb-2">Vue.js</div>
            <p class="text-sm text-gray-600">Frontend Framework</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600 mb-2">Node.js</div>
            <p class="text-sm text-gray-600">Backend Server</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-800 mb-2">PostgreSQL</div>
            <p class="text-sm text-gray-600">Database</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600 mb-2">Redis</div>
            <p class="text-sm text-gray-600">Caching</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-600 mb-2">Firebase</div>
            <p class="text-sm text-gray-600">Authentication</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600 mb-2">Docker</div>
            <p class="text-sm text-gray-600">Containerization</p>
          </div>
        </div>
      </div>

      <!-- Community -->
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Join the Community</h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Mark Your Fish is more than just an app - it's a community of passionate anglers sharing knowledge, 
          tips, and celebrating each other's success. Join thousands of fishermen who are already using 
          data to improve their fishing game.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/login" 
            class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Get Started Today
          </router-link>
          <router-link 
            to="/contact" 
            class="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Contact Us
          </router-link>
        </div>
      </div>

      <!-- Values -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Passion for Fishing</h3>
          <p class="text-gray-600">
            We're built by anglers, for anglers. Every feature is designed with the fishing experience in mind.
          </p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Innovation</h3>
          <p class="text-gray-600">
            We continuously innovate to bring you the latest technology for tracking and analyzing your fishing success.
          </p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Community</h3>
          <p class="text-gray-600">
            We believe in the power of community. Together, we can all become better anglers.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>