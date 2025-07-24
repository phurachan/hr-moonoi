<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p class="text-gray-400">Your privacy and data protection information</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>
        <p class="text-gray-400 mb-6">This privacy policy page is currently under development.</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>Our privacy policy will cover:</p>
          <ul class="list-disc list-inside space-y-1 mt-4">
            <li>Data collection and usage</li>
            <li>Information security measures</li>
            <li>Third-party integrations</li>
            <li>User rights and controls</li>
            <li>Cookie policy</li>
            <li>Contact information for privacy concerns</li>
          </ul>
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
</template>

<script setup lang="ts">
// Set page title
useHead({
  title: 'Privacy Policy - Manager'
})
</script>