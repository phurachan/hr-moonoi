<template>
  <footer class="footer footer-center p-4 bg-base-300 text-base-content">
    <div class="w-full max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="flex items-center gap-2 mb-2 md:mb-0">
          <img 
            src="/images/logo-moonoi.png" 
            alt="Manager" 
            class="h-6 w-auto"
          />
          <span class="font-semibold">Manager</span>
        </div>
        
        <div class="flex flex-col md:flex-row items-center gap-4 text-sm pl-4">
          <div class="flex gap-4">
            <NuxtLink to="/privacy" class="link link-hover">Privacy Policy</NuxtLink>
            <NuxtLink to="/terms" class="link link-hover">Terms of Service</NuxtLink>
            <NuxtLink to="/support" class="link link-hover">Support</NuxtLink>
          </div>
          
          <div class="flex items-center gap-2">
            <span>&copy; {{ currentYear }} Manager. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const { getCurrentYear } = useSSRSafeDate()
const currentYear = ref(getCurrentYear())
</script>