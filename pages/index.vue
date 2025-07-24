<template>
  <div>
    <!-- This will automatically redirect to login or dashboard based on auth state -->
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>