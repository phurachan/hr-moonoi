export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth state on first load
  if (process.client && !authStore.isAuthenticated) {
    authStore.initializeAuth()
  }
  
  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})