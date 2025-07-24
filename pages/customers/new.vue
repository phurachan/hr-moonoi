<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/customers" class="btn btn-ghost btn-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Customers
      </NuxtLink>
      <div>
        <h1 class="text-3xl font-bold">Add New Customer</h1>
        <p class="text-gray-600 mt-2">Create a new customer profile</p>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-base-100 rounded-lg shadow-lg">
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Customer Name *</span>
              </label>
              <input 
                v-model="form.name"
                type="text" 
                class="input input-bordered"
                :class="{ 'input-error': errors.name }"
                placeholder="Enter customer name"
                required
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-error">{{ errors.name }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Phone Number *</span>
              </label>
              <input 
                v-model="form.tel"
                type="tel" 
                class="input input-bordered"
                :class="{ 'input-error': errors.tel }"
                placeholder="Enter phone number"
                required
              />
              <label v-if="errors.tel" class="label">
                <span class="label-text-alt text-error">{{ errors.tel }}</span>
              </label>
            </div>
          </div>

          <!-- Address -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Address *</span>
            </label>
            <textarea 
              v-model="form.address"
              class="textarea textarea-bordered h-24"
              :class="{ 'textarea-error': errors.address }"
              placeholder="Enter customer address"
              required
            ></textarea>
            <label v-if="errors.address" class="label">
              <span class="label-text-alt text-error">{{ errors.address }}</span>
            </label>
          </div>

          <!-- Optional Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email</span>
              </label>
              <input 
                v-model="form.email"
                type="email" 
                class="input input-bordered"
                :class="{ 'input-error': errors.email }"
                placeholder="Enter email address"
              />
              <label v-if="errors.email" class="label">
                <span class="label-text-alt text-error">{{ errors.email }}</span>
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Tax ID</span>
              </label>
              <input 
                v-model="form.taxId"
                type="text" 
                class="input input-bordered"
                :class="{ 'input-error': errors.taxId }"
                placeholder="Enter tax ID"
              />
              <label v-if="errors.taxId" class="label">
                <span class="label-text-alt text-error">{{ errors.taxId }}</span>
              </label>
            </div>
          </div>

          <!-- Status -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Status</span>
            </label>
            <select v-model="form.status" class="select select-bordered">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="alert alert-error">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ submitError }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6">
            <button 
              type="submit" 
              class="btn btn-primary"
              :class="{ 'loading': loading }"
              :disabled="loading"
            >
              <svg v-if="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ loading ? 'Creating...' : 'Create Customer' }}
            </button>
            
            <button 
              type="button" 
              class="btn btn-ghost"
              @click="handleCancel"
              :disabled="loading"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()

const loading = ref(false)
const submitError = ref('')
const errors = ref({})

const form = reactive({
  name: '',
  tel: '',
  address: '',
  email: '',
  taxId: '',
  status: 'active'
})

const validateForm = () => {
  errors.value = {}

  if (!form.name.trim()) {
    errors.value.name = 'Customer name is required'
  }

  if (!form.tel.trim()) {
    errors.value.tel = 'Phone number is required'
  }

  if (!form.address.trim()) {
    errors.value.address = 'Address is required'
  }

  if (form.email && !isValidEmail(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  submitError.value = ''

  try {
    const customerData = {
      name: form.name.trim(),
      tel: form.tel.trim(),
      address: form.address.trim(),
      email: form.email.trim() || undefined,
      taxId: form.taxId.trim() || undefined,
      status: form.status
    }

    await $fetch('/api/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: customerData
    })

    const modal = useModal()
    await modal.showAlert({
      title: 'Success',
      message: 'Customer created successfully',
      type: 'success'
    })

    await navigateTo('/customers')
  } catch (err: any) {
    console.error('Error creating customer:', err)
    submitError.value = err.data?.message || 'Failed to create customer. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  navigateTo('/customers')
}

useHead({
  title: 'Add New Customer - Manager'
})
</script>