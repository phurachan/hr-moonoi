<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-base-content">User Role Management</h2>
      <button @click="refreshData" class="btn btn-outline btn-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-base-100 rounded-lg p-4">
      <div class="flex gap-4">
        <div class="form-control flex-1">
          <input
            v-model="userSearch"
            type="text"
            placeholder="Search users..."
            class="input input-bordered"
            @input="searchUsers"
          />
        </div>
        <div class="form-control">
          <select v-model="roleFilter" class="select select-bordered" @change="searchUsers">
            <option value="">All Roles</option>
            <option v-for="role in rolesStore.roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-base-100 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th class="text-base-content">User</th>
              <th class="text-base-content">Email</th>
              <th class="text-base-content">Current Roles</th>
              <th class="text-base-content">Status</th>
              <th class="text-base-content">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-8">
                <div class="loading loading-spinner loading-md"></div>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center py-8 text-base-content/60">
                No users found
              </td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary text-primary-content rounded-full w-8">
                      <span class="text-xs">{{ getInitials(user.name) }}</span>
                    </div>
                  </div>
                  <div class="font-medium text-base-content">{{ user.name }}</div>
                </div>
              </td>
              <td class="text-base-content">{{ user.email }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <div v-if="user.roles && user.roles.length > 0">
                    <div
                      v-for="role in user.roles"
                      :key="role.id"
                      class="badge badge-outline badge-sm"
                    >
                      {{ role.name }}
                    </div>
                  </div>
                  <div v-else class="text-base-content/60 text-sm">No roles assigned</div>
                </div>
              </td>
              <td>
                <div class="badge" :class="user.isActive ? 'badge-success' : 'badge-error'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <button @click="editUser(user)" class="btn btn-ghost btn-sm" title="Edit User">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </button>
                  <button @click="editUserRoles(user)" class="btn btn-ghost btn-sm" title="Edit Roles">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        :currentPage="pagination.currentPage.value"
        :totalPages="pagination.totalPages.value"
        :totalItems="pagination.totalItems.value"
        :pageSize="pagination.pageSize.value"
        @update:currentPage="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />
    </div>

    <!-- Edit User Roles Modal -->
    <div v-if="showUserRolesModal" class="modal modal-open">
      <div class="modal-box bg-base-100 text-base-content max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Edit User Roles - {{ selectedUser?.name }}</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Available Roles</span>
            </label>
            <div class="max-h-60 overflow-y-auto border border-base-300 rounded p-3">
              <div v-for="role in rolesStore.roles" :key="role.id" class="form-control">
                <label class="label cursor-pointer">
                  <div class="flex-1">
                    <span class="label-text text-base-content font-medium">{{ role.name }}</span>
                    <div class="text-xs text-base-content/60 mt-1">{{ role.description }}</div>
                  </div>
                  <input
                    type="checkbox"
                    class="checkbox"
                    :value="role.id"
                    v-model="selectedRoles"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div class="bg-base-200 rounded p-3">
            <h4 class="font-medium text-base-content mb-2">Selected Roles ({{ selectedRoles.length }})</h4>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="roleId in selectedRoles"
                :key="roleId"
                class="badge badge-primary"
              >
                {{ getRoleName(roleId) }}
              </div>
              <div v-if="selectedRoles.length === 0" class="text-base-content/60 text-sm">
                No roles selected
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="closeUserRolesModal" class="btn btn-ghost">Cancel</button>
          <button @click="saveUserRoles" class="btn btn-primary" :disabled="savingRoles">
            <span v-if="savingRoles" class="loading loading-spinner loading-sm"></span>
            Save Changes
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUserRolesModal"></div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showUserEditModal" class="modal modal-open">
      <div class="modal-box bg-base-100 text-base-content max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Edit User - {{ selectedUser?.name }}</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Name *</span>
            </label>
            <input
              v-model="userForm.name"
              type="text"
              class="input input-bordered"
              placeholder="Full name"
            />
            <div v-if="userFormErrors.name" class="label">
              <span class="label-text-alt text-error">{{ userFormErrors.name }}</span>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Email *</span>
            </label>
            <input
              v-model="userForm.email"
              type="email"
              class="input input-bordered"
              placeholder="Email address"
            />
            <div v-if="userFormErrors.email" class="label">
              <span class="label-text-alt text-error">{{ userFormErrors.email }}</span>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Department</span>
            </label>
            <input
              v-model="userForm.department"
              type="text"
              class="input input-bordered"
              placeholder="Department"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Position</span>
            </label>
            <input
              v-model="userForm.position"
              type="text"
              class="input input-bordered"
              placeholder="Job position"
            />
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-base-content">Active Status</span>
              <input
                type="checkbox"
                class="checkbox"
                v-model="userForm.isActive"
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Change Password</span>
              <span class="label-text-alt text-base-content/60">Leave empty to keep current password</span>
            </label>
            <input
              v-model="userForm.password"
              type="password"
              class="input input-bordered"
              placeholder="New password (optional)"
            />
            <div v-if="userFormErrors.password" class="label">
              <span class="label-text-alt text-error">{{ userFormErrors.password }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="closeUserEditModal" class="btn btn-ghost">Cancel</button>
          <button @click="saveUser" class="btn btn-primary" :disabled="savingUser">
            <span v-if="savingUser" class="loading loading-spinner loading-sm"></span>
            Save Changes
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUserEditModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

// Stores
const rolesStore = useRolesStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const savingRoles = ref(false)
const savingUser = ref(false)
const userSearch = ref('')
const roleFilter = ref('')
const users = ref([])
const showUserRolesModal = ref(false)
const showUserEditModal = ref(false)
const selectedUser = ref(null)
const selectedRoles = ref([])

// User edit form
const userForm = reactive({
  name: '',
  email: '',
  department: '',
  position: '',
  isActive: true,
  password: ''
})

const userFormErrors = reactive({
  name: '',
  email: '',
  password: ''
})

// Pagination
const pagination = usePagination(10)

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (userSearch.value) {
    const search = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => 
      user.roles && user.roles.some(role => role.id === roleFilter.value)
    )
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (pagination.currentPage.value - 1) * pagination.pageSize.value
  const end = start + pagination.pageSize.value
  return filteredUsers.value.slice(start, end)
})

// Watch for data changes to update pagination
watch(filteredUsers, (newUsers) => {
  pagination.totalItems.value = newUsers.length
  pagination.totalPages.value = Math.ceil(newUsers.length / pagination.pageSize.value)
  
  if (pagination.currentPage.value > pagination.totalPages.value && pagination.totalPages.value > 0) {
    pagination.currentPage.value = 1
  }
}, { immediate: true })

// Pagination handlers
const handlePageChange = (page) => {
  pagination.goToPage(page)
}

const handlePageSizeChange = (size) => {
  pagination.changePageSize(size)
}

// Methods
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getRoleName = (roleId) => {
  const role = rolesStore.roles.find(r => r.id === roleId)
  return role ? role.name : 'Unknown'
}

const searchUsers = () => {
  // Filter is handled by computed property
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = response.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

const fetchUserRoles = async (userId) => {
  try {
    const response = await $fetch(`/api/users/${userId}/roles`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    return response.data || []
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return []
  }
}

const editUserRoles = async (user) => {
  selectedUser.value = user
  
  // Ensure roles are loaded
  if (rolesStore.roles.length === 0) {
    await rolesStore.fetchRoles()
  }
  
  // Check if roles are available
  if (rolesStore.roles.length === 0) {
    alert('No roles available. Please create roles first in the Roles tab.')
    return
  }
  
  // Fetch current roles for the user
  const currentRoles = await fetchUserRoles(user.id)
  console.log('Current roles for user:', currentRoles)
  console.log('Available roles:', rolesStore.roles)
  selectedRoles.value = currentRoles.filter(role => role && role.id).map(role => role.id)
  console.log('Selected role IDs:', selectedRoles.value)
  
  showUserRolesModal.value = true
}

const closeUserRolesModal = () => {
  showUserRolesModal.value = false
  selectedUser.value = null
  selectedRoles.value = []
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return
  
  savingRoles.value = true
  try {
    // Filter out any null/undefined values
    const validRoleIds = selectedRoles.value.filter(id => id != null && id !== '')
    
    console.log('Saving roles:', validRoleIds)
    
    await $fetch(`/api/users/${selectedUser.value.id}/roles`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        roleIds: validRoleIds
      }
    })
    
    // Update the user's roles in the local data
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (userIndex !== -1) {
      const updatedRoles = selectedRoles.value.map(roleId => 
        rolesStore.roles.find(r => r.id === roleId)
      ).filter(Boolean)
      users.value[userIndex].roles = updatedRoles
    }
    
    closeUserRolesModal()
  } catch (error) {
    console.error('Error saving user roles:', error)
  } finally {
    savingRoles.value = false
  }
}

const refreshData = async () => {
  await Promise.all([
    fetchUsers(),
    rolesStore.fetchRoles()
  ])
}

// User editing methods
const validateUserForm = () => {
  let isValid = true
  
  // Reset errors
  userFormErrors.name = ''
  userFormErrors.email = ''
  userFormErrors.password = ''
  
  // Validate name
  if (!userForm.name.trim()) {
    userFormErrors.name = 'Name is required'
    isValid = false
  }
  
  // Validate email
  if (!userForm.email.trim()) {
    userFormErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
    userFormErrors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Validate password (only if provided)
  if (userForm.password && userForm.password.length < 6) {
    userFormErrors.password = 'Password must be at least 6 characters long'
    isValid = false
  }
  
  return isValid
}

const editUser = (user) => {
  selectedUser.value = user
  
  // Populate form with user data
  Object.assign(userForm, {
    name: user.name || '',
    email: user.email || '',
    department: user.department || '',
    position: user.position || '',
    isActive: user.isActive !== false,
    password: ''
  })
  
  // Reset errors
  Object.assign(userFormErrors, {
    name: '',
    email: '',
    password: ''
  })
  
  showUserEditModal.value = true
}

const closeUserEditModal = () => {
  showUserEditModal.value = false
  selectedUser.value = null
  
  // Reset form
  Object.assign(userForm, {
    name: '',
    email: '',
    department: '',
    position: '',
    isActive: true,
    password: ''
  })
  
  // Reset errors
  Object.assign(userFormErrors, {
    name: '',
    email: '',
    password: ''
  })
}

const saveUser = async () => {
  if (!selectedUser.value) return
  
  if (!validateUserForm()) {
    return
  }
  
  savingUser.value = true
  try {
    const updateData = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      department: userForm.department.trim(),
      position: userForm.position.trim(),
      isActive: userForm.isActive
    }
    
    // Only include password if it's provided
    if (userForm.password.trim()) {
      updateData.password = userForm.password.trim()
    }
    
    console.log('Updating user with data:', updateData)
    
    const response = await $fetch(`/api/users/${selectedUser.value.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: updateData
    })
    
    // Update the user in the local data
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (userIndex !== -1) {
      users.value[userIndex] = { ...users.value[userIndex], ...updateData }
    }
    
    closeUserEditModal()
    
    // Show success message
    console.log('User updated successfully:', response)
    
  } catch (error) {
    console.error('Error updating user:', error)
    
    // Handle validation errors from server
    if (error.status === 400 && error.data?.errors) {
      const serverErrors = error.data.errors
      if (serverErrors.name) userFormErrors.name = serverErrors.name
      if (serverErrors.email) userFormErrors.email = serverErrors.email
      if (serverErrors.password) userFormErrors.password = serverErrors.password
    } else {
      alert('Failed to update user. Please try again.')
    }
  } finally {
    savingUser.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await refreshData()
})
</script>