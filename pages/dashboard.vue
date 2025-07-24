<template>
  <div class="container mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <div class="text-sm text-base-content/70">
        Welcome back, {{ user?.name }}
      </div>
    </div>

    <!-- Employee Summary Cards - only show if user has employees.read permission -->
    <EmployeeEmployeeSummaryCards v-if="canViewEmployees" ref="employeeSummaryRef" />

    <!-- Timesheet Summary Cards -->
    <TimesheetsTimesheetSummaryCards ref="timesheetSummaryRef" />

    <div class="grid grid-cols-1 gap-6" :class="{ 'lg:grid-cols-2': canViewEmployees }">
      <!-- Recent Employees - only show if user has employees.read permission -->
      <div v-if="canViewEmployees" class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Recent Employees</h2>
          <div class="space-y-3">
            <div v-if="loading" class="flex justify-center py-4">
              <div class="loading loading-spinner loading-md"></div>
            </div>
            <div v-else-if="recentEmployees.length === 0" class="text-center py-4 text-base-content/50">
              No employees found
            </div>
            <div v-else v-for="employee in recentEmployees" :key="employee.id" class="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg transition-colors">
              <div class="avatar">
                <div class="w-12 rounded-full">
                  <img :src="employee.avatar || '/images/user-avatar.png'" :alt="employee.name" />
                </div>
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ employee.name }}</div>
                <div class="text-sm text-base-content/70">{{ employee.position }}</div>
              </div>
              <div class="badge badge-primary">{{ employee.department }}</div>
            </div>
          </div>
          <div class="card-actions justify-end">
            <NuxtLink to="/employees" class="btn btn-primary btn-sm">View All</NuxtLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-3">
            <!-- Add Employee - only show if user has employees.create permission -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('employees-create'))"
              to="/employees/new" 
              class="btn btn-primary btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Employee
            </NuxtLink>

            <!-- Add Customer - only show if user has customers.create permission -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('customers-create'))"
              to="/customers/new" 
              class="btn btn-success btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Customer
            </NuxtLink>
            
            <!-- My Timesheets - only show if user has timesheets access -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('timesheets-my'))"
              to="/timesheets" 
              class="btn btn-secondary btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              My Timesheets
            </NuxtLink>
            
            <!-- HR View - only show if user has timesheets.hr_view permission -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('timesheets-hr'))"
              to="/timesheets/hr" 
              class="btn btn-accent btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              HR View
            </NuxtLink>
            
            <!-- Invoice Reports - only show if user has invoices.access permission -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('invoices'))"
              to="/reports/invoices" 
              class="btn btn-info btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Invoice Reports
            </NuxtLink>

            <!-- Settings - only show if user has settings.access permission -->
            <NuxtLink 
              v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings'))"
              to="/settings" 
              class="btn btn-warning btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useEmployeesStore } from '~/stores/employees'
import { useMenuConfig } from '~/composables/useMenuConfig'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const menuConfig = useMenuConfig()
const { user } = storeToRefs(authStore)

const employeeSummaryRef = ref()
const timesheetSummaryRef = ref()
const recentEmployees = ref([])
const loading = ref(false)

// Check if user can view employees
const canViewEmployees = computed(() => {
  return menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('employees'))
})

const fetchRecentEmployees = async () => {
  // Only fetch if user has permission to view employees
  if (!canViewEmployees.value) {
    return
  }
  
  loading.value = true
  try {
    const response = await $fetch('/api/employees', {
      query: { limit: 4, sort: 'createdAt:desc' },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    recentEmployees.value = response.employees || []
  } catch (error) {
    console.error('Error fetching recent employees:', error)
    recentEmployees.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecentEmployees()
})
</script>