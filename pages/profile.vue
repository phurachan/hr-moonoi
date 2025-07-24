<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">Profile</h1>
        <p class="text-gray-400">Manage your user profile and account information</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-8 text-center">
        <div class="mb-6">
          <div class="avatar placeholder mb-4">
            <div class="bg-primary text-primary-content rounded-full w-20">
              <span class="text-2xl">{{ getInitials(user?.name || 'User') }}</span>
            </div>
          </div>
        </div>
        
        <h2 class="text-2xl font-semibold text-white mb-2">{{ user?.name || 'User' }}</h2>
        <p class="text-gray-400 mb-6">{{ user?.email || 'user@example.com' }}</p>
        
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        
        <p class="text-gray-400 mb-6">Profile management features are currently under development.</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>Future profile features will include:</p>
          <ul class="list-disc list-inside space-y-1 mt-4">
            <li>Edit personal information</li>
            <li>Change password</li>
            <li>Update profile picture</li>
            <li>Manage contact details</li>
            <li>Account preferences</li>
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
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Check authentication
if (!authStore.isAuthenticated) {
  await navigateTo('/login')
}

// Helper function to get initials
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Set page title
useHead({
  title: 'Profile - Manager'
})
</script>