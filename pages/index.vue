<template>
  <div>
    <!-- This will automatically redirect to login or dashboard based on auth state -->
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Only redirect if we're actually on the root page, not during refresh
onMounted(() => {
  console.log('INDEX PAGE: onMounted called')
  console.log('INDEX PAGE: Current path:', window.location.pathname)
  console.log('INDEX PAGE: Auth state:', authStore.isAuthenticated)
  
  // Only redirect if we're actually on the root path
  if (window.location.pathname === '/') {
    console.log('INDEX PAGE: On root path, redirecting...')
    if (authStore.isAuthenticated) {
      console.log('INDEX PAGE: Redirecting to dashboard')
      navigateTo('/dashboard')
    } else {
      console.log('INDEX PAGE: Redirecting to login')
      navigateTo('/login')
    }
  } else {
    console.log('INDEX PAGE: Not on root path, skipping redirect')
  }
})
</script>