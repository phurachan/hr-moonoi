<template>
  <header class="bg-base-100 shadow-sm border-b border-base-200">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Left side - Breadcrumbs -->
      <div class="flex items-center space-x-4">
        <NavigationPermissionBasedBreadcrumbs />
      </div>
      
      <!-- Right side - User actions -->
      <div class="flex items-center space-x-4">
        <!-- Quick Actions -->
        <div class="hidden md:flex items-center space-x-2">
          <!-- Add Employee (if has permission) -->
          <NuxtLink
            v-if="hasPermission('employees.create')"
            to="/employees/create"
            class="btn btn-primary btn-sm"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Employee
          </NuxtLink>
          
          <!-- Settings (if has permission) -->
          <NuxtLink
            v-if="hasPermission('settings.access')"
            to="/settings"
            class="btn btn-ghost btn-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NuxtLink>
        </div>
        
        <!-- Notifications (if has permission) -->
        <div class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5-5-5 5h5zM15 17v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3" />
              </svg>
              <span v-if="notifications.length > 0" class="badge badge-xs badge-primary indicator-item">
                {{ notifications.length }}
              </span>
            </div>
          </button>
          <div tabindex="0" class="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100 text-base-content">
            <div class="card-body">
              <h3 class="font-bold">Notifications</h3>
              <div v-if="notifications.length === 0" class="text-sm text-base-content/70">
                No new notifications
              </div>
              <div v-else class="space-y-2">
                <div v-for="notification in notifications" :key="notification.id" class="text-sm">
                  {{ notification.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-ghost normal-case gap-2 px-3">
            <div class="avatar">
              <div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span class="text-sm font-medium">{{ getInitials(user?.name) }}</span>
              </div>
            </div>
            <div v-if="user?.name" class="flex flex-col items-start">
              <span class="text-sm font-medium">{{ user.name }}</span>
              <span class="text-xs text-base-content/70">{{ user.role }}</span>
            </div>
            <div v-else class="flex flex-col items-start">
              <span class="text-sm font-medium">Loading...</span>
              <span class="text-xs text-base-content/70">User</span>
            </div>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li class="menu-title">
              <span>{{ user?.name }}</span>
              <span class="text-xs text-base-content/70">{{ user?.role }}</span>
            </li>
            <li v-if="hasPermission('profile.access')">
              <NuxtLink to="/profile">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </NuxtLink>
            </li>
            <li v-if="hasPermission('settings.access')">
              <NuxtLink to="/settings">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </NuxtLink>
            </li>
            <li><hr class="my-1"></li>
            <!-- Permission Summary -->
            <li class="menu-title">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Permissions
              </span>
            </li>
            <li>
              <div class="text-xs text-base-content/70">
                {{ menuStats.accessibleItems }} of {{ menuStats.totalItems }} menu items
              </div>
            </li>
            <li v-if="userRoles.length > 0">
              <div class="text-xs">
                <span class="font-medium">Roles:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="role in userRoles" 
                    :key="role.id" 
                    class="badge badge-xs badge-outline"
                  >
                    {{ role.name }}
                  </span>
                </div>
              </div>
            </li>
            <li><hr class="my-1"></li>
            <li>
              <button @click="logout" class="text-red-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'
import { useMenuConfig } from '~/composables/useMenuConfig'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { hasPermission } = usePermissions()
const { getMenuStats } = useMenuConfig()

// Computed
const menuStats = computed(() => getMenuStats())
const userRoles = computed(() => user.value?.roles || [])

// Mock notifications (you can replace with real data)
const notifications = ref([
  // { id: 1, message: 'New timesheet submitted for review' },
  // { id: 2, message: 'Employee John Doe updated profile' }
])

// Methods
const getInitials = (name?: string): string => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const logout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.dropdown-content {
  z-index: 1000;
}
</style>