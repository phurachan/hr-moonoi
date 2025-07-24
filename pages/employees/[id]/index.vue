<template>
  <div class="container mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <NuxtLink to="/employees" class="btn btn-ghost btn-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Employees
        </NuxtLink>
        <h1 class="text-3xl font-bold">Employee Profile</h1>
      </div>
      
      <div class="flex gap-2">
        <button 
          v-if="authStore.canManageEmployees"
          @click="registerUser" 
          class="btn btn-success"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Register User
        </button>
        
        <NuxtLink :to="`/employees/${employee?.id}/edit`" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </NuxtLink>
        
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a @click="downloadProfile">Download Profile</a></li>
            <li><a @click="printProfile">Print Profile</a></li>
            <li class="divider"></li>
            <li><a @click="deleteEmployee" class="text-error">Delete Employee</a></li>
          </ul>
        </div>
      </div>
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

    <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body text-center">
            <div class="avatar mb-4">
              <div class="w-32 rounded-full">
                <img :src="employee.avatar || '/images/user-avatar.png'" :alt="employee.name" />
              </div>
            </div>
            
            <h2 class="card-title justify-center text-2xl">{{ employee.name }}</h2>
            <p class="text-base-content/70">{{ employee.position }}</p>
            <div class="badge badge-lg" :class="getStatusClass(employee.status)">
              {{ employee.status }}
            </div>
            
            <div class="divider"></div>
            
            <div class="space-y-3 text-left">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>{{ employee.email }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>{{ employee.phone }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>{{ employee.department }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-8 6h4m-4 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h4z"></path>
                </svg>
                <span>Hired: {{ formatDate(employee.hireDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lg:col-span-2 space-y-6">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-base-content/70">Full Name</label>
                <p class="text-lg">{{ employee.name }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Email Address</label>
                <p class="text-lg">{{ employee.email }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Phone Number</label>
                <p class="text-lg">{{ employee.phone }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Address</label>
                <p class="text-lg">{{ employee.address || 'Not provided' }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Birth Date</label>
                <p class="text-lg">{{ employee.birthDate ? formatDate(employee.birthDate) : 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title">Employment Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-base-content/70">Position</label>
                <p class="text-lg">{{ employee.position }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Department</label>
                <p class="text-lg">{{ employee.department }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Hire Date</label>
                <p class="text-lg">{{ formatDate(employee.hireDate) }}</p>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Employment Status</label>
                <div class="flex badge badge-lg mt-2" :class="getStatusClass(employee.status)">
                  {{ employee.status }}
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium text-base-content/70">Salary</label>
                <p class="text-lg">{{ employee.salary?.toLocaleString('th-TH') }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="employee.emergencyContact" class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title">Emergency Contact</h3>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="text-sm font-medium text-base-content/70">Emergency Contact</label>
                <p class="text-lg">{{ employee.emergencyContact }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title">Recent Activities</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <div class="w-2 h-2 bg-success rounded-full"></div>
                <div class="flex-1">
                  <p class="font-medium">Logged in today</p>
                  <p class="text-sm text-base-content/70">9:15 AM - Present</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <div class="w-2 h-2 bg-info rounded-full"></div>
                <div class="flex-1">
                  <p class="font-medium">Updated profile information</p>
                  <p class="text-sm text-base-content/70">Yesterday, 2:30 PM</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <div class="w-2 h-2 bg-warning rounded-full"></div>
                <div class="flex-1">
                  <p class="font-medium">Submitted time off request</p>
                  <p class="text-sm text-base-content/70">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()
const { selectedEmployee: employee, loading, error } = storeToRefs(employeesStore)

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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const downloadProfile = () => {
  // Implementation for downloading profile
  console.log('Download profile for:', employee.value?.name)
}

const printProfile = () => {
  // Implementation for printing profile
  window.print()
}

const formatBirthdateToPassword = (birthDate) => {
  if (!birthDate) return ''
  const date = new Date(birthDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const registerUser = async () => {
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
  
  if (!employee.value?.birthDate) {
    await modal.showAlert({
      title: 'Registration Required',
      message: 'Employee birthdate is required to register user account',
      type: 'warning'
    })
    return
  }
  
  const defaultPassword = formatBirthdateToPassword(employee.value.birthDate)
  
  const confirmed = await modal.showConfirm({
    title: 'Register User Account',
    message: `Register user account for ${employee.value?.name}?\nDefault password will be: ${defaultPassword}`,
    type: 'info',
    confirmText: 'Register'
  })
  
  if (confirmed) {
    try {
      await authStore.register({
        name: employee.value.name,
        email: employee.value.email,
        password: defaultPassword,
        department: employee.value.department,
        position: employee.value.position
      })
      
      await modal.showAlert({
        title: 'Registration Successful',
        message: `User account created successfully for ${employee.value.name}\nPassword: ${defaultPassword}`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error registering user:', error)
      await modal.showAlert({
        title: 'Registration Failed',
        message: 'Failed to create user account. Please try again.',
        type: 'error'
      })
    }
  }
}

const deleteEmployee = async () => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Delete Employee',
    message: `Are you sure you want to delete ${employee.value?.name}?`,
    type: 'danger',
    confirmText: 'Delete'
  })
  
  if (confirmed) {
    try {
      await employeesStore.deleteEmployee(employee.value.id)
      await navigateTo('/employees')
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }
}

onMounted(async () => {
  const id = route.params.id
  await employeesStore.fetchEmployee(id)
})
</script>