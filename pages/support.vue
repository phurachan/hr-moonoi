<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">Support</h1>
        <p class="text-gray-400">Get help and support for Manager</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-semibold text-white mb-4">Support Center</h2>
        <p class="text-gray-400 mb-6">Our support center is currently under development.</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>Our support center will provide:</p>
          <ul class="list-disc list-inside space-y-1 mt-4">
            <li>Help documentation</li>
            <li>Frequently asked questions</li>
            <li>Contact information</li>
            <li>Tutorial videos</li>
            <li>Feature guides</li>
            <li>Technical support</li>
          </ul>
        </div>
        
        <div class="mt-8 space-y-4">
          <p class="text-gray-400">For immediate support needs, please contact:</p>
          <div class="space-y-2">
            <p class="text-white">Email: support@hr-moonoi.com</p>
            <p class="text-white">Phone: +1 (555) 123-4567</p>
          </div>
          
          <div class="mt-8">
            <NuxtLink to="/dashboard" class="btn btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page title
useHead({
  title: 'Support - Manager'
})
</script>