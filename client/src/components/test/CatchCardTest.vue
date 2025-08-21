<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-8">CatchCard Component Test</h1>
    
    <!-- Test Data Display -->
    <div class="bg-white p-4 rounded-lg mb-8">
      <h2 class="text-lg font-semibold mb-4">Test Data:</h2>
      <pre class="bg-gray-100 p-2 rounded text-sm">{{ JSON.stringify(testCatch, null, 2) }}</pre>
    </div>

    <!-- Props Test Display -->
    <div class="bg-white p-4 rounded-lg mb-8">
      <h2 class="text-lg font-semibold mb-4">Props Test:</h2>
      <div class="space-y-2">
        <div><strong>showActions:</strong> {{ showActions }}</div>
        <div><strong>actionPosition:</strong> {{ actionPosition }}</div>
        <div><strong>variant:</strong> {{ variant }}</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-white p-4 rounded-lg mb-8">
      <h2 class="text-lg font-semibold mb-4">Controls:</h2>
      <div class="space-y-4">
        <label class="flex items-center">
          <input type="checkbox" v-model="showActions" class="mr-2">
          Show Actions
        </label>
        <div>
          <label class="block text-sm font-medium mb-2">Action Position:</label>
          <select v-model="actionPosition" class="border border-gray-300 rounded px-3 py-1">
            <option value="overlay">Overlay</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Variant:</label>
          <select v-model="variant" class="border border-gray-300 rounded px-3 py-1">
            <option value="list">List</option>
            <option value="compact">Compact</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CatchCard Test Cases -->
    <div class="space-y-8">
      
      <!-- Test Case 1: List variant with actions -->
      <div class="bg-white p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Test Case 1: List Variant with Actions</h3>
        <div class="border border-gray-300 rounded">
          <CatchCard
            :catchData="testCatch"
            variant="list"
            :showActions="showActions"
            :actionPosition="actionPosition"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Test Case 2: Full variant with actions -->
      <div class="bg-white p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Test Case 2: Full Variant with Actions</h3>
        <div class="border border-gray-300 rounded max-w-xs">
          <CatchCard
            :catchData="testCatch"
            variant="full"
            :showActions="showActions"
            :actionPosition="actionPosition"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Test Case 3: Current Dashboard Implementation -->
      <div class="bg-white p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Test Case 3: Dashboard Implementation</h3>
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <CatchCard
            :catchData="testCatch"
            variant="list"
            :showActions="true"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

    </div>

    <!-- Event Log -->
    <div class="bg-white p-4 rounded-lg mt-8">
      <h2 class="text-lg font-semibold mb-4">Event Log:</h2>
      <div class="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
        <div v-for="(event, index) in eventLog" :key="index" class="text-sm">
          {{ event }}
        </div>
        <div v-if="eventLog.length === 0" class="text-gray-500 text-sm">
          No events triggered yet
        </div>
      </div>
      <button @click="clearLog" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
        Clear Log
      </button>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue'
import CatchCard from '@/components/common/CatchCard.vue'

export default {
  name: 'CatchCardTest',
  components: {
    CatchCard
  },
  setup() {
    const showActions = ref(true)
    const actionPosition = ref('bottom')
    const variant = ref('list')
    const eventLog = ref([])

    const testCatch = {
      id: 1,
      species: 'Bass (Largemouth)',
      weight: 3.5,
      length: 18,
      date: '2025-08-21T14:30:00',
      lure_type: 'Spinnerbait',
      depth: 12,
      latitude: 42.421151,
      longitude: -82.721033,
      photo_urls: '[]',
      notes: 'Great catch on a sunny afternoon'
    }

    const logEvent = (eventType, data) => {
      const timestamp = new Date().toLocaleTimeString()
      eventLog.value.unshift(`[${timestamp}] ${eventType}: ${JSON.stringify(data)}`)
      if (eventLog.value.length > 10) {
        eventLog.value = eventLog.value.slice(0, 10)
      }
    }

    const handleView = (catchData) => {
      logEvent('VIEW', { id: catchData.id, species: catchData.species })
      alert(`View button clicked for: ${catchData.species}`)
    }

    const handleEdit = (catchData) => {
      logEvent('EDIT', { id: catchData.id, species: catchData.species })
      alert(`Edit button clicked for: ${catchData.species}`)
    }

    const handleDelete = (catchData) => {
      logEvent('DELETE', { id: catchData.id, species: catchData.species })
      alert(`Delete button clicked for: ${catchData.species}`)
    }

    const clearLog = () => {
      eventLog.value = []
    }

    return {
      showActions,
      actionPosition,
      variant,
      testCatch,
      eventLog,
      handleView,
      handleEdit,
      handleDelete,
      clearLog
    }
  }
}
</script>

<style scoped>
/* Test page specific styles */
</style>