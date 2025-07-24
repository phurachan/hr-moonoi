<template>
  <aside class="w-64 min-h-full bg-base-100 shadow-xl">
    <div class="sidebar-menu p-4">
      <!-- Logo -->
      <div class="flex items-center gap-2 mb-8">
        <img 
          src="/images/logo-moonoi.png" 
          alt="Manager" 
          class="h-8 w-auto"
        />
        <span class="text-lg font-bold">Manager</span>
      </div>
      
      <!-- Menu Sections -->
      <div class="space-y-6">
        <div v-for="section in filteredMenuConfig" :key="section.title || 'no-title'" class="space-y-2">
          <!-- Section Title -->
          <div v-if="section.title" class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {{ section.title }}
            </h3>
          </div>
          
          <!-- Menu Items -->
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.id">
              <!-- Separator -->
              <div v-if="item.separator" class="my-4">
                <div class="divider"></div>
              </div>
              
              <!-- Menu Item -->
              <div v-else>
                <!-- Parent Item -->
                <div v-if="!item.children || item.children.length === 0">
                  <NuxtLink
                    :to="item.path"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors group"
                    :class="{ 'bg-primary text-primary-content': isActive(item.path) }"
                  >
                    <svg 
                      class="w-5 h-5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        :d="item.icon"
                      />
                    </svg>
                    <span class="flex-1 text-sm font-medium">{{ item.title }}</span>
                    
                    <!-- Badge -->
                    <div 
                      v-if="item.badge" 
                      class="badge badge-sm"
                      :class="getBadgeClass(item.badge.color)"
                    >
                      {{ item.badge.text }}
                    </div>
                  </NuxtLink>
                </div>
                
                <!-- Expandable Item -->
                <div v-else>
                  <button
                    @click="toggleExpanded(item.id)"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors group w-full"
                    :class="{ 'bg-base-300': isExpanded(item.id) }"
                  >
                    <svg 
                      class="w-5 h-5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        :d="item.icon"
                      />
                    </svg>
                    <span class="flex-1 text-sm font-medium text-left">{{ item.title }}</span>
                    
                    <!-- Expand/Collapse Icon -->
                    <svg
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': isExpanded(item.id) }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <!-- Submenu -->
                  <div v-if="isExpanded(item.id)" class="ml-8 mt-2 space-y-1">
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.id"
                      :to="child.path"
                      class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors text-sm"
                      :class="{ 'bg-primary text-primary-content': isActive(child.path) }"
                    >
                      <svg 
                        class="w-4 h-4 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          :d="child.icon"
                        />
                      </svg>
                      <span>{{ child.title }}</span>
                      
                      <!-- Badge -->
                      <div 
                        v-if="child.badge" 
                        class="badge badge-xs ml-auto"
                        :class="getBadgeClass(child.badge.color)"
                      >
                        {{ child.badge.text }}
                      </div>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- User Info Footer -->
      <div class="mt-auto pt-4 border-t border-base-300">
        <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-10">
              <span class="text-sm">{{ getInitials(user?.name) }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ user?.name || 'User' }}</div>
            <div class="text-sm text-base-content/70 truncate">{{ user?.role || 'Employee' }}</div>
          </div>
          <div class="dropdown dropdown-end">
            <button tabindex="0" class="btn btn-ghost btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li v-if="canAccessModule('profile')">
                <NuxtLink to="/profile">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NuxtLink>
              </li>
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
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useMenuConfig } from '~/composables/useMenuConfig'
import { usePermissions } from '~/composables/usePermissions'

const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Menu configuration
const { getFilteredMenuConfig } = useMenuConfig()
const { canAccessModule } = usePermissions()

// Reactive data
const expandedItems = ref<string[]>([])

// Computed
const filteredMenuConfig = computed(() => getFilteredMenuConfig())

// Methods
const isActive = (path?: string): boolean => {
  if (!path) return false
  
  // Handle query parameters
  const [basePath, query] = path.split('?')
  const currentPath = route.path
  
  if (query) {
    const queryParams = new URLSearchParams(query)
    const currentQuery = route.query
    
    // Check if base path matches and query parameters match
    if (basePath === currentPath) {
      for (const [key, value] of queryParams) {
        if (currentQuery[key] !== value) return false
      }
      return true
    }
  }
  
  return currentPath === basePath
}

const isExpanded = (itemId: string): boolean => {
  return expandedItems.value.includes(itemId)
}

const toggleExpanded = (itemId: string): void => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
  }
}

const getBadgeClass = (color: string): string => {
  const colorMap = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info'
  }
  return colorMap[color] || 'badge-neutral'
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const logout = async () => {
  await authStore.logout()
}

// Auto-expand parent items for active children
watchEffect(() => {
  const currentPath = route.path
  
  for (const section of filteredMenuConfig.value) {
    for (const item of section.items) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => isActive(child.path))
        if (hasActiveChild && !isExpanded(item.id)) {
          expandedItems.value.push(item.id)
        }
      }
    }
  }
})
</script>

<style scoped>
.sidebar-menu {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dropdown-content {
  z-index: 1000;
}

/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* Hover effects */
.group:hover .w-5 {
  transform: scale(1.1);
}

/* Active state styling */
.bg-primary {
  background-color: oklch(var(--p));
  color: oklch(var(--pc));
}

/* Scrollbar styling */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.2);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.3);
}
</style>