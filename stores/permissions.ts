import { defineStore } from 'pinia'

export interface Permission {
  id: string
  name: string
  description: string
  module: string
  action: string
  resource: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PermissionFilters {
  search?: string
  module?: string
  action?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export const usePermissionsStore = defineStore('permissions', () => {
  const permissions = ref<Permission[]>([])
  const modules = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchPermissions = async (filters: PermissionFilters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (filters.search) query.append('search', filters.search)
      if (filters.module) query.append('module', filters.module)
      if (filters.action) query.append('action', filters.action)
      if (filters.isActive !== undefined) query.append('isActive', filters.isActive.toString())
      if (filters.page) query.append('page', filters.page.toString())
      if (filters.limit) query.append('limit', filters.limit.toString())
      
      const response = await $fetch(`/api/permissions?${query.toString()}`)
      
      permissions.value = response.permissions
      pagination.value = response.pagination
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch permissions'
      console.error('Error fetching permissions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchModules = async () => {
    try {
      const response = await $fetch('/api/permissions/modules')
      modules.value = response.data
    } catch (err: any) {
      console.error('Error fetching modules:', err)
    }
  }

  const fetchPermission = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/permissions/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch permission'
      console.error('Error fetching permission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/permissions', {
        method: 'POST',
        body: permissionData
      })
      
      // Add the new permission to the list
      permissions.value.unshift(response.data)
      pagination.value.total += 1
      
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create permission'
      console.error('Error creating permission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePermission = async (id: string, permissionData: Partial<Permission>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/permissions/${id}`, {
        method: 'PUT',
        body: permissionData
      })
      
      // Update the permission in the list
      const index = permissions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        permissions.value[index] = response.data
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update permission'
      console.error('Error updating permission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/permissions/${id}`, {
        method: 'DELETE'
      })
      
      // Remove the permission from the list
      const index = permissions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        permissions.value.splice(index, 1)
        pagination.value.total -= 1
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete permission'
      console.error('Error deleting permission:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    permissions: readonly(permissions),
    modules: readonly(modules),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    fetchPermissions,
    fetchModules,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,
    clearError
  }
})