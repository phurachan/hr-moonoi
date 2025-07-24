import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export interface Task {
  title: string
  description?: string
  startTime: string
  endTime: string
  duration: number
  project?: string
  category: 'development' | 'meeting' | 'training' | 'support' | 'admin' | 'other'
  isOT?: boolean
}

export interface Timesheet {
  id: string
  employeeId: string
  employeeName: string
  date: string
  tasks: Task[]
  totalHours: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TimesheetSummary {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
}

export const useTimesheetsStore = defineStore('timesheets', {
  state: () => ({
    timesheets: [] as Timesheet[],
    currentTimesheet: null as Timesheet | null,
    loading: false,
    error: null as string | null,
    summary: null as TimesheetSummary | null,
    selectedDate: new Date().toISOString().split('T')[0],
    currentEmployeeId: '',
    filters: {
      startDate: '',
      endDate: '',
      status: '',
      employeeId: ''
    }
  }),

  getters: {
    timesheetsByDate: (state) => {
      const timesheetMap = new Map()
      state.timesheets.forEach(timesheet => {
        const date = new Date(timesheet.date).toISOString().split('T')[0]
        timesheetMap.set(date, timesheet)
      })
      return timesheetMap
    },
    
    getTimesheetByDate: (state) => (date: string) => {
      return state.timesheets.find(timesheet => 
        new Date(timesheet.date).toISOString().split('T')[0] === date
      )
    },
    
    currentWeekTimesheets: (state) => {
      const currentWeek = getCurrentWeekDates(state.selectedDate)
      return state.timesheets.filter(timesheet => {
        const timesheetDate = new Date(timesheet.date).toISOString().split('T')[0]
        return currentWeek.includes(timesheetDate)
      })
    },
    
    totalWeekHours: (state) => {
      const currentWeek = getCurrentWeekDates(state.selectedDate)
      return state.timesheets
        .filter(timesheet => {
          const timesheetDate = new Date(timesheet.date).toISOString().split('T')[0]
          return currentWeek.includes(timesheetDate)
        })
        .reduce((total, timesheet) => total + timesheet.totalHours, 0)
    }
  },

  actions: {
    async fetchTimesheets(params: any = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const query = new URLSearchParams()
        if (params.employeeId) query.append('employeeId', params.employeeId)
        if (params.startDate) query.append('startDate', params.startDate)
        if (params.endDate) query.append('endDate', params.endDate)
        if (params.status) query.append('status', params.status)
        
        const queryString = query.toString()
        const url = queryString ? `/api/timesheets?${queryString}` : '/api/timesheets'
        
        const response = await $fetch(url, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.timesheets = response.timesheets || response
      } catch (error) {
        this.error = 'Failed to fetch timesheets'
        console.error('Error fetching timesheets:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchEmployeeTimesheets(employeeId: string, startDate?: string, endDate?: string) {
      this.loading = true
      this.error = null
      this.currentEmployeeId = employeeId
      
      try {
        const authStore = useAuthStore()
        const query = new URLSearchParams()
        if (startDate) query.append('startDate', startDate)
        if (endDate) query.append('endDate', endDate)
        
        const queryString = query.toString()
        const url = queryString 
          ? `/api/timesheets/employee/${employeeId}?${queryString}`
          : `/api/timesheets/employee/${employeeId}`
        
        const response = await $fetch(url, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.timesheets = response.timesheets
        this.summary = response.summary
      } catch (error) {
        this.error = 'Failed to fetch employee timesheets'
        console.error('Error fetching employee timesheets:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTimesheetsByDateRange(startDate: string, endDate: string) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const query = new URLSearchParams()
        query.append('startDate', startDate)
        query.append('endDate', endDate)
        
        const response = await $fetch(`/api/timesheets?${query.toString()}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.timesheets = response.timesheets || response
      } catch (error) {
        this.error = 'Failed to fetch timesheets by date range'
        console.error('Error fetching timesheets by date range:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTimesheet(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const timesheet = await $fetch(`/api/timesheets/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.currentTimesheet = timesheet
        return timesheet
      } catch (error) {
        this.error = 'Failed to fetch timesheet'
        console.error('Error fetching timesheet:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTimesheet(timesheetData: Partial<Timesheet>) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const newTimesheet = await $fetch('/api/timesheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: timesheetData,
        })
        
        this.timesheets.unshift(newTimesheet)
        return newTimesheet
      } catch (error) {
        this.error = 'Failed to create timesheet'
        console.error('Error creating timesheet:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTimesheet(id: string, timesheetData: Partial<Timesheet>) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const updatedTimesheet = await $fetch(`/api/timesheets/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: timesheetData,
        })
        
        const index = this.timesheets.findIndex(t => t.id === id)
        if (index !== -1) {
          this.timesheets[index] = updatedTimesheet
        }
        
        if (this.currentTimesheet?.id === id) {
          this.currentTimesheet = updatedTimesheet
        }
        
        return updatedTimesheet
      } catch (error) {
        this.error = 'Failed to update timesheet'
        console.error('Error updating timesheet:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTimesheet(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        await $fetch(`/api/timesheets/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
        })
        
        this.timesheets = this.timesheets.filter(t => t.id !== id)
        
        if (this.currentTimesheet?.id === id) {
          this.currentTimesheet = null
        }
      } catch (error) {
        this.error = 'Failed to delete timesheet'
        console.error('Error deleting timesheet:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitTimesheet(id: string) {
      return this.updateTimesheet(id, { 
        status: 'submitted',
        submittedAt: new Date().toISOString()
      })
    },

    async approveTimesheet(id: string, approverId: string) {
      return this.updateTimesheet(id, { 
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date().toISOString()
      })
    },

    async rejectTimesheet(id: string, approverId: string) {
      return this.updateTimesheet(id, { 
        status: 'rejected',
        approvedBy: approverId,
        approvedAt: new Date().toISOString()
      })
    },

    setSelectedDate(date: string) {
      this.selectedDate = date
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        startDate: '',
        endDate: '',
        status: '',
        employeeId: ''
      }
    }
  }
})

// Helper function to get current week dates
function getCurrentWeekDates(selectedDate: string): string[] {
  const date = new Date(selectedDate)
  const currentDay = date.getDay()
  const startOfWeek = new Date(date)
  
  // Adjust to start of week (Sunday = 0)
  startOfWeek.setDate(date.getDate() - currentDay)
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek)
    weekDate.setDate(startOfWeek.getDate() + i)
    weekDates.push(weekDate.toISOString().split('T')[0])
  }
  
  return weekDates
}