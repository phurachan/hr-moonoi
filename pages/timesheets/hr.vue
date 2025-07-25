<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">HR Timesheet Management</h1>
        <p class="text-gray-300 mt-2">Review and manage all employee timesheets</p>
      </div>
      <div class="flex gap-4">
        <NuxtLink to="/timesheets" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Calendar
        </NuxtLink>
      </div>
    </div>

    <!-- HR Timesheet Statistics -->
    <TimesheetsTimesheetStats class="mb-8" />

    <!-- Date Navigation -->
    <div class="bg-gray-800 rounded-lg shadow p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">Date Navigation</h3>
        <div class="flex gap-2">
          <button @click="goToToday" class="btn btn-outline btn-sm">Today</button>
          <button @click="viewMode = 'day'" class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'day', 'btn-outline': viewMode !== 'day' }">Day</button>
          <button @click="viewMode = 'week'" class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'week', 'btn-outline': viewMode !== 'week' }">Week</button>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <button @click="navigateDate(-1)" class="btn btn-ghost btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span class="text-lg font-semibold text-white">{{ currentDateText }}</span>
          <button @click="navigateDate(1)" class="btn btn-ghost btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        
        <BaseInputDate
          v-model="selectedDate"
          placeholder="Select date"
          size="sm"
          @update:model-value="loadTimesheetData"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800 rounded-lg shadow p-6 mb-8">
      <h3 class="text-lg font-semibold mb-4 text-white">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Employee</span>
          </label>
          <select 
            v-model="filters.employeeId"
            class="select select-bordered"
            @change="loadTimesheetData"
          >
            <option value="">All Employees</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.name }}
            </option>
          </select>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Status</span>
          </label>
          <select 
            v-model="filters.status"
            class="select select-bordered"
            @change="loadTimesheetData"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Category</span>
          </label>
          <select 
            v-model="filters.category"
            class="select select-bordered"
            @change="loadTimesheetData"
          >
            <option value="">All Categories</option>
            <option value="development">Development</option>
            <option value="meeting">Meeting</option>
            <option value="training">Training</option>
            <option value="support">Support</option>
            <option value="admin">Administrative</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Project</span>
          </label>
          <input 
            v-model="filters.project"
            type="text" 
            class="input input-bordered"
            placeholder="Filter by project"
            @input="loadTimesheetData"
          />
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stat bg-gray-800 shadow rounded-lg">
        <div class="stat-figure text-primary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="stat-title text-gray-300">Active Employees</div>
        <div class="stat-value text-primary">{{ activeEmployeesCount }}</div>
        <div class="stat-desc text-gray-400">With timesheets today</div>
      </div>
      
      <div class="stat bg-gray-800 shadow rounded-lg">
        <div class="stat-figure text-info">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="stat-title text-gray-300">Total Hours</div>
        <div class="stat-value text-info">{{ totalHours.toFixed(1) }}h</div>
        <div class="stat-desc text-gray-400">{{ currentDateText }}</div>
      </div>
      
      <div class="stat bg-gray-800 shadow rounded-lg">
        <div class="stat-figure text-warning">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <div class="stat-title text-gray-300">Pending Approvals</div>
        <div class="stat-value text-warning">{{ pendingApprovalsCount }}</div>
        <div class="stat-desc text-gray-400">Awaiting review</div>
      </div>
      
      <div class="stat bg-gray-800 shadow rounded-lg">
        <div class="stat-figure text-success">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="stat-title text-gray-300">Approved</div>
        <div class="stat-value text-success">{{ approvedCount }}</div>
        <div class="stat-desc text-gray-400">Timesheets approved</div>
      </div>
    </div>

    <!-- Employee Timesheets -->
    <div class="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-600">
        <h3 class="text-lg font-semibold text-white">Employee Timesheets - {{ currentDateText }}</h3>
      </div>
      
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-8 text-center">
          <div class="loading loading-spinner loading-lg"></div>
          <p class="text-gray-400 mt-4">Loading timesheets...</p>
        </div>
        
        <div v-else-if="filteredTimesheets.length === 0" class="p-8 text-center text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <p class="text-lg">No timesheets found</p>
          <p class="text-sm">Try adjusting your filters or selected date</p>
        </div>
        
        <div v-else class="space-y-4 p-6">
          <div 
            v-for="timesheet in filteredTimesheets" 
            :key="timesheet.id"
            class="bg-gray-700 rounded-lg p-6 border border-gray-600"
          >
            <!-- Employee Header -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-full w-10">
                    <span class="text-sm">{{ getInitials(timesheet.employeeName) }}</span>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold text-white">{{ timesheet.employeeName }}</h4>
                  <p class="text-sm text-gray-400">{{ timesheet.totalHours.toFixed(1) }} hours • {{ timesheet.tasks.length }} tasks</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <div 
                  class="badge"
                  :class="getStatusBadgeClass(timesheet.status)"
                >
                  {{ timesheet.status }}
                </div>
                
                <div class="dropdown dropdown-end">
                  <button tabindex="0" class="btn btn-ghost btn-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-gray-600 rounded-box w-52">
                    <li v-if="timesheet.status === 'submitted'">
                      <a @click="approveTimesheet(timesheet.id)" class="text-green-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Approve
                      </a>
                    </li>
                    <li v-if="timesheet.status === 'submitted'">
                      <a @click="rejectTimesheet(timesheet.id)" class="text-red-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Reject
                      </a>
                    </li>
                    <li>
                      <a @click="viewTimesheetDetails(timesheet)" class="text-blue-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Details
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Tasks List -->
            <div class="space-y-3">
              <div 
                v-for="task in timesheet.tasks" 
                :key="task.id || `${timesheet.id}-${task.title}`"
                class="task-item p-3 rounded border border-gray-600 hover:border-gray-500 transition-colors"
                :class="getTaskCardClass(task.category)"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1 min-w-0">
                    <h5 class="font-medium text-white truncate">{{ task.title }}</h5>
                    <p class="text-sm text-gray-300 mt-1" v-if="task.description">{{ task.description }}</p>
                    <div class="flex items-center gap-4 mt-2">
                      <span class="text-xs text-gray-400">{{ task.startTime }} - {{ task.endTime }}</span>
                      <span v-if="task.project" class="text-xs text-gray-400">{{ task.project }}</span>
                      <span 
                        class="badge badge-xs"
                        :class="getCategoryBadgeClass(task.category)"
                      >
                        {{ task.category }}
                      </span>
                      <span v-if="task.isOT" class="badge badge-xs badge-warning">OT</span>
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <div class="font-semibold text-white">{{ formatDuration(task.duration) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timesheet Details Modal -->
    <div v-if="selectedTimesheet" class="modal modal-open">
      <div class="modal-box w-11/12 max-w-4xl bg-gray-800 text-white">
        <h3 class="font-bold text-lg mb-4">
          {{ selectedTimesheet.employeeName }} - {{ formatDate(selectedTimesheet.date) }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="stat bg-gray-700 rounded-lg">
            <div class="stat-title text-gray-300">Total Hours</div>
            <div class="stat-value text-primary">{{ selectedTimesheet.totalHours.toFixed(1) }}h</div>
          </div>
          <div class="stat bg-gray-700 rounded-lg">
            <div class="stat-title text-gray-300">Total Tasks</div>
            <div class="stat-value text-info">{{ selectedTimesheet.tasks.length }}</div>
          </div>
          <div class="stat bg-gray-700 rounded-lg">
            <div class="stat-title text-gray-300">Status</div>
            <div class="stat-value" :class="getStatusColor(selectedTimesheet.status)">
              {{ selectedTimesheet.status }}
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="task in selectedTimesheet.tasks" 
            :key="task.id || `${selectedTimesheet.id}-${task.title}`"
            class="p-4 rounded border border-gray-600"
            :class="getTaskCardClass(task.category)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-medium text-white">{{ task.title }}</h4>
                <p class="text-sm text-gray-300 mt-1" v-if="task.description">{{ task.description }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="text-sm text-gray-400">{{ task.startTime }} - {{ task.endTime }}</span>
                  <span v-if="task.project" class="text-sm text-gray-400">{{ task.project }}</span>
                  <span 
                    class="badge badge-sm"
                    :class="getCategoryBadgeClass(task.category)"
                  >
                    {{ task.category }}
                  </span>
                  <span v-if="task.isOT" class="badge badge-sm badge-warning">OT</span>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-white">{{ formatDuration(task.duration) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-ghost" @click="selectedTimesheet = null">Close</button>
          <button 
            v-if="selectedTimesheet.status === 'submitted'"
            class="btn btn-error"
            @click="rejectTimesheet(selectedTimesheet.id)"
          >
            Reject
          </button>
          <button 
            v-if="selectedTimesheet.status === 'submitted'"
            class="btn btn-success"
            @click="approveTimesheet(selectedTimesheet.id)"
          >
            Approve
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="selectedTimesheet = null"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimesheetsStore } from '~/stores/timesheets'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

// Check authentication

const timesheetsStore = useTimesheetsStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()
const { getCurrentDate, formatDate } = useSSRSafeDate()

// Check authentication
if (!authStore.isAuthenticated) {
  await navigateTo('/login')
}

const { timesheets, loading, error } = storeToRefs(timesheetsStore)
const { employees } = storeToRefs(employeesStore)
const { user } = storeToRefs(authStore)

// Reactive data
const selectedDate = ref('')
const viewMode = ref('day')
const selectedTimesheet = ref(null)

// Date will be initialized in the main onMounted hook

const filters = reactive({
  employeeId: '',
  status: '',
  category: '',
  project: ''
})

// Computed properties
const currentDateText = computed(() => {
  if (viewMode.value === 'day') {
    return new Date(selectedDate.value).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } else {
    const date = new Date(selectedDate.value)
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startOfWeek.getFullYear()}`
  }
})

const filteredTimesheets = computed(() => {
  let filtered = timesheets.value

  if (filters.employeeId) {
    filtered = filtered.filter(t => t.employeeId === filters.employeeId)
  }

  if (filters.status) {
    filtered = filtered.filter(t => t.status === filters.status)
  }

  if (filters.category) {
    filtered = filtered.filter(t => 
      t.tasks.some(task => task.category === filters.category)
    )
  }

  if (filters.project) {
    filtered = filtered.filter(t => 
      t.tasks.some(task => task.project?.toLowerCase().includes(filters.project.toLowerCase()))
    )
  }

  return filtered
})

const activeEmployeesCount = computed(() => {
  return new Set(filteredTimesheets.value.map(t => t.employeeId)).size
})

const totalHours = computed(() => {
  return filteredTimesheets.value.reduce((sum, t) => sum + t.totalHours, 0)
})

const pendingApprovalsCount = computed(() => {
  return filteredTimesheets.value.filter(t => t.status === 'submitted').length
})

const approvedCount = computed(() => {
  return filteredTimesheets.value.filter(t => t.status === 'approved').length
})

// Methods
const navigateDate = (direction: number) => {
  const date = new Date(selectedDate.value)
  if (viewMode.value === 'day') {
    date.setDate(date.getDate() + direction)
  } else {
    date.setDate(date.getDate() + (direction * 7))
  }
  selectedDate.value = date.toISOString().split('T')[0]
  loadTimesheetData()
}

const goToToday = () => {
  const today = getCurrentDate()
  if (today) {
    selectedDate.value = today
    loadTimesheetData()
  }
}

const loadTimesheetData = async () => {
  try {
    const startDate = selectedDate.value
    let endDate = selectedDate.value
    
    if (viewMode.value === 'week') {
      const date = new Date(selectedDate.value)
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      endDate = endOfWeek.toISOString().split('T')[0]
    }
    
    await timesheetsStore.fetchTimesheetsByDateRange(startDate, endDate)
  } catch (error) {
    console.error('Error loading timesheet data:', error)
  }
}

const approveTimesheet = async (timesheetId: string) => {
  try {
    await timesheetsStore.approveTimesheet(timesheetId, user.value?.id)
    if (selectedTimesheet.value?.id === timesheetId) {
      selectedTimesheet.value = null
    }
  } catch (error) {
    console.error('Error approving timesheet:', error)
  }
}

const rejectTimesheet = async (timesheetId: string) => {
  try {
    await timesheetsStore.rejectTimesheet(timesheetId, user.value?.id)
    if (selectedTimesheet.value?.id === timesheetId) {
      selectedTimesheet.value = null
    }
  } catch (error) {
    console.error('Error rejecting timesheet:', error)
  }
}

const viewTimesheetDetails = (timesheet: any) => {
  selectedTimesheet.value = timesheet
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// formatDate is now imported from useSSRSafeDate composable

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    draft: 'badge-ghost',
    submitted: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error'
  }
  return classes[status] || classes.draft
}

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'text-gray-400',
    submitted: 'text-warning',
    approved: 'text-success',
    rejected: 'text-error'
  }
  return colors[status] || colors.draft
}

const getTaskCardClass = (category: string) => {
  const classes = {
    development: 'border-l-4 border-l-blue-500 bg-blue-900 bg-opacity-20',
    meeting: 'border-l-4 border-l-purple-500 bg-purple-900 bg-opacity-20',
    training: 'border-l-4 border-l-green-500 bg-green-900 bg-opacity-20',
    support: 'border-l-4 border-l-orange-500 bg-orange-900 bg-opacity-20',
    admin: 'border-l-4 border-l-gray-500 bg-gray-700 bg-opacity-20',
    other: 'border-l-4 border-l-yellow-500 bg-yellow-900 bg-opacity-20'
  }
  return classes[category] || classes.other
}

const getCategoryBadgeClass = (category: string) => {
  const classes = {
    development: 'badge-info',
    meeting: 'badge-primary',
    training: 'badge-success',
    support: 'badge-warning',
    admin: 'badge-neutral',
    other: 'badge-accent'
  }
  return classes[category] || classes.other
}

// Load data on mount
onMounted(async () => {
  // Ensure we have a selected date before loading data
  if (!selectedDate.value) {
    selectedDate.value = getCurrentDate()
  }
  
  await Promise.all([
    employeesStore.fetchEmployees(),
    loadTimesheetData()
  ])
})

// Watch for date changes
watch(selectedDate, () => {
  loadTimesheetData()
})

// Watch for view mode changes
watch(viewMode, () => {
  loadTimesheetData()
})

// Set page title
useHead({
  title: 'HR Timesheet Management - Manager'
})
</script>

<style scoped>
.task-item {
  transition: all 0.2s ease;
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-content {
  z-index: 1000;
}
</style>