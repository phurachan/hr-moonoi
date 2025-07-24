import { defineStore } from 'pinia'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'terminated'
  address: string
  birthDate: string
  emergencyContact: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    employees: [] as Employee[],
    selectedEmployee: null as Employee | null,
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    filters: {
      department: '',
      status: '',
      search: '',
    },
  }),

  getters: {
    filteredEmployees: (state) => {
      let filtered = [...state.employees]
      
      if (state.filters.department) {
        filtered = filtered.filter(emp => emp.department === state.filters.department)
      }
      
      if (state.filters.status) {
        filtered = filtered.filter(emp => emp.status === state.filters.status)
      }
      
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(emp => 
          emp.name.toLowerCase().includes(search) ||
          emp.email.toLowerCase().includes(search) ||
          emp.position.toLowerCase().includes(search)
        )
      }
      
      return filtered
    },
    
    departmentsList: (state) => {
      const departments = [...new Set(state.employees.map(emp => emp.department))]
      return departments.sort()
    },
    
    activeEmployeesCount: (state) => {
      return state.employees.filter(emp => emp.status === 'active').length
    },
  },

  actions: {
    async fetchEmployees() {
      this.loading = true
      this.error = null
      
      try {
        const query = new URLSearchParams()
        if (this.filters.search) query.append('search', this.filters.search)
        if (this.filters.department) query.append('department', this.filters.department)
        if (this.filters.status) query.append('status', this.filters.status)
        
        const queryString = query.toString()
        const url = queryString ? `/api/employees?${queryString}` : '/api/employees'
        
        const employees = await $fetch<Employee[]>(url)
        this.employees = employees
        this.pagination.total = employees.length
      } catch (error) {
        this.error = 'Failed to fetch employees'
        console.error('Error fetching employees:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchEmployee(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const employee = await $fetch(`/api/employees/${id}`)
        this.selectedEmployee = employee
        return employee
      } catch (error) {
        this.error = 'Failed to fetch employee'
        console.error('Error fetching employee:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      
      try {
        const newEmployee = await $fetch('/api/employees', {
          method: 'POST',
          body: employeeData,
        })
        
        this.employees.unshift(newEmployee)
        return newEmployee
      } catch (error) {
        this.error = 'Failed to create employee'
        console.error('Error creating employee:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateEmployee(id: string, employeeData: Partial<Employee>) {
      this.loading = true
      this.error = null
      
      try {
        const updatedEmployee = await $fetch(`/api/employees/${id}`, {
          method: 'PUT',
          body: employeeData,
        })
        
        const index = this.employees.findIndex(emp => emp.id === id)
        if (index !== -1) {
          this.employees[index] = updatedEmployee
        }
        
        if (this.selectedEmployee?.id === id) {
          this.selectedEmployee = updatedEmployee
        }
        
        return updatedEmployee
      } catch (error) {
        this.error = 'Failed to update employee'
        console.error('Error updating employee:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteEmployee(id: string) {
      this.loading = true
      this.error = null
      
      try {
        await $fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        })
        
        this.employees = this.employees.filter(emp => emp.id !== id)
        
        if (this.selectedEmployee?.id === id) {
          this.selectedEmployee = null
        }
      } catch (error) {
        this.error = 'Failed to delete employee'
        console.error('Error deleting employee:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1
      this.fetchEmployees()
    },

    clearFilters() {
      this.filters = {
        department: '',
        status: '',
        search: '',
      }
      this.pagination.page = 1
      this.fetchEmployees()
    },

    setPage(page: number) {
      this.pagination.page = page
      this.fetchEmployees()
    },

    async getEmployeeStats() {
      this.loading = true
      this.error = null
      
      try {
        const stats = await $fetch('/api/employees/stats')
        return stats
      } catch (error) {
        this.error = 'Failed to fetch employee statistics'
        console.error('Error fetching employee statistics:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async seedData() {
      this.loading = true
      this.error = null
      
      try {
        const result = await $fetch('/api/employees/seed', {
          method: 'POST'
        })
        
        // Refresh the employees list after seeding
        await this.fetchEmployees()
        
        return result
      } catch (error) {
        this.error = 'Failed to seed data'
        console.error('Error seeding data:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})