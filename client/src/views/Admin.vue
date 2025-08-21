<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage users, subscriptions, and system stats</p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link 
              to="/dashboard" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Back to Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.users?.total_users || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Catches</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.catches?.total_catches || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-2M7 11l2 2 4-4"/>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pro Subscribers</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.subscriptions?.pro || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Master Subscribers</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.subscriptions?.master || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- User Management -->
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">User Management</h2>
            <div class="flex gap-3">
              <input
                v-model="userSearch"
                @input="searchUsers"
                type="text"
                placeholder="Search users..."
                class="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
              <button
                @click="loadUsers"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catches</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ getUserInitials(user) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.first_name || user.display_name || user.username || 'No Name' }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getSubscriptionBadgeClass(user.subscription_plan)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.subscription_plan }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.catches_count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(user.account_status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.account_status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      @click="changeUserRole(user)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Change Role
                    </button>
                    <button
                      @click="changeUserStatus(user)"
                      class="text-yellow-600 hover:text-yellow-900"
                    >
                      Change Status
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination" class="px-6 py-4 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-700">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
              {{ pagination.total }} users
            </span>
            <div class="flex gap-2">
              <button
                @click="loadUsers(pagination.page - 1)"
                :disabled="!pagination.hasPrev"
                class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="loadUsers(pagination.page + 1)"
                :disabled="!pagination.hasNext"
                class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/services/api'

export default {
  name: 'Admin',
  setup() {
    const stats = ref(null)
    const users = ref([])
    const pagination = ref(null)
    const loading = ref(false)
    const userSearch = ref('')
    const searchTimeout = ref(null)

    const loadStats = async () => {
      try {
        const response = await adminApi.getStats()
        stats.value = response.data
      } catch (error) {
        console.error('Error loading admin stats:', error)
        alert('Failed to load admin statistics')
      }
    }

    const loadUsers = async (page = 1) => {
      try {
        loading.value = true
        const params = { page, limit: 20 }
        if (userSearch.value) {
          params.search = userSearch.value
        }
        
        const response = await adminApi.getUsers(params)
        users.value = response.data.users
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Error loading users:', error)
        alert('Failed to load users')
      } finally {
        loading.value = false
      }
    }

    const searchUsers = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        loadUsers(1)
      }, 300)
    }

    const getUserInitials = (user) => {
      if (user.first_name && user.last_name) {
        return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      }
      if (user.display_name) {
        return user.display_name.substring(0, 2).toUpperCase()
      }
      if (user.username) {
        return user.username.substring(0, 2).toUpperCase()
      }
      return user.email.substring(0, 2).toUpperCase()
    }

    const getRoleBadgeClass = (role) => {
      switch (role) {
        case 'admin':
          return 'bg-red-100 text-red-800'
        case 'angler':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getSubscriptionBadgeClass = (plan) => {
      switch (plan) {
        case 'master':
          return 'bg-yellow-100 text-yellow-800'
        case 'pro':
          return 'bg-purple-100 text-purple-800'
        case 'free':
          return 'bg-gray-100 text-gray-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800'
        case 'suspended':
          return 'bg-yellow-100 text-yellow-800'
        case 'deactivated':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const changeUserRole = async (user) => {
      const newRole = user.role === 'admin' ? 'angler' : 'admin'
      
      if (!confirm(`Change ${user.email} role to ${newRole}?`)) {
        return
      }

      try {
        await adminApi.updateUserRole(user.id, newRole)
        
        // Update local state
        const userIndex = users.value.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          users.value[userIndex].role = newRole
        }
        
        alert(`User role changed to ${newRole}`)
      } catch (error) {
        console.error('Error changing user role:', error)
        alert('Failed to change user role')
      }
    }

    const changeUserStatus = async (user) => {
      const statusOptions = ['active', 'suspended', 'deactivated']
      const currentIndex = statusOptions.indexOf(user.account_status)
      const newStatus = statusOptions[(currentIndex + 1) % statusOptions.length]
      
      if (!confirm(`Change ${user.email} status to ${newStatus}?`)) {
        return
      }

      try {
        await adminApi.updateUserStatus(user.id, newStatus)
        
        // Update local state
        const userIndex = users.value.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          users.value[userIndex].account_status = newStatus
        }
        
        alert(`User status changed to ${newStatus}`)
      } catch (error) {
        console.error('Error changing user status:', error)
        alert('Failed to change user status')
      }
    }

    onMounted(() => {
      loadStats()
      loadUsers()
    })

    return {
      stats,
      users,
      pagination,
      loading,
      userSearch,
      loadStats,
      loadUsers,
      searchUsers,
      getUserInitials,
      getRoleBadgeClass,
      getSubscriptionBadgeClass,
      getStatusBadgeClass,
      changeUserRole,
      changeUserStatus
    }
  }
}
</script>