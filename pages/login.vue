<template>
  <div>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
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
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Password</span>
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
        <label class="label cursor-pointer">
          <span class="label-text">Remember me</span>
          <input v-model="form.remember" type="checkbox" class="checkbox" />
        </label>
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
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </div>
    </form>
    
    <div class="divider">OR</div>
    
    <div class="text-center space-y-2">
      <p class="text-sm text-base-content/70">
        Don't have an account? 
        <NuxtLink to="/register" class="link link-primary">Sign up</NuxtLink>
      </p>
    </div>
    
    <div class="mt-8 p-4 bg-base-200 rounded-lg">
      <h3 class="font-semibold mb-2">Demo Credentials:</h3>
      <div class="text-sm space-y-1">
        <p><strong>Admin:</strong> admin@hr-moonoi.com / admin123456</p>
        <p><strong>HR:</strong> hr@hr-moonoi.com / hr123456</p>
        <p><strong>Employee:</strong> employee@hr-moonoi.com / emp123456</p>
      </div>
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
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const errors = ref({})
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  // Clear previous errors
  errors.value = {}
  error.value = ''
  
  // Basic validation
  if (!form.value.email) {
    errors.value.email = 'Email is required'
    return
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return
  }
  
  loading.value = true
  
  try {
    const response = await authStore.login({
      email: form.value.email,
      password: form.value.password
    })
    
    // Check for redirect parameter in URL
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/dashboard'
    
    console.log('LOGIN: Raw redirect param:', redirect)
    console.log('LOGIN: Decoded target path:', targetPath)
    console.log('LOGIN: Full query object:', router.currentRoute.value.query)
    
    await navigateTo(targetPath, { replace: true })
    
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Handle redirect when already authenticated
onMounted(async () => {
  console.log('🔑 LOGIN PAGE: onMounted')
  console.log('🔑 LOGIN PAGE: Auth state:', authStore.isAuthenticated)
  console.log('🔑 LOGIN PAGE: Current route:', router.currentRoute.value.fullPath)
  console.log('🔑 LOGIN PAGE: Query params:', router.currentRoute.value.query)
  console.log('🔑 LOGIN PAGE: Redirect param:', router.currentRoute.value.query.redirect)
  
  // Wait a bit for any pending auth initialization
  await nextTick()
  
  if (authStore.isAuthenticated) {
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/dashboard'
    console.log('🔑 LOGIN PAGE: Already authenticated, redirecting to:', targetPath)
    navigateTo(targetPath)
  }
})

// Also watch for auth state changes in case auth completes after mount
watch(() => authStore.isAuthenticated, (isAuthenticated, oldValue) => {
  console.log('🔑 LOGIN PAGE: Auth state changed from', oldValue, 'to', isAuthenticated)
  if (isAuthenticated && !oldValue) {
    console.log('🔑 LOGIN PAGE: Current route during auth change:', router.currentRoute.value.fullPath)
    console.log('🔑 LOGIN PAGE: Query during auth change:', router.currentRoute.value.query)
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/dashboard'
    console.log('🔑 LOGIN PAGE: Auth became true, redirecting to:', targetPath)
    navigateTo(targetPath)
  }
})
</script>