<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p class="text-gray-400">Legal terms and conditions for using our service</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-semibold text-white mb-4">Terms of Service</h2>
        <p class="text-gray-400 mb-6">Our terms of service document is currently under development.</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>Our terms of service will include:</p>
          <ul class="list-disc list-inside space-y-1 mt-4">
            <li>Service usage guidelines</li>
            <li>User responsibilities</li>
            <li>Account terms and conditions</li>
            <li>Intellectual property rights</li>
            <li>Service availability and limitations</li>
            <li>Dispute resolution procedures</li>
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
  title: 'Terms of Service - Manager'
})
</script>