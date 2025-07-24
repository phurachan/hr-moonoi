import { defineStore } from 'pinia'
import type { ILeave } from '~/models/Leave'
import type { ILeaveBalance } from '~/models/LeaveBalance'

interface LeaveState {
  leaves: ILeave[]
  currentLeave: ILeave | null
  leaveBalances: ILeaveBalance[]
  currentBalance: ILeaveBalance | null
  stats: {
    overview: {
      totalLeaves: number
      pendingLeaves: number
      approvedLeaves: number
      rejectedLeaves: number
    }
    leavesByType: Array<{
      _id: string
      count: number
      totalDays: number
    }>
    recentLeaves: ILeave[]
    monthlyTrend: Array<{
      _id: number
      count: number
      totalDays: number
    }>
    leaveBalance: ILeaveBalance | null
  }
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useLeavesStore = defineStore('leaves', {
  state: (): LeaveState => ({
    leaves: [],
    currentLeave: null,
    leaveBalances: [],
    currentBalance: null,
    stats: {
      overview: {
        totalLeaves: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0
      },
      leavesByType: [],
      recentLeaves: [],
      monthlyTrend: [],
      leaveBalance: null
    },
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  }),

  getters: {
    pendingLeaves: (state) => state.leaves.filter(leave => leave.status === 'pending'),
    approvedLeaves: (state) => state.leaves.filter(leave => leave.status === 'approved'),
    rejectedLeaves: (state) => state.leaves.filter(leave => leave.status === 'rejected'),
    upcomingLeaves: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.leaves.filter(leave => 
        leave.status === 'approved' && leave.startDate >= today
      )
    },
    leaveTypes: () => [
      { value: 'annual', label: 'Annual Leave', color: 'success' },
      { value: 'sick', label: 'Sick Leave', color: 'warning' },
      { value: 'personal', label: 'Personal Leave', color: 'info' },
      { value: 'maternity', label: 'Maternity Leave', color: 'primary' },
      { value: 'paternity', label: 'Paternity Leave', color: 'primary' },
      { value: 'emergency', label: 'Emergency Leave', color: 'error' },
      { value: 'unpaid', label: 'Unpaid Leave', color: 'neutral' }
    ]
  },

  actions: {
    async fetchLeaves(params: any = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch('/api/leaves', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          query: params
        })
        
        this.leaves = response.leaves || []
        this.pagination = response.pagination || this.pagination
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch leaves'
        console.error('Error fetching leaves:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchLeave(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const leave = await $fetch(`/api/leaves/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        this.currentLeave = leave
        return leave
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch leave'
        console.error('Error fetching leave:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLeave(leaveData: any) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch('/api/leaves', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: leaveData
        })
        
        // Add to leaves array
        this.leaves.unshift(response.leave)
        
        return response
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to create leave request'
        console.error('Error creating leave:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLeave(id: string, updates: any) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch(`/api/leaves/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: updates
        })
        
        // Update in leaves array
        const index = this.leaves.findIndex(leave => leave.id === id)
        if (index !== -1) {
          this.leaves[index] = response.leave
        }
        
        // Update current leave if it's the same
        if (this.currentLeave?.id === id) {
          this.currentLeave = response.leave
        }
        
        return response
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update leave request'
        console.error('Error updating leave:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLeave(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        await $fetch(`/api/leaves/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        // Remove from leaves array
        this.leaves = this.leaves.filter(leave => leave.id !== id)
        
        // Clear current leave if it's the same
        if (this.currentLeave?.id === id) {
          this.currentLeave = null
        }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to delete leave request'
        console.error('Error deleting leave:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLeaveBalances(params: any = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const balances = await $fetch('/api/leaves/balances', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          query: params
        })
        
        this.leaveBalances = balances || []
        this.currentBalance = balances?.[0] || null
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch leave balances'
        console.error('Error fetching leave balances:', error)
      } finally {
        this.loading = false
      }
    },

    async updateLeaveBalance(employeeId: string, balanceData: any) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const response = await $fetch(`/api/leaves/balances/${employeeId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: balanceData
        })
        
        // Update in balances array
        const index = this.leaveBalances.findIndex(balance => balance.employeeId === employeeId)
        if (index !== -1) {
          this.leaveBalances[index] = response.leaveBalance
        } else {
          this.leaveBalances.push(response.leaveBalance)
        }
        
        // Update current balance if it's the same employee
        if (this.currentBalance?.employeeId === employeeId) {
          this.currentBalance = response.leaveBalance
        }
        
        return response
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update leave balance'
        console.error('Error updating leave balance:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLeaveStats(params: any = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        
        const stats = await $fetch('/api/leaves/stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          query: params
        })
        
        this.stats = stats
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch leave statistics'
        console.error('Error fetching leave stats:', error)
      } finally {
        this.loading = false
      }
    },

    // Utility methods
    getLeaveTypeLabel(type: string) {
      const leaveType = this.leaveTypes.find(lt => lt.value === type)
      return leaveType?.label || type
    },

    getLeaveTypeColor(type: string) {
      const leaveType = this.leaveTypes.find(lt => lt.value === type)
      return leaveType?.color || 'neutral'
    },

    getStatusColor(status: string) {
      switch (status) {
        case 'pending': return 'warning'
        case 'approved': return 'success'
        case 'rejected': return 'error'
        case 'cancelled': return 'neutral'
        default: return 'neutral'
      }
    },

    clearError() {
      this.error = null
    },

    clearCurrentLeave() {
      this.currentLeave = null
    }
  }
})