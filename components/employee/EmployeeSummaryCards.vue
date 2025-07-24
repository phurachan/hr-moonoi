<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Employees Card -->
    <div class="bg-blue-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-blue-100 uppercase tracking-wide">Total</div>
          <div class="text-sm font-medium text-blue-100">Employees</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : stats.totalEmployees }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Active Employees Card -->
    <div class="bg-green-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-green-100 uppercase tracking-wide">Active</div>
          <div class="text-sm font-medium text-green-100">Employees</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : stats.activeEmployees }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="mt-2 text-xs text-green-100">
        {{ loading ? '...' : ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1) }}% of total
      </div>
    </div>

    <!-- Total Salary Card -->
    <div class="bg-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-purple-100 uppercase tracking-wide">Total</div>
          <div class="text-sm font-medium text-purple-100">Salary</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : formatCurrency(stats.totalSalary) }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
      </div>
      <div class="mt-2 text-xs text-purple-100">
        Monthly payroll cost
      </div>
    </div>

    <!-- Average Salary Card -->
    <div class="bg-orange-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-orange-100 uppercase tracking-wide">Average</div>
          <div class="text-sm font-medium text-orange-100">Salary</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : formatCurrency(stats.averageSalary) }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
      </div>
      <div class="mt-2 text-xs text-orange-100">
        Per employee
      </div>
    </div>
  </div>

  <!-- Department Breakdown -->
  <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
      Department Breakdown
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div v-if="loading" class="text-white">Loading departments...</div>
      <div 
        v-else 
        v-for="(count, department) in stats.departmentStats" 
        :key="department"
        class="bg-gray-700 rounded-lg p-4 text-center"
      >
        <div class="text-2xl font-bold text-white">{{ count }}</div>
        <div class="text-sm text-gray-300 capitalize">{{ department }}</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ ((count / stats.totalEmployees) * 100).toFixed(1) }}% of total
        </div>
      </div>
    </div>
  </div>

  <!-- Status Breakdown -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Inactive Employees -->
    <div class="bg-yellow-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-yellow-100 uppercase tracking-wide">Inactive</div>
          <div class="text-sm font-medium text-yellow-100">Employees</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : stats.inactiveEmployees }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
      </div>
      <div class="mt-2 text-xs text-yellow-100">
        {{ loading ? '...' : ((stats.inactiveEmployees / stats.totalEmployees) * 100).toFixed(1) }}% of total
      </div>
    </div>

    <!-- Terminated Employees -->
    <div class="bg-red-600 rounded-lg shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-medium text-red-100 uppercase tracking-wide">Terminated</div>
          <div class="text-sm font-medium text-red-100">Employees</div>
          <div class="text-2xl font-bold text-white">{{ loading ? '...' : stats.terminatedEmployees }}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="mt-2 text-xs text-red-100">
        {{ loading ? '...' : ((stats.terminatedEmployees / stats.totalEmployees) * 100).toFixed(1) }}% of total
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="bg-gray-700 rounded-lg shadow-lg p-6 text-white flex items-center justify-center">
      <button 
        @click="fetchStats" 
        :disabled="loading"
        class="btn btn-primary btn-lg gap-2"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        {{ loading ? 'Loading...' : 'Refresh Data' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  terminatedEmployees: number
  departmentStats: Record<string, number>
  totalSalary: number
  averageSalary: number
}

const authStore = useAuthStore()

const stats = ref<EmployeeStats>({
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  terminatedEmployees: 0,
  departmentStats: {},
  totalSalary: 0,
  averageSalary: 0
})

const loading = ref(false)
const error = ref('')

const fetchStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<EmployeeStats>('/api/employees/stats', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    stats.value = response
  } catch (err) {
    console.error('Error fetching employee stats:', err)
    error.value = 'Failed to load employee statistics'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Auto-load on mount
onMounted(() => {
  fetchStats()
})

// Expose methods for parent components
defineExpose({
  fetchStats,
  refresh: fetchStats
})
</script>