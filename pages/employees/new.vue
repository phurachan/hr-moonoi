<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/employees" class="btn btn-ghost btn-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Employees
      </NuxtLink>
      <div>
        <h1 class="text-3xl font-bold text-white-800">Add New Employee</h1>
        <p class="text-gray-600 mt-2">Create a new employee profile</p>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-base-300 rounded-lg shadow-lg">
      <div class="p-6">
        <EmployeeForm 
          :loading="loading"
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

const employeesStore = useEmployeesStore()
const { loading, error } = storeToRefs(employeesStore)

// Handle form submission
const handleSubmit = async (employeeData) => {
  try {
    await employeesStore.createEmployee(employeeData)
    
    // Show success message
    await navigateTo('/employees')
  } catch (err) {
    console.error('Error creating employee:', err)
    // Error handling is done in the store
  }
}

// Handle cancel
const handleCancel = () => {
  navigateTo('/employees')
}

// Set page title
useHead({
  title: 'Add New Employee - Manager'
})
</script>