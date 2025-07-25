export default defineNuxtRouteMiddleware((to, from) => {
  const { $router } = useNuxtApp()
  const authStore = useAuthStore()
  const { hasPermission, canAccessModule, isAdmin } = usePermissions()
  
  // Debug logging can be enabled when needed
  // console.log('MIDDLEWARE: Running for route:', to.path)
  
  // Skip middleware for login page and API routes
  if (to.path === '/login' || to.path.startsWith('/api/')) {
    return
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // If user is authenticated but user data isn't loaded yet, allow access
  if (!authStore.user) {
    return
  }
  
  // Define route permissions mapping
  const routePermissions: Record<string, string[]> = {
    '/dashboard': ['dashboard.access'],
    '/employees': ['employees.access'],
    '/timesheets': ['timesheets.access'],
    '/timesheets/hr': ['timesheets.hr_view'],
    '/settings': ['settings.access'],
    '/profile': ['profile.access']
  }
  
  // Get the base path (without query parameters)
  const basePath = to.path.split('?')[0]
  
  // Check if route requires specific permissions
  const requiredPermissions = routePermissions[basePath]
  
  if (requiredPermissions) {
    // Admin users bypass all permission checks
    if (isAdmin.value) {
      return
    }
    
    // Check if user has required permissions
    const hasRequiredPermission = requiredPermissions.some(permission => {
      return hasPermission(permission)
    })
    
    if (!hasRequiredPermission) {
      // Redirect to dashboard if user doesn't have permission
      if (basePath !== '/dashboard') {
        return navigateTo('/dashboard')
      } else {
        // If user can't access dashboard, redirect to login
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  }
  
  // For dynamic routes, check module access
  if (basePath.startsWith('/employees/') && !canAccessModule('employees')) {
    return navigateTo('/dashboard')
  }
  
  if (basePath.startsWith('/timesheets/') && !canAccessModule('timesheets')) {
    return navigateTo('/dashboard')
  }
  
  if (basePath.startsWith('/settings/') && !canAccessModule('settings')) {
    return navigateTo('/dashboard')
  }
})