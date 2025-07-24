<template>
  <div class="breadcrumbs text-sm">
    <ul>
      <li v-for="(item, index) in breadcrumbItems" :key="item.id">
        <NuxtLink 
          v-if="item.path && index < breadcrumbItems.length - 1"
          :to="item.path"
          class="link link-hover"
        >
          <svg 
            class="w-4 h-4 mr-2" 
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
          {{ item.title }}
        </NuxtLink>
        <span v-else class="flex items-center">
          <svg 
            class="w-4 h-4 mr-2" 
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
          {{ item.title }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useMenuConfig } from '~/composables/useMenuConfig'

const route = useRoute()
const { getBreadcrumbs } = useMenuConfig()

// Computed breadcrumbs
const breadcrumbItems = computed(() => {
  const breadcrumbs = getBreadcrumbs(route.path)
  
  // Add home/dashboard if not already there
  if (breadcrumbs.length > 0 && breadcrumbs[0].id !== 'dashboard') {
    breadcrumbs.unshift({
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0zM8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z',
      path: '/dashboard'
    })
  }
  
  return breadcrumbs
})
</script>