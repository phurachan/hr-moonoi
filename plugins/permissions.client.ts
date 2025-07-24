import { usePermissions } from '~/composables/usePermissions'

export default defineNuxtPlugin((nuxtApp) => {
  const { hasPermission, canAccessModule, hasAnyPermission } = usePermissions()
  
  // Register v-permission directive
  nuxtApp.vueApp.directive('permission', {
    mounted(el, binding) {
      const { value, modifiers } = binding
      
      if (!value) return
      
      let hasAccess = false
      
      // Check if it's a module access check
      if (modifiers.module) {
        hasAccess = canAccessModule(value)
      }
      // Check if it's an "any" permission check
      else if (modifiers.any && Array.isArray(value)) {
        hasAccess = hasAnyPermission(value)
      }
      // Check if it's an array of permissions (all required)
      else if (Array.isArray(value)) {
        hasAccess = value.every(permission => hasPermission(permission))
      }
      // Single permission check
      else if (typeof value === 'string') {
        hasAccess = hasPermission(value)
      }
      
      if (!hasAccess) {
        el.style.display = 'none'
      }
    },
    
    updated(el, binding) {
      const { value, modifiers } = binding
      
      if (!value) return
      
      let hasAccess = false
      
      // Check if it's a module access check
      if (modifiers.module) {
        hasAccess = canAccessModule(value)
      }
      // Check if it's an "any" permission check
      else if (modifiers.any && Array.isArray(value)) {
        hasAccess = hasAnyPermission(value)
      }
      // Check if it's an array of permissions (all required)
      else if (Array.isArray(value)) {
        hasAccess = value.every(permission => hasPermission(permission))
      }
      // Single permission check
      else if (typeof value === 'string') {
        hasAccess = hasPermission(value)
      }
      
      el.style.display = hasAccess ? '' : 'none'
    }
  })
  
  // Register v-role directive
  nuxtApp.vueApp.directive('role', {
    mounted(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (!value) return
      
      const userRole = authStore.user?.role
      let hasRole = false
      
      if (Array.isArray(value)) {
        hasRole = value.includes(userRole)
      } else if (typeof value === 'string') {
        hasRole = userRole === value
      }
      
      if (!hasRole) {
        el.style.display = 'none'
      }
    },
    
    updated(el, binding) {
      const { value } = binding
      const authStore = useAuthStore()
      
      if (!value) return
      
      const userRole = authStore.user?.role
      let hasRole = false
      
      if (Array.isArray(value)) {
        hasRole = value.includes(userRole)
      } else if (typeof value === 'string') {
        hasRole = userRole === value
      }
      
      el.style.display = hasRole ? '' : 'none'
    }
  })
})