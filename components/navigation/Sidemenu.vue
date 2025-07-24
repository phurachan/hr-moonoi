<template>
  <aside class="w-64 min-h-full bg-base-100 shadow-xl">
    <div class="sidebar-menu p-4">
      <div class="flex items-center gap-2 mb-8">
        <img 
          src="/images/logo-moonoi.png" 
          alt="Manager" 
          class="h-8 w-auto"
        />
        <span class="text-lg font-bold">Manager</span>
      </div>
      
      <ul class="space-y-2">
        <li v-if="canAccessModule('dashboard')">
          <NuxtLink 
            to="/dashboard" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0zM8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z"></path>
            </svg>
            Dashboard
          </NuxtLink>
        </li>
        
        <li v-if="canAccessModule('employees')">
          <NuxtLink 
            to="/employees" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Employees
          </NuxtLink>
        </li>
        
        <li v-if="canAccessModule('timesheets')">
          <NuxtLink 
            to="/timesheets" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Timesheets
          </NuxtLink>
        </li>
        
        <!-- Leave Management - My Leaves (Only for employees) -->
        <li v-if="hasPermission('leaves.read') && user?.role === 'employee'">
          <NuxtLink 
            to="/leaves" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            My Leaves
          </NuxtLink>
        </li>
        
        <!-- Leave Management - HR -->
        <li v-if="hasPermission('leaves.hr_view')">
          <NuxtLink 
            to="/leaves/hr" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            Leave Management
          </NuxtLink>
        </li>
        
        <!-- HR Management as standalone menu -->
        <li v-if="hasPermission('timesheets.hr_view')">
          <NuxtLink 
            to="/timesheets/hr" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            HR Management
          </NuxtLink>
        </li>
        
        <!-- Customers section -->
        <li v-if="canAccessModule('customers')">
          <NuxtLink 
            to="/customers" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Customers
          </NuxtLink>
        </li>

        <!-- Invoices section -->
        <li v-if="canAccessModule('invoices')">
          <NuxtLink 
            to="/reports/invoices" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            Invoices
          </NuxtLink>
        </li>

        <!-- Income/Expense section -->
        <li v-if="canAccessModule('income_expense')">
          <NuxtLink 
            to="/income-expense" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Income/Expense
          </NuxtLink>
        </li>
        
        <li v-if="canAccessModule('settings') || canAccessModule('employees') || canAccessModule('timesheets') || canAccessModule('invoices') || canAccessModule('customers') || canAccessModule('income_expense')" class="mt-8">
          <div class="divider"></div>
        </li>
        
        <li v-if="canAccessModule('settings')">
          <NuxtLink 
            to="/settings" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </NuxtLink>
        </li>
        
        <li v-if="canAccessModule('profile')">
          <NuxtLink 
            to="/profile" 
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors" 
            active-class="bg-primary text-primary-content"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Profile
          </NuxtLink>
        </li>
      </ul>
      
      <!-- <div class="mt-auto pt-4">
        <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg">
          <div class="avatar">
            <div class="w-10 rounded-full">
              <img :src="user?.avatar || '/images/user-avatar.png'" :alt="user?.name || 'User'" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ user?.name || 'User' }}</div>
            <div class="text-sm text-base-content/70 truncate">{{ user?.role || 'Employee' }}</div>
          </div>
          <button @click="logout" class="btn btn-ghost btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div> -->
    </div>
  </aside>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Use permissions composable
const { hasPermission, canAccessModule } = usePermissions()

const logout = async () => {
  await authStore.logout()
}
</script>