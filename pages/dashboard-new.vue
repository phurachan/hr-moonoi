<template>
  <NuxtLayout 
    name="permission-based" 
    page-title="Dashboard" 
    page-description="Welcome to your HR management dashboard"
    :required-permissions="['dashboard.access']"
  >
    <!-- Page Actions -->
    <template #actions>
      <button 
        v-if="hasPermission('employees.create')" 
        @click="navigateTo('/employees/create')"
        class="btn btn-primary"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Employee
      </button>
      <button 
        v-if="hasPermission('timesheets.hr_view')" 
        @click="navigateTo('/timesheets/hr')"
        class="btn btn-outline"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        HR Timesheets
      </button>
    </template>

    <!-- Dashboard Content -->
    <div class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Employees -->
        <div v-if="canAccessModule('employees')" class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-primary">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="stat-title">Total Employees</div>
          <div class="stat-value text-primary">{{ stats.totalEmployees }}</div>
          <div class="stat-desc">{{ stats.activeEmployees }} active</div>
        </div>

        <!-- Pending Timesheets -->
        <div v-if="hasPermission('timesheets.hr_view')" class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-warning">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">Pending Timesheets</div>
          <div class="stat-value text-warning">{{ stats.pendingTimesheets }}</div>
          <div class="stat-desc">Awaiting approval</div>
        </div>

        <!-- This Week Hours -->
        <div v-if="canAccessModule('timesheets')" class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-info">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="stat-title">This Week Hours</div>
          <div class="stat-value text-info">{{ stats.weeklyHours }}h</div>
          <div class="stat-desc">{{ stats.weeklyTarget }}h target</div>
        </div>

        <!-- System Status -->
        <div class="stat bg-base-100 shadow rounded-lg">
          <div class="stat-figure text-success">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">System Status</div>
          <div class="stat-value text-success">Online</div>
          <div class="stat-desc">{{ menuStats.accessibleItems }}/{{ menuStats.totalItems }} features</div>
        </div>
      </div>

      <!-- Recent Activities & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activities -->
        <div v-if="hasAnyPermission(['employees.read', 'timesheets.read'])" class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activities
            </h2>
            <div class="space-y-3">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center space-x-3 p-2 rounded hover:bg-base-200">
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-full w-8">
                    <span class="text-xs">{{ getInitials(activity.user) }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ activity.action }}</div>
                  <div class="text-xs text-base-content/70">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div class="grid grid-cols-1 gap-3">
              <NuxtLink
                v-if="hasPermission('timesheets.create')"
                to="/timesheets"
                class="btn btn-outline justify-start"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Timesheet Entry
              </NuxtLink>
              <NuxtLink
                v-if="hasPermission('employees.read')"
                to="/employees"
                class="btn btn-outline justify-start"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Employees
              </NuxtLink>
              <NuxtLink
                v-if="hasPermission('timesheets.hr_view')"
                to="/timesheets/hr"
                class="btn btn-outline justify-start"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                HR Timesheet Review
              </NuxtLink>
              <NuxtLink
                v-if="hasPermission('settings.access')"
                to="/settings"
                class="btn btn-outline justify-start"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                System Settings
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'
import { useMenuConfig } from '~/composables/useMenuConfig'

const { hasPermission, hasAnyPermission, canAccessModule } = usePermissions()
const { getMenuStats } = useMenuConfig()

// Page meta
definePageMeta({
  middleware: 'permissions'
})

// Computed
const menuStats = computed(() => getMenuStats())

// Mock data (replace with real data)
const stats = reactive({
  totalEmployees: 42,
  activeEmployees: 38,
  pendingTimesheets: 12,
  weeklyHours: 32,
  weeklyTarget: 40
})

const recentActivities = ref([
  { id: 1, user: 'John Doe', action: 'Submitted timesheet for review', time: '2 hours ago' },
  { id: 2, user: 'Jane Smith', action: 'Updated profile information', time: '4 hours ago' },
  { id: 3, user: 'Mike Johnson', action: 'Approved timesheet', time: '1 day ago' },
  { id: 4, user: 'Sarah Wilson', action: 'Added new employee', time: '2 days ago' }
])

// Methods
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Set page title
useHead({
  title: 'Dashboard - Manager'
})
</script>