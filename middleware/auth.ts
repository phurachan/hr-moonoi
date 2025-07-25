export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Wait for auth initialization to complete if it's in progress or not started
  if (process.client && (!authStore.hasInitialized || authStore.isInitializing)) {
    // Wait for initialization to complete
    while (authStore.isInitializing || !authStore.hasInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  // If not authenticated, redirect to login with current path
  if (!authStore.isAuthenticated) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirectUrl)
  }
})