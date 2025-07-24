<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink :to="`/employees/${route.params.id}`" class="btn btn-ghost btn-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Profile
      </NuxtLink>
      <div>
        <h1 class="text-3xl font-bold text-white-800">Edit Employee</h1>
        <p class="text-gray-600 mt-2" v-if="employee">
          Editing {{ employee.name }}'s profile
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !employee" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-8">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Form Card -->
    <div v-else-if="employee" class="bg-base-300 rounded-lg shadow-lg">
      <div class="p-6">
        <EmployeeForm 
          :employee="employee"
          :loading="updating"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const employeesStore = useEmployeesStore()
const { selectedEmployee: employee, loading, error } = storeToRefs(employeesStore)

const updating = ref(false)

// Fetch employee data on mount
onMounted(async () => {
  const id = route.params.id as string
  await employeesStore.fetchEmployee(id)
})

// Handle form submission
const handleSubmit = async (employeeData) => {
  const id = route.params.id as string
  updating.value = true
  
  try {
    await employeesStore.updateEmployee(id, employeeData)
    
    // Navigate back to employee profile
    await navigateTo(`/employees/${id}`)
  } catch (err) {
    console.error('Error updating employee:', err)
    // Error handling is done in the store
  } finally {
    updating.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  const id = route.params.id as string
  navigateTo(`/employees/${id}`)
}

// Set page title
useHead({
  title: computed(() => employee.value ? `Edit ${employee.value.name} - Manager` : 'Edit Employee - Manager')
})
</script>