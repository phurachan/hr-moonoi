<template>
  <div class="container mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Employees</h1>
      <NuxtLink to="/employees/new" class="btn btn-primary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Employee
      </NuxtLink>
    </div>

    <!-- Employee Summary Cards -->
    <EmployeeEmployeeSummaryCards ref="employeeSummaryRef" />

    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <div class="form-control flex-1">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search employees..." 
              class="input input-bordered w-full"
              @input="debouncedSearch"
            />
          </div>
          
          <div class="form-control lg:w-48">
            <select v-model="selectedDepartment" class="select select-bordered" @change="applyFilters">
              <option value="">All Departments</option>
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>
          
          <div class="form-control lg:w-32">
            <select v-model="selectedStatus" class="select select-bordered" @change="applyFilters">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          
          <button @click="clearFilters" class="btn btn-ghost">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear
          </button>
        </div>

        <div v-if="!authStore.canManageEmployees" class="alert alert-info mb-6">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>You need admin or HR permissions to register user accounts. Login as admin@manager.com or hr@manager.com to access this feature.</span>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="loading loading-spinner loading-lg"></div>
        </div>

        <div v-else-if="error" class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in paginatedEmployees" :key="employee.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-12 h-12">
                        <img :src="employee.avatar || '/images/user-avatar.png'" :alt="employee.name" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{{ employee.name }}</div>
                      <div class="text-sm opacity-50">{{ employee.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ employee.position }}</td>
                <td>{{ employee.department }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(employee.status)">
                    {{ employee.status }}
                  </div>
                </td>
                <td>{{ formatDate(employee.hireDate) }}</td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      v-if="authStore.canManageEmployees && !isEmployeeRegistered(employee)"
                      @click="registerEmployee(employee)" 
                      class="btn btn-primary btn-xs"
                      title="Register User Account"
                    >
                      Register
                    </button>
                    
                    <div v-else-if="authStore.canManageEmployees && isEmployeeRegistered(employee)" class="flex items-center">
                      <span class="badge badge-success badge-sm">Registered</span>
                    </div>

                    <NuxtLink :to="`/employees/${employee.id}`" class="btn btn-ghost btn-xs">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </NuxtLink>
                    
                    <NuxtLink :to="`/employees/${employee.id}/edit`" class="btn btn-ghost btn-xs">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </NuxtLink>
                    
                    <button @click="deleteEmployee(employee)" class="btn btn-ghost btn-xs text-error">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <BasePagination
          :currentPage="pagination.currentPage.value"
          :totalPages="pagination.totalPages.value"
          :totalItems="pagination.totalItems.value"
          :pageSize="pagination.pageSize.value"
          @update:currentPage="handlePageChange"
          @update:pageSize="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Set page title
useHead({
  title: 'Employees - Manager'
})

const employeesStore = useEmployeesStore()
const authStore = useAuthStore()
const { employees, loading, error, filteredEmployees, departmentsList } = storeToRefs(employeesStore)

const employeeSummaryRef = ref()
const registeredUsers = ref([])
const loadingRegistration = ref(false)

const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

const pagination = usePagination(10)
const departments = computed(() => departmentsList.value)

const paginatedEmployees = computed(() => {
  const start = (pagination.currentPage.value - 1) * pagination.pageSize.value
  const end = start + pagination.pageSize.value
  return filteredEmployees.value.slice(start, end)
})

watch(filteredEmployees, (newEmployees) => {
  pagination.totalItems.value = newEmployees.length
  pagination.totalPages.value = Math.ceil(newEmployees.length / pagination.pageSize.value)
  
  // Reset to first page if current page is out of range
  if (pagination.currentPage.value > pagination.totalPages.value && pagination.totalPages.value > 0) {
    pagination.currentPage.value = 1
  }
}, { immediate: true })

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const applyFilters = () => {
  employeesStore.setFilters({
    search: searchQuery.value,
    department: selectedDepartment.value,
    status: selectedStatus.value
  })
  pagination.currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  employeesStore.clearFilters()
  pagination.currentPage.value = 1
}

const handlePageChange = (page) => {
  pagination.goToPage(page)
}

const handlePageSizeChange = (size) => {
  pagination.changePageSize(size)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'inactive':
      return 'badge-warning'
    case 'terminated':
      return 'badge-error'
    default:
      return 'badge-neutral'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const fetchRegisteredUsers = async () => {
  try {
    const users = await $fetch('/api/auth/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    registeredUsers.value = users || []
  } catch (error) {
    console.error('Error fetching registered users:', error)
    registeredUsers.value = []
    
    // Show modal if user doesn't have permissions
    if (error?.status === 403 || error?.statusCode === 403) {
      const modal = useModal()
      await modal.showAlert({
        title: 'Permission Required',
        message: 'You need admin or HR permissions to register users. Please contact your administrator.',
        type: 'warning'
      })
    }
  }
}

const isEmployeeRegistered = (employee) => {
  return registeredUsers.value.some(user => user.email === employee.email)
}

const formatBirthdateToPassword = (birthDate) => {
  if (!birthDate) return ''
  const date = new Date(birthDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const registerEmployee = async (employee) => {
  const modal = useModal()
  
  // Check if user has permissions first
  if (!authStore.canManageEmployees) {
    await modal.showAlert({
      title: 'Permission Required',
      message: 'You need admin or HR permissions to register users. Please contact your administrator.',
      type: 'warning'
    })
    return
  }
  
  if (!employee.birthDate) {
    await modal.showAlert({
      title: 'Registration Required',
      message: 'Employee birthdate is required to register user account',
      type: 'warning'
    })
    return
  }
  
  if (loadingRegistration.value) return
  
  const defaultPassword = formatBirthdateToPassword(employee.birthDate)
  
  const confirmed = await modal.showConfirm({
    title: 'Register User Account',
    message: `Register user account for ${employee.name}?\nDefault password will be: ${defaultPassword}`,
    type: 'info',
    confirmText: 'Register'
  })
  
  if (confirmed) {
    loadingRegistration.value = true
    try {
      await authStore.register({
        name: employee.name,
        email: employee.email,
        password: defaultPassword,
        department: employee.department,
        position: employee.position,
        role: 'employee'
      })
      
      await fetchRegisteredUsers()
      await modal.showAlert({
        title: 'Registration Successful',
        message: `User account created successfully for ${employee.name}\nPassword: ${defaultPassword}`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error registering user:', error)
      await modal.showAlert({
        title: 'Registration Failed',
        message: 'Failed to create user account. Please try again.',
        type: 'error'
      })
    } finally {
      loadingRegistration.value = false
    }
  }
}

const deleteEmployee = async (employee) => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Delete Employee',
    message: `Are you sure you want to delete ${employee.name}?`,
    type: 'danger',
    confirmText: 'Delete'
  })
  
  if (confirmed) {
    try {
      await employeesStore.deleteEmployee(employee.id)
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }
}

// Test function removed - modal system is working

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

onMounted(async () => {
  await employeesStore.fetchEmployees()
  
  // Only try to fetch registered users if user has permissions
  if (authStore.canManageEmployees) {
    await fetchRegisteredUsers()
  }
})
</script>