<template>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300">
    <input type="checkbox" v-model="isExpanded" />
    <div class="collapse-title text-xl font-medium flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      Timesheet Statistics
      <div v-if="!isExpanded && stats" class="flex items-center gap-4 ml-auto text-sm">
        <span class="badge badge-primary">{{ stats.summary.totalHours }}h total</span>
        <span class="badge badge-secondary">{{ stats.summary.totalTimesheets }} timesheets</span>
        <span class="badge badge-success">{{ stats.summary.approvalRate }}% approved</span>
      </div>
    </div>
    <div class="collapse-content">
      <div class="space-y-6 pt-4">
        <!-- Period Selector -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <select 
              v-model="selectedPeriod" 
              @change="fetchStats"
              class="select select-bordered select-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <div v-if="selectedPeriod === 'custom'" class="flex items-center gap-2">
              <BaseInputDate
                v-model="customStartDate"
                placeholder="Start date"
                size="sm"
                @update:model-value="fetchStats"
              />
              <span class="text-sm">to</span>
              <BaseInputDate
                v-model="customEndDate"
                placeholder="End date"
                size="sm"
                @update:model-value="fetchStats"
              />
            </div>
          </div>
          
          <button 
            @click="fetchStats" 
            :disabled="loading"
            class="btn btn-primary btn-sm"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="loading loading-spinner loading-lg"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Statistics Grid -->
        <div v-else-if="stats" class="space-y-6">
          <!-- Main Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="stat bg-base-100 shadow rounded-lg">
              <div class="stat-figure text-primary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="stat-title">Total Hours</div>
              <div class="stat-value text-primary">{{ stats.summary.totalHours }}h</div>
              <div class="stat-desc">{{ stats.summary.workingDays }} working days</div>
            </div>

            <div class="stat bg-base-100 shadow rounded-lg">
              <div class="stat-figure text-secondary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="stat-title">Timesheets</div>
              <div class="stat-value text-secondary">{{ stats.summary.totalTimesheets }}</div>
              <div class="stat-desc">{{ stats.summary.averageHoursPerDay }}h avg/day</div>
            </div>

            <div class="stat bg-base-100 shadow rounded-lg">
              <div class="stat-figure text-accent">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="stat-title">Billable Hours</div>
              <div class="stat-value text-accent">{{ stats.summary.totalBillableHours }}h</div>
              <div class="stat-desc">{{ stats.summary.billablePercentage }}% billable</div>
            </div>

            <div class="stat bg-base-100 shadow rounded-lg">
              <div class="stat-figure text-success">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="stat-title">Approval Rate</div>
              <div class="stat-value text-success">{{ stats.summary.approvalRate }}%</div>
              <div class="stat-desc">{{ stats.summary.recentActivity }} recent entries</div>
            </div>
          </div>

          <!-- Secondary Stats -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Status Breakdown -->
            <div class="card bg-base-100 shadow">
              <div class="card-body">
                <h3 class="card-title text-sm">Status Breakdown</h3>
                <div class="space-y-2">
                  <div v-for="(count, status) in stats.breakdowns.status" :key="status" class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <div 
                        class="badge badge-sm"
                        :class="getStatusBadgeClass(status)"
                      ></div>
                      <span class="text-sm capitalize">{{ status }}</span>
                    </div>
                    <span class="text-sm font-medium">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Breakdown -->
            <div class="card bg-base-100 shadow">
              <div class="card-body">
                <h3 class="card-title text-sm">Top Categories</h3>
                <div class="space-y-2">
                  <div v-for="category in stats.breakdowns.category.slice(0, 5)" :key="category.name" class="flex justify-between items-center">
                    <span class="text-sm capitalize">{{ category.name }}</span>
                    <span class="text-sm font-medium">{{ category.hours }}h</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Breakdown -->
            <div class="card bg-base-100 shadow">
              <div class="card-body">
                <h3 class="card-title text-sm">Top Projects</h3>
                <div class="space-y-2">
                  <div v-for="project in stats.breakdowns.project.slice(0, 5)" :key="project.name" class="flex justify-between items-center">
                    <span class="text-sm">{{ project.name }}</span>
                    <span class="text-sm font-medium">{{ project.hours }}h</span>
                  </div>
                  <div v-if="stats.breakdowns.project.length === 0" class="text-sm text-base-content/50">
                    No projects assigned
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Employee Breakdown (HR/Admin only) -->
          <div v-if="stats.breakdowns.employee && stats.breakdowns.employee.length > 0" class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="card-title text-sm">Employee Performance</h3>
              <div class="overflow-x-auto">
                <table class="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Total Hours</th>
                      <th>Billable Hours</th>
                      <th>Timesheets</th>
                      <th>Avg Hours/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="employee in stats.breakdowns.employee.slice(0, 10)" :key="employee.name">
                      <td class="font-medium">{{ employee.name }}</td>
                      <td>{{ employee.department }}</td>
                      <td>{{ employee.totalHours }}h</td>
                      <td>{{ employee.billableHours }}h</td>
                      <td>{{ employee.timesheetCount }}</td>
                      <td>{{ (employee.totalHours / stats.summary.workingDays).toFixed(1) }}h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Chart Placeholder -->
          <div v-if="stats.charts.daily.length > 0" class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="card-title text-sm">Daily Hours Trend</h3>
              <div class="h-48 flex items-center justify-center bg-base-200 rounded">
                <div class="text-center">
                  <svg class="w-12 h-12 mx-auto text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <p class="text-sm text-base-content/50 mt-2">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  employeeId?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const authStore = useAuthStore()

const stats = ref(null)
const loading = ref(false)
const error = ref('')
const selectedPeriod = ref('week')
const customStartDate = ref('')
const customEndDate = ref('')
const isExpanded = ref(false)

const fetchStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams()
    params.append('period', selectedPeriod.value)
    
    if (props.employeeId) {
      params.append('employeeId', props.employeeId)
    }
    
    if (selectedPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
      params.append('startDate', customStartDate.value)
      params.append('endDate', customEndDate.value)
    }
    
    const response = await $fetch(`/api/timesheets/stats?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    stats.value = response
  } catch (err) {
    console.error('Error fetching timesheet stats:', err)
    error.value = 'Failed to load timesheet statistics'
  } finally {
    loading.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'badge-success'
    case 'submitted':
      return 'badge-warning'
    case 'rejected':
      return 'badge-error'
    case 'draft':
    default:
      return 'badge-neutral'
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