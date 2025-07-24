<template>
  <div>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Full Name *</span>
          </label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Enter your full name" 
            class="input input-bordered"
            :class="{ 'input-error': errors.name }"
            required
          />
          <label v-if="errors.name" class="label">
            <span class="label-text-alt text-error">{{ errors.name }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Email *</span>
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Enter your email" 
            class="input input-bordered"
            :class="{ 'input-error': errors.email }"
            required
          />
          <label v-if="errors.email" class="label">
            <span class="label-text-alt text-error">{{ errors.email }}</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password *</span>
          </label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Enter your password" 
            class="input input-bordered"
            :class="{ 'input-error': errors.password }"
            required
          />
          <label v-if="errors.password" class="label">
            <span class="label-text-alt text-error">{{ errors.password }}</span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Confirm Password *</span>
          </label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            class="input input-bordered"
            :class="{ 'input-error': errors.confirmPassword }"
            required
          />
          <label v-if="errors.confirmPassword" class="label">
            <span class="label-text-alt text-error">{{ errors.confirmPassword }}</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Department</span>
          </label>
          <select 
            v-model="form.department"
            class="select select-bordered"
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Customer Support">Customer Support</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Position</span>
          </label>
          <input 
            v-model="form.position" 
            type="text" 
            placeholder="Your job title" 
            class="input input-bordered"
          />
        </div>
      </div>
      
      <div v-if="error" class="alert alert-error">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ error }}</span>
      </div>
      
      <div class="form-control mt-6">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </div>
    </form>
    
    <div class="divider">OR</div>
    
    <div class="text-center">
      <p class="text-sm text-base-content/70">
        Already have an account? 
        <NuxtLink to="/login" class="link link-primary">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '',
  position: ''
})

const errors = ref({})
const error = ref('')
const loading = ref(false)

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      department: form.value.department || undefined,
      position: form.value.position || undefined
    })
    
    // Redirect to dashboard
    await navigateTo('/dashboard')
    
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  }
})

// Set page title
useHead({
  title: 'Register - Manager'
})
</script>