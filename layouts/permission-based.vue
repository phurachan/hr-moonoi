<template>
  <div class="min-h-screen bg-base-200">
    <!-- Check if user is authenticated -->
    <div v-if="!authStore.isAuthenticated" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="loading loading-spinner loading-lg"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
    
    <!-- Main App Layout -->
    <div v-else class="flex min-h-screen">
      <!-- Sidebar -->
      <LayoutPermissionBasedSidebar />
      
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Top Bar -->
        <LayoutPermissionBasedTopBar />
        
        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <div class="container mx-auto p-6">
            <!-- Page Title and Actions -->
            <div v-if="showPageHeader" class="mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h1 v-if="pageTitle" class="text-2xl font-bold text-base-content">
                    {{ pageTitle }}
                  </h1>
                  <p v-if="pageDescription" class="text-base-content/70 mt-1">
                    {{ pageDescription }}
                  </p>
                </div>
                <div v-if="$slots.actions" class="flex items-center space-x-2">
                  <slot name="actions" />
                </div>
              </div>
            </div>
            
            <!-- Main Content Slot -->
            <slot />
          </div>
        </main>
        
        <!-- Footer -->
        <footer v-if="showFooter" class="bg-base-100 border-t border-base-200 py-4">
          <div class="container mx-auto px-6">
            <div class="flex items-center justify-between">
              <div class="text-sm text-base-content/70">
                © {{ currentYear }} Manager. All rights reserved.
              </div>
              <div class="flex items-center space-x-4 text-sm text-base-content/70">
                <NuxtLink v-if="hasPermission('profile.access')" to="/privacy" class="hover:text-primary">
                  Privacy Policy
                </NuxtLink>
                <NuxtLink v-if="hasPermission('profile.access')" to="/terms" class="hover:text-primary">
                  Terms of Service
                </NuxtLink>
                <NuxtLink v-if="hasPermission('profile.access')" to="/support" class="hover:text-primary">
                  Support
                </NuxtLink>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    
    <!-- Permission Denied Modal -->
    <div v-if="showPermissionDenied" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Access Denied</h3>
        <p class="py-4">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div class="modal-action">
          <button @click="goToDashboard" class="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'

// Props
interface Props {
  pageTitle?: string
  pageDescription?: string
  showPageHeader?: boolean
  showFooter?: boolean
  requiredPermissions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showPageHeader: true,
  showFooter: true,
  requiredPermissions: () => []
})

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { hasPermission, hasAnyPermission } = usePermissions()

// Reactive data
const showPermissionDenied = ref(false)
const currentYear = new Date().getFullYear()

// Check permissions when component mounts
onMounted(() => {
  if (props.requiredPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(props.requiredPermissions)
    if (!hasRequiredPermission) {
      showPermissionDenied.value = true
    }
  }
})

// Watch for route changes to recheck permissions
watch(() => props.requiredPermissions, (newPermissions) => {
  if (newPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(newPermissions)
    if (!hasRequiredPermission) {
      showPermissionDenied.value = true
    } else {
      showPermissionDenied.value = false
    }
  }
}, { deep: true })

// Watch for user data changes to ensure components refresh
watch(() => authStore.user, (newUser) => {
  if (newUser && props.requiredPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(props.requiredPermissions)
    if (!hasRequiredPermission) {
      showPermissionDenied.value = true
    } else {
      showPermissionDenied.value = false
    }
  }
}, { deep: true })

// Methods
const goToDashboard = () => {
  showPermissionDenied.value = false
  navigateTo('/dashboard')
}

// Initialize auth on mount
onMounted(async () => {
  await authStore.initializeAuth()
  
  // If user data is not available after initialization, try to fetch it
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchCurrentUser()
  }
})
</script>

<style scoped>
/* Custom scrollbar for main content */
main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.2);
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
</style>