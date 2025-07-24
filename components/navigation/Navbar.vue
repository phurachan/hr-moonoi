<template>
  <nav class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <!-- <div class="flex-none lg:hidden">
        <label for="drawer-toggle" class="btn btn-square btn-ghost">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>
      <NuxtLink to="/" class="btn btn-ghost text-xl font-bold">HR Moonoi</NuxtLink> -->
    </div>
    
    <!-- <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><NuxtLink to="/dashboard" class="hover:bg-base-300">Dashboard</NuxtLink></li>
        <li><NuxtLink to="/employees" class="hover:bg-base-300">Employees</NuxtLink></li>
        <li><NuxtLink to="/departments" class="hover:bg-base-300">Departments</NuxtLink></li>
        <li><NuxtLink to="/attendance" class="hover:bg-base-300">Attendance</NuxtLink></li>
        <li><NuxtLink to="/payroll" class="hover:bg-base-300">Payroll</NuxtLink></li>
      </ul>
    </div> -->
    
    <div class="navbar-end">
      <ClientOnly>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost normal-case gap-2 px-3">
            <!-- Avatar -->
            <div class="avatar">
              <div class="w-8 h-8 rounded-full">
                <img :src="user?.avatar || '/images/user-avatar.png'" :alt="user?.name || 'User'" />
              </div>
            </div>
            <!-- User Info Text -->
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium">{{ user?.name || 'User' }}</span>
              <span class="text-xs text-base-content/70 capitalize">{{ user?.role || 'Employee' }}</span>
            </div>
            <!-- Dropdown arrow -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li class="menu-title">
              <span>{{ user?.name || 'User' }}</span>
              <span class="text-xs text-base-content/70 capitalize">{{ user?.role || 'Employee' }}</span>
            </li>
            <li><hr class="my-1"></li>
            <li v-if="hasPermission('profile.access')"><NuxtLink to="/profile">Profile</NuxtLink></li>
            <li v-if="hasPermission('settings.access')"><NuxtLink to="/settings">Settings</NuxtLink></li>
            <li><hr class="my-1"></li>
            <li><a @click="logout" class="text-red-500">Logout</a></li>
          </ul>
        </div>
        <template #fallback>
          <div class="btn btn-ghost normal-case gap-2 px-3">
            <div class="avatar">
              <div class="w-8 h-8 rounded-full">
                <img src="/images/user-avatar.png" alt="User" />
              </div>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium">Loading...</span>
              <span class="text-xs text-base-content/70">User</span>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </nav>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Use permissions composable
const { hasPermission } = usePermissions()

const logout = async () => {
  await authStore.logout()
}
</script>