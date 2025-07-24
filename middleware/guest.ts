export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth state on first load
  if (process.client && !authStore.isAuthenticated) {
    authStore.initializeAuth()
  }
  
  // If authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})