<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">Your Catch Log</h1>
            <p class="text-gray-600 mt-1">{{ totalCatches }} catches recorded</p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link 
              to="/map" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Mark New Catch
            </router-link>
            <router-link 
              to="/dashboard" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="container mx-auto px-6 py-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input 
              v-model="searchTerm"
              type="text"
              placeholder="Search by species, lure, notes..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Species Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <select 
              v-model="filters.species"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Species</option>
              <option v-for="species in availableSpecies" :key="species" :value="species">
                {{ species }}
              </option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select 
              v-model="filters.dateRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select 
              v-model="sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dateDesc">Date (Newest First)</option>
              <option value="dateAsc">Date (Oldest First)</option>
              <option value="weightDesc">Weight (Heaviest First)</option>
              <option value="weightAsc">Weight (Lightest First)</option>
              <option value="lengthDesc">Length (Longest First)</option>
              <option value="lengthAsc">Length (Shortest First)</option>
              <option value="species">Species (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4 flex justify-between items-center">
          <button 
            @click="clearFilters"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear All Filters
          </button>
          <div class="text-sm text-gray-600">
            Showing {{ filteredCatches.length }} of {{ totalCatches }} catches
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button 
            @click="viewMode = 'grid'"
            :class="[
              'px-4 py-2 text-sm font-medium transition duration-300',
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            Grid
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="[
              'px-4 py-2 text-sm font-medium transition duration-300',
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            List
          </button>
        </div>

        <!-- Export Button -->
        <button 
          @click="exportCatches"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
        >
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export CSV
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading your catches...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCatches.length === 0 && !loading" class="text-center py-12">
        <svg class="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
        </svg>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">No catches found</h2>
        <p class="text-gray-600 mb-6">
          {{ totalCatches === 0 ? "You haven't recorded any catches yet." : "Try adjusting your filters." }}
        </p>
        <router-link 
          to="/map" 
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Mark Your First Catch
        </router-link>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="catch_ in paginatedCatches" 
          :key="catch_.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-300 cursor-pointer"
          @click="openCatchDetails(catch_)"
        >
          <!-- Photo -->
          <div class="aspect-w-16 aspect-h-12 bg-gray-200">
            <img 
              v-if="getPhotoUrl(catch_)" 
              :src="getPhotoUrl(catch_)" 
              :alt="catch_.species"
              class="w-full h-48 object-cover"
            >
            <div v-else class="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ catch_.species }}</h3>
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: getSpeciesColor(catch_.species) }"
              ></div>
            </div>
            
            <div class="space-y-1 text-sm text-gray-600">
              <div v-if="catch_.weight" class="flex justify-between">
                <span>Weight:</span>
                <span class="font-medium">{{ catch_.weight }} lbs</span>
              </div>
              <div v-if="catch_.length" class="flex justify-between">
                <span>Length:</span>
                <span class="font-medium">{{ catch_.length }} in</span>
              </div>
              <div class="flex justify-between">
                <span>Date:</span>
                <span class="font-medium">{{ formatDate(catch_.date) }}</span>
              </div>
              <div v-if="catch_.lure_type" class="flex justify-between">
                <span>Lure:</span>
                <span class="font-medium">{{ catch_.lure_type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lure</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="catch_ in paginatedCatches" 
                :key="catch_.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="openCatchDetails(catch_)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div 
                      class="w-4 h-4 rounded-full mr-3"
                      :style="{ backgroundColor: getSpeciesColor(catch_.species) }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900">{{ catch_.species }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ catch_.weight ? `${catch_.weight} lbs` : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ catch_.length ? `${catch_.length} in` : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ catch_.lure_type || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(catch_.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCoordinates(catch_.coordinates) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click.stop="editCatch(catch_)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    @click.stop="deleteCatch(catch_)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredCatches.length) }} of {{ filteredCatches.length }} results
        </div>
        <div class="flex space-x-2">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 border rounded-md',
              page === currentPage 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Catch Details Modal -->
    <LogCatchModal
      :isOpen="showCatchModal"
      :mode="modalMode"
      :catchData="selectedCatchData"
      :coordinates="selectedCatchData?.coordinates"
      @close="closeCatchModal"
      @save="handleCatchUpdate"
      @delete="handleCatchDelete"
      @mode-changed="handleModeChanged"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import { formatDate, getSpeciesColor } from '@/utils/helpers'
import LogCatchModal from '@/components/maps/LogCatchModal.vue'

export default {
  name: 'Catches',
  components: {
    LogCatchModal
  },
  setup() {
    const authStore = useAuthStore()
    const catches = ref([])
    const loading = ref(true)
    const searchTerm = ref('')
    const viewMode = ref('grid')
    // Modal state management
    const showCatchModal = ref(false)
    const modalMode = ref('view')
    const selectedCatchData = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(12)

    const filters = ref({
      species: '',
      dateRange: ''
    })

    const sortBy = ref('dateDesc')

    // Using imported utilities from helpers.js

    const totalCatches = computed(() => catches.value.length)

    const availableSpecies = computed(() => {
      const species = [...new Set(catches.value.map(c => c.species))]
      return species.sort()
    })

    const filteredCatches = computed(() => {
      let filtered = [...catches.value]

      // Search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(c => 
          c.species.toLowerCase().includes(term) ||
          c.lure_type?.toLowerCase().includes(term) ||
          c.notes?.toLowerCase().includes(term)
        )
      }

      // Species filter
      if (filters.value.species) {
        filtered = filtered.filter(c => c.species === filters.value.species)
      }

      // Date range filter
      if (filters.value.dateRange) {
        const now = new Date()
        const filterDate = new Date()
        
        switch (filters.value.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0)
            filtered = filtered.filter(c => new Date(c.date) >= filterDate)
            break
          case 'week':
            filterDate.setDate(now.getDate() - 7)
            filtered = filtered.filter(c => new Date(c.date) >= filterDate)
            break
          case 'month':
            filterDate.setMonth(now.getMonth() - 1)
            filtered = filtered.filter(c => new Date(c.date) >= filterDate)
            break
          case 'year':
            filterDate.setFullYear(now.getFullYear() - 1)
            filtered = filtered.filter(c => new Date(c.date) >= filterDate)
            break
        }
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'dateDesc':
            return new Date(b.date) - new Date(a.date)
          case 'dateAsc':
            return new Date(a.date) - new Date(b.date)
          case 'weightDesc':
            return (b.weight || 0) - (a.weight || 0)
          case 'weightAsc':
            return (a.weight || 0) - (b.weight || 0)
          case 'lengthDesc':
            return (b.length || 0) - (a.length || 0)
          case 'lengthAsc':
            return (a.length || 0) - (b.length || 0)
          case 'species':
            return a.species.localeCompare(b.species)
          default:
            return 0
        }
      })

      return filtered
    })

    const totalPages = computed(() => Math.ceil(filteredCatches.value.length / pageSize.value))

    const paginatedCatches = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredCatches.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const half = Math.floor(maxVisible / 2)
      
      let start = Math.max(1, currentPage.value - half)
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // Using imported formatDate and getSpeciesColor from helpers.js

    const formatCoordinates = (coordinates) => {
      if (!coordinates) return '-'
      return `${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)}`
    }

    const loadCatches = async () => {
      try {
        loading.value = true
        const response = await fetch('/api/catches', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          catches.value = data.catches || []
        }
      } catch (error) {
        console.error('Error loading catches:', error)
      } finally {
        loading.value = false
      }
    }

    const clearFilters = () => {
      searchTerm.value = ''
      filters.value.species = ''
      filters.value.dateRange = ''
      sortBy.value = 'dateDesc'
      currentPage.value = 1
    }

    const openCatchDetails = (catch_) => {
      selectedCatchData.value = {
        ...catch_,
        coordinates: {
          lat: parseFloat(catch_.latitude),
          lng: parseFloat(catch_.longitude)
        }
      }
      modalMode.value = 'view'
      showCatchModal.value = true
    }

    const closeCatchModal = () => {
      showCatchModal.value = false
      selectedCatchData.value = null
      modalMode.value = 'view'
    }

    const handleCatchUpdate = async (updatedCatchData) => {
      try {
        // Update the catch data locally
        const index = catches.value.findIndex(c => c.id === updatedCatchData.id)
        if (index !== -1) {
          catches.value[index] = { ...catches.value[index], ...updatedCatchData }
        }
        
        closeCatchModal()
      } catch (error) {
        console.error('Error updating catch:', error)
      }
    }

    const handleCatchDelete = async (catchId) => {
      try {
        // Remove from local data
        catches.value = catches.value.filter(c => c.id !== catchId)
        
        closeCatchModal()
      } catch (error) {
        console.error('Error deleting catch:', error)
      }
    }

    const handleModeChanged = (newMode) => {
      modalMode.value = newMode
    }

    const editCatch = (catch_) => {
      selectedCatchData.value = {
        ...catch_,
        coordinates: {
          lat: parseFloat(catch_.latitude),
          lng: parseFloat(catch_.longitude)
        }
      }
      modalMode.value = 'edit'
      showCatchModal.value = true
    }

    const deleteCatch = async (catch_) => {
      if (!confirm('Are you sure you want to delete this catch?')) {
        return
      }

      try {
        const response = await fetch(`/api/catches/${catch_.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          catches.value = catches.value.filter(c => c.id !== catch_.id)
        }
      } catch (error) {
        console.error('Error deleting catch:', error)
      }
    }

    const exportCatches = () => {
      // TODO: Implement CSV export
      console.log('Export catches to CSV')
    }

    // Get photo URL from photo_urls array
    const getPhotoUrl = (catch_) => {
      if (!catch_.photo_urls) return null
      try {
        const photoUrls = typeof catch_.photo_urls === 'string' 
          ? JSON.parse(catch_.photo_urls) 
          : catch_.photo_urls
        return photoUrls && photoUrls.length > 0 ? photoUrls[0] : null
      } catch (error) {
        console.error('Error parsing photo URLs:', error)
        return null
      }
    }

    // Reset pagination when filters change
    watch([searchTerm, filters, sortBy], () => {
      currentPage.value = 1
    }, { deep: true })

    onMounted(() => {
      loadCatches()
    })

    return {
      catches,
      loading,
      searchTerm,
      viewMode,
      showCatchModal,
      modalMode,
      selectedCatchData,
      currentPage,
      pageSize,
      filters,
      sortBy,
      totalCatches,
      availableSpecies,
      filteredCatches,
      totalPages,
      paginatedCatches,
      visiblePages,
      getSpeciesColor,
      formatDate,
      formatCoordinates,
      getPhotoUrl,
      clearFilters,
      openCatchDetails,
      closeCatchModal,
      handleCatchUpdate,
      handleCatchDelete,
      handleModeChanged,
      editCatch,
      deleteCatch,
      exportCatches
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>