import { defineStore } from 'pinia'

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface RoleFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchRoles = async (filters: RoleFilters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (filters.search) query.append('search', filters.search)
      if (filters.isActive !== undefined) query.append('isActive', filters.isActive.toString())
      if (filters.page) query.append('page', filters.page.toString())
      if (filters.limit) query.append('limit', filters.limit.toString())
      
      const response = await $fetch(`/api/roles?${query.toString()}`)
      
      roles.value = response.roles
      pagination.value = response.pagination
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch roles'
      console.error('Error fetching roles:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRole = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/roles/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch role'
      console.error('Error fetching role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/roles', {
        method: 'POST',
        body: roleData
      })
      
      // Add the new role to the list
      roles.value.unshift(response.data)
      pagination.value.total += 1
      
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create role'
      console.error('Error creating role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (id: string, roleData: Partial<Role>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/roles/${id}`, {
        method: 'PUT',
        body: roleData
      })
      
      // Update the role in the list
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = response.data
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update role'
      console.error('Error updating role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/roles/${id}`, {
        method: 'DELETE'
      })
      
      // Remove the role from the list
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value.splice(index, 1)
        pagination.value.total -= 1
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete role'
      console.error('Error deleting role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    roles: readonly(roles),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    clearError
  }
})