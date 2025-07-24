<template>
  <div class="min-h-screen bg-base-200">
    <div class="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content flex flex-col">
        <NavigationNavbar />

        <main class="flex-1 p-4">
          <slot />
        </main>
        
        <LayoutFooter />
      </div>
      
      <div class="drawer-side">
        <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
        <NavigationSidemenu />
      </div>
    </div>
    
    <ModalsGlobalModal />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>