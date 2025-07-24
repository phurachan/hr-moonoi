<template>
  <div class="mb-8">
    <!-- Header with Controls -->
    <div class="bg-gray-800 rounded-lg shadow mb-4">
      <div class="flex justify-between items-center p-4">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Timesheet Summary
        </h2>
        <div class="flex items-center gap-3">
          <select 
            v-model="selectedPeriod" 
            @change="fetchStats"
            class="select select-bordered select-sm bg-gray-700 text-white border-gray-600"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            @click="fetchStats" 
            :disabled="loading"
            class="btn btn-ghost btn-sm text-white"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Total Hours -->
      <div class="bg-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-medium text-blue-100 uppercase tracking-wide">Total</div>
            <div class="text-sm font-medium text-blue-100">Hours Logged</div>
            <div class="text-2xl font-bold text-white">{{ loading ? '...' : summary.totalHours }}h</div>
          </div>
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2 text-xs text-blue-100">
          {{ loading ? '...' : summary.workingDays }} working days
        </div>
      </div>

      <!-- Total Timesheets -->
      <div class="bg-green-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-medium text-green-100 uppercase tracking-wide">Total</div>
            <div class="text-sm font-medium text-green-100">Time Entries</div>
            <div class="text-2xl font-bold text-white">{{ loading ? '...' : summary.totalTimesheets }}</div>
          </div>
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2 text-xs text-green-100">
          {{ loading ? '...' : summary.averageHoursPerDay }}h avg/day
        </div>
      </div>
    </div>


    <!-- Category and Project Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Categories -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          Top Categories
        </h3>
        
        <div class="space-y-3">
          <div v-if="loading" class="text-white">Loading categories...</div>
          <div v-else-if="breakdowns.category.length === 0" class="text-gray-400">No categories found</div>
          <div 
            v-else 
            v-for="category in breakdowns.category.slice(0, 5)" 
            :key="category.name"
            class="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-white capitalize">{{ category.name }}</span>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">{{ category.hours }}h</div>
              <div class="text-xs text-gray-400">
                {{ summary.totalHours > 0 ? ((category.hours / summary.totalHours) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Projects -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          Top Projects
        </h3>
        
        <div class="space-y-3">
          <div v-if="loading" class="text-white">Loading projects...</div>
          <div v-else-if="breakdowns.project.length === 0" class="text-gray-400">No projects assigned</div>
          <div 
            v-else 
            v-for="project in breakdowns.project.slice(0, 5)" 
            :key="project.name"
            class="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-white">{{ project.name }}</span>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">{{ project.hours }}h</div>
              <div class="text-xs text-gray-400">
                {{ summary.totalHours > 0 ? ((project.hours / summary.totalHours) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimesheetSummary {
  totalTimesheets: number
  totalHours: number
  workingDays: number
  averageHoursPerDay: number
}

interface CategoryProject {
  name: string
  hours: number
}

interface Props {
  employeeId?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const authStore = useAuthStore()

const summary = ref<TimesheetSummary>({
  totalTimesheets: 0,
  totalHours: 0,
  workingDays: 0,
  averageHoursPerDay: 0
})

const breakdowns = ref({
  category: [] as CategoryProject[],
  project: [] as CategoryProject[]
})

const loading = ref(false)
const error = ref('')
const selectedPeriod = ref('week')

const fetchStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams()
    params.append('period', selectedPeriod.value)
    
    if (props.employeeId) {
      params.append('employeeId', props.employeeId)
    }
    
    const response = await $fetch(`/api/timesheets/stats?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    summary.value = response.summary
    breakdowns.value = response.breakdowns
  } catch (err) {
    console.error('Error fetching timesheet stats:', err)
    error.value = 'Failed to load timesheet statistics'
  } finally {
    loading.value = false
  }
}


// Auto-load on mount
onMounted(() => {
  if (props.autoLoad) {
    fetchStats()
  }
})

// Watch for employeeId changes
watch(() => props.employeeId, () => {
  if (props.autoLoad) {
    fetchStats()
  }
})

// Expose methods for parent components
defineExpose({
  fetchStats,
  refresh: fetchStats
})
</script>