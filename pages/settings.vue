<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Settings</h1>
        <p class="text-gray-300 mt-2">Manage roles, permissions, and user access</p>
      </div>
      <NuxtLink to="/dashboard" class="btn btn-outline">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs tabs-boxed mb-8 bg-gray-800">
      <!-- Roles Tab - only show if user has settings.roles permission -->
      <a 
        v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-roles'))"
        class="tab" 
        :class="{ 'tab-active': activeTab === 'roles' }" 
        @click="activeTab = 'roles'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        Roles
      </a>
      
      <!-- Permissions Tab - only show if user has settings.roles permission (since permissions are part of roles management) -->
      <a 
        v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-roles'))"
        class="tab" 
        :class="{ 'tab-active': activeTab === 'permissions' }" 
        @click="activeTab = 'permissions'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        Permissions
      </a>
      
      <!-- User Roles Tab - only show if user has settings.user_roles permission -->
      <a 
        v-if="menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-users'))"
        class="tab" 
        :class="{ 'tab-active': activeTab === 'users' }" 
        @click="activeTab = 'users'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        User Roles
      </a>
    </div>

    <!-- Roles Tab -->
    <div v-if="activeTab === 'roles' && menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-roles'))" class="space-y-6">
      <!-- Roles Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white">Roles Management</h2>
        <button @click="openRoleModal()" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Role
        </button>
      </div>

      <!-- Roles Search -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex gap-4">
          <div class="form-control flex-1">
            <input
              v-model="roleSearch"
              type="text"
              placeholder="Search roles..."
              class="input input-bordered"
              @input="searchRoles"
            />
          </div>
          <div class="form-control">
            <select v-model="roleStatusFilter" class="select select-bordered" @change="searchRoles">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Roles Table -->
      <div class="bg-gray-800 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="text-gray-300">Name</th>
                <th class="text-gray-300">Description</th>
                <th class="text-gray-300">Permissions</th>
                <th class="text-gray-300">Status</th>
                <th class="text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rolesStore.loading">
                <td colspan="5" class="text-center py-8">
                  <div class="loading loading-spinner loading-md"></div>
                </td>
              </tr>
              <tr v-else-if="rolesStore.roles.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">
                  No roles found
                </td>
              </tr>
              <tr v-else v-for="role in rolesStore.roles" :key="role.id">
                <td class="font-medium text-white">{{ role.name }}</td>
                <td class="text-gray-300">{{ role.description }}</td>
                <td class="text-gray-300">{{ role.permissions.length }} permissions</td>
                <td>
                  <div class="badge" :class="role.isActive ? 'badge-success' : 'badge-error'">
                    {{ role.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editRole(role)" class="btn btn-ghost btn-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deleteRole(role)" class="btn btn-ghost btn-sm text-red-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <BasePagination
          :currentPage="rolesStore.pagination.page"
          :totalPages="rolesStore.pagination.pages"
          :totalItems="rolesStore.pagination.total"
          :pageSize="rolesStore.pagination.limit"
          @update:currentPage="handleRolesPageChange"
          @update:pageSize="handleRolesPageSizeChange"
        />
      </div>
    </div>

    <!-- Permissions Tab -->
    <div v-if="activeTab === 'permissions' && menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-roles'))" class="space-y-6">
      <!-- Permissions Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white">Permissions Management</h2>
        <button @click="openPermissionModal()" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Permission
        </button>
      </div>

      <!-- Permissions Search -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-control">
            <input
              v-model="permissionSearch"
              type="text"
              placeholder="Search permissions..."
              class="input input-bordered"
              @input="searchPermissions"
            />
          </div>
          <div class="form-control">
            <select v-model="permissionModuleFilter" class="select select-bordered" @change="searchPermissions">
              <option value="">All Modules</option>
              <option v-for="module in permissionsStore.modules" :key="module" :value="module">
                {{ module }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <select v-model="permissionActionFilter" class="select select-bordered" @change="searchPermissions">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="access">Access</option>
            </select>
          </div>
          <div class="form-control">
            <select v-model="permissionStatusFilter" class="select select-bordered" @change="searchPermissions">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Permissions Table -->
      <div class="bg-gray-800 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="text-gray-300">Name</th>
                <th class="text-gray-300">Module</th>
                <th class="text-gray-300">Action</th>
                <th class="text-gray-300">Resource</th>
                <th class="text-gray-300">Status</th>
                <th class="text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="permissionsStore.loading">
                <td colspan="6" class="text-center py-8">
                  <div class="loading loading-spinner loading-md"></div>
                </td>
              </tr>
              <tr v-else-if="permissionsStore.permissions.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400">
                  No permissions found
                </td>
              </tr>
              <tr v-else v-for="permission in permissionsStore.permissions" :key="permission.id">
                <td class="font-medium text-white">{{ permission.name }}</td>
                <td class="text-gray-300">{{ permission.module }}</td>
                <td>
                  <div class="badge badge-outline">{{ permission.action }}</div>
                </td>
                <td class="text-gray-300">{{ permission.resource }}</td>
                <td>
                  <div class="badge" :class="permission.isActive ? 'badge-success' : 'badge-error'">
                    {{ permission.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editPermission(permission)" class="btn btn-ghost btn-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="deletePermission(permission)" class="btn btn-ghost btn-sm text-red-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <BasePagination
          :currentPage="permissionsStore.pagination.page"
          :totalPages="permissionsStore.pagination.pages"
          :totalItems="permissionsStore.pagination.total"
          :pageSize="permissionsStore.pagination.limit"
          @update:currentPage="handlePermissionsPageChange"
          @update:pageSize="handlePermissionsPageSizeChange"
        />
      </div>
    </div>

    <!-- User Roles Tab -->
    <div v-if="activeTab === 'users' && menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-users'))" class="space-y-6">
      <EmployeeUserRoleManagement />
    </div>

    <!-- Role Modal -->
    <div v-if="showRoleModal" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h3 class="font-bold text-lg mb-4">{{ editingRole ? 'Edit Role' : 'Add Role' }}</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Name</span>
            </label>
            <input
              v-model="roleForm.name"
              type="text"
              class="input input-bordered"
              placeholder="Role name"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Description</span>
            </label>
            <textarea
              v-model="roleForm.description"
              class="textarea textarea-bordered"
              placeholder="Role description"
            ></textarea>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Permissions</span>
              <span class="label-text-alt text-gray-400">{{ Object.keys(groupedPermissions).length }} modules, {{ permissionsStore.permissions.length }} total permissions</span>
            </label>
            <div class="max-h-80 overflow-y-auto border border-gray-600 rounded p-3">
              <div v-for="(permissions, module) in groupedPermissions" :key="module" class="mb-4">
                <div class="flex items-center justify-between mb-2 border-b border-gray-600 pb-1">
                  <h4 class="font-semibold text-white capitalize">
                    {{ module }} ({{ permissions.length }})
                  </h4>
                  <div class="flex gap-1">
                    <button 
                      v-if="!isAllModulePermissionsSelected(permissions)"
                      @click="selectAllPermissionsInModule(module, permissions)"
                      class="btn btn-xs btn-primary"
                      type="button"
                    >
                      Select All
                    </button>
                    <button 
                      v-if="isSomeModulePermissionsSelected(permissions)"
                      @click="deselectAllPermissionsInModule(module, permissions)"
                      class="btn btn-xs btn-ghost"
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-1">
                  <div v-for="permission in permissions" :key="permission.id" class="form-control">
                    <label class="label cursor-pointer py-1">
                      <span class="label-text text-gray-300 text-sm">{{ permission.name }}</span>
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        :value="permission.name"
                        v-model="roleForm.permissions"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- No permissions message -->
              <div v-if="Object.keys(groupedPermissions).length === 0" class="text-center py-8 text-gray-400">
                No permissions available. Please ensure permissions are properly loaded.
              </div>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-gray-300">Active</span>
              <input
                type="checkbox"
                class="checkbox"
                v-model="roleForm.isActive"
              />
            </label>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="closeRoleModal" class="btn btn-ghost">Cancel</button>
          <button @click="saveRole" class="btn btn-primary" :disabled="rolesStore.loading">
            <span v-if="rolesStore.loading" class="loading loading-spinner loading-sm"></span>
            {{ editingRole ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeRoleModal"></div>
    </div>

    <!-- Permission Modal -->
    <div v-if="showPermissionModal" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h3 class="font-bold text-lg mb-4">{{ editingPermission ? 'Edit Permission' : 'Add Permission' }}</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Name</span>
            </label>
            <input
              v-model="permissionForm.name"
              type="text"
              class="input input-bordered"
              placeholder="Permission name"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Description</span>
            </label>
            <textarea
              v-model="permissionForm.description"
              class="textarea textarea-bordered"
              placeholder="Permission description"
            ></textarea>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Module</span>
            </label>
            <input
              v-model="permissionForm.module"
              type="text"
              class="input input-bordered"
              placeholder="Module name"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Action</span>
            </label>
            <select v-model="permissionForm.action" class="select select-bordered">
              <option value="">Select action</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="access">Access</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Resource</span>
            </label>
            <input
              v-model="permissionForm.resource"
              type="text"
              class="input input-bordered"
              placeholder="Resource name"
            />
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-gray-300">Active</span>
              <input
                type="checkbox"
                class="checkbox"
                v-model="permissionForm.isActive"
              />
            </label>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="closePermissionModal" class="btn btn-ghost">Cancel</button>
          <button @click="savePermission" class="btn btn-primary" :disabled="permissionsStore.loading">
            <span v-if="permissionsStore.loading" class="loading loading-spinner loading-sm"></span>
            {{ editingPermission ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closePermissionModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'
import { usePermissionsStore } from '~/stores/permissions'
import { useAuthStore } from '~/stores/auth'
import { useMenuConfig } from '~/composables/useMenuConfig'

// Check authentication
const authStore = useAuthStore()
if (!authStore.isAuthenticated) {
  await navigateTo('/login')
}

// Stores and composables
const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const menuConfig = useMenuConfig()

// Reactive data - set default tab based on permissions
const getDefaultTab = () => {
  if (menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-roles'))) {
    return 'roles'
  } else if (menuConfig.isMenuItemAccessible(menuConfig.getMenuItemById('settings-users'))) {
    return 'users'
  }
  return 'roles' // fallback
}

const activeTab = ref(getDefaultTab())

// Role management
const showRoleModal = ref(false)
const editingRole = ref(null)
const roleSearch = ref('')
const roleStatusFilter = ref('')
const roleForm = reactive({
  name: '',
  description: '',
  permissions: [],
  isActive: true
})

// Permission management
const showPermissionModal = ref(false)
const editingPermission = ref(null)
const permissionSearch = ref('')
const permissionModuleFilter = ref('')
const permissionActionFilter = ref('')
const permissionStatusFilter = ref('')
const permissionForm = reactive({
  name: '',
  description: '',
  module: '',
  action: '',
  resource: '',
  isActive: true
})

// Computed properties
const groupedPermissions = computed(() => {
  if (!permissionsStore.permissions.length) return {}
  
  return permissionsStore.permissions.reduce((groups, permission) => {
    const module = permission.module || 'other'
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(permission)
    return groups
  }, {})
})

// Helper functions for permission management
const selectAllPermissionsInModule = (module, permissions) => {
  const permissionNames = permissions.map(p => p.name)
  // Add all permissions from this module if not already present
  permissionNames.forEach(permName => {
    if (!roleForm.permissions.includes(permName)) {
      roleForm.permissions.push(permName)
    }
  })
}

const deselectAllPermissionsInModule = (module, permissions) => {
  const permissionNames = permissions.map(p => p.name)
  // Remove all permissions from this module
  roleForm.permissions = roleForm.permissions.filter(permName => 
    !permissionNames.includes(permName)
  )
}

const isAllModulePermissionsSelected = (permissions) => {
  return permissions.every(p => roleForm.permissions.includes(p.name))
}

const isSomeModulePermissionsSelected = (permissions) => {
  return permissions.some(p => roleForm.permissions.includes(p.name))
}

// Pagination handlers
const handleRolesPageChange = async (page) => {
  await rolesStore.fetchRoles({
    search: roleSearch.value,
    isActive: roleStatusFilter.value ? roleStatusFilter.value === 'true' : undefined,
    page,
    limit: rolesStore.pagination.limit
  })
}

const handleRolesPageSizeChange = async (size) => {
  await rolesStore.fetchRoles({
    search: roleSearch.value,
    isActive: roleStatusFilter.value ? roleStatusFilter.value === 'true' : undefined,
    page: 1,
    limit: size
  })
}

const handlePermissionsPageChange = async (page) => {
  await permissionsStore.fetchPermissions({
    search: permissionSearch.value,
    module: permissionModuleFilter.value,
    action: permissionActionFilter.value,
    isActive: permissionStatusFilter.value ? permissionStatusFilter.value === 'true' : undefined,
    page,
    limit: permissionsStore.pagination.limit
  })
}

const handlePermissionsPageSizeChange = async (size) => {
  await permissionsStore.fetchPermissions({
    search: permissionSearch.value,
    module: permissionModuleFilter.value,
    action: permissionActionFilter.value,
    isActive: permissionStatusFilter.value ? permissionStatusFilter.value === 'true' : undefined,
    page: 1,
    limit: size
  })
}

// Role methods
const searchRoles = async () => {
  await rolesStore.fetchRoles({
    search: roleSearch.value,
    isActive: roleStatusFilter.value ? roleStatusFilter.value === 'true' : undefined,
    page: 1,
    limit: rolesStore.pagination.limit
  })
}

const openRoleModal = async (role = null) => {
  editingRole.value = role
  
  // Fetch all permissions without filters for the role modal
  await permissionsStore.fetchPermissions({
    page: 1,
    limit: 1000, // Get all permissions
    // No search or filters applied
  })
  
  if (role) {
    Object.assign(roleForm, {
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
      isActive: role.isActive
    })
  } else {
    Object.assign(roleForm, {
      name: '',
      description: '',
      permissions: [],
      isActive: true
    })
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
}

const saveRole = async () => {
  try {
    const roleData = {
      name: roleForm.name,
      description: roleForm.description,
      permissions: roleForm.permissions,
      isActive: roleForm.isActive,
      createdBy: authStore.user.id
    }

    if (editingRole.value) {
      if (!editingRole.value.id) {
        throw new Error('Role ID is required for update')
      }
      await rolesStore.updateRole(editingRole.value.id, roleData)
    } else {
      await rolesStore.createRole(roleData)
    }

    closeRoleModal()
  } catch (error) {
    console.error('Error saving role:', error)
  }
}

const editRole = async (role) => {
  await openRoleModal(role)
}

const deleteRole = async (role) => {
  if (!role.id) {
    console.error('Role ID is required for deletion')
    return
  }
  
  if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
    try {
      await rolesStore.deleteRole(role.id)
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }
}

// Permission methods
const searchPermissions = async () => {
  await permissionsStore.fetchPermissions({
    search: permissionSearch.value,
    module: permissionModuleFilter.value,
    action: permissionActionFilter.value,
    isActive: permissionStatusFilter.value ? permissionStatusFilter.value === 'true' : undefined,
    page: 1,
    limit: permissionsStore.pagination.limit
  })
}

const openPermissionModal = (permission = null) => {
  editingPermission.value = permission
  if (permission) {
    Object.assign(permissionForm, {
      name: permission.name,
      description: permission.description,
      module: permission.module,
      action: permission.action,
      resource: permission.resource,
      isActive: permission.isActive
    })
  } else {
    Object.assign(permissionForm, {
      name: '',
      description: '',
      module: '',
      action: '',
      resource: '',
      isActive: true
    })
  }
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  editingPermission.value = null
}

const savePermission = async () => {
  try {
    const permissionData = {
      name: permissionForm.name,
      description: permissionForm.description,
      module: permissionForm.module,
      action: permissionForm.action,
      resource: permissionForm.resource,
      isActive: permissionForm.isActive
    }

    if (editingPermission.value) {
      if (!editingPermission.value.id) {
        throw new Error('Permission ID is required for update')
      }
      await permissionsStore.updatePermission(editingPermission.value.id, permissionData)
    } else {
      await permissionsStore.createPermission(permissionData)
    }

    closePermissionModal()
  } catch (error) {
    console.error('Error saving permission:', error)
  }
}

const editPermission = (permission) => {
  openPermissionModal(permission)
}

const deletePermission = async (permission) => {
  if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
    try {
      await permissionsStore.deletePermission(permission.id)
    } catch (error) {
      console.error('Error deleting permission:', error)
    }
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    rolesStore.fetchRoles(),
    permissionsStore.fetchPermissions(),
    permissionsStore.fetchModules()
  ])
})

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'roles') {
    rolesStore.fetchRoles()
  } else if (newTab === 'permissions') {
    permissionsStore.fetchPermissions()
  }
})

// Set page title
useHead({
  title: 'Settings - Manager'
})
</script>