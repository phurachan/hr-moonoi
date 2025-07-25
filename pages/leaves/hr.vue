<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Leave Management</h1>
        <p class="text-gray-300 mt-2">Manage employee leave requests and balances</p>
      </div>
      <div class="flex gap-4">
        <button @click="exportLeaves" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card bg-gray-800 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Pending</h3>
              <p class="text-gray-400 text-sm">Awaiting approval</p>
            </div>
            <div class="text-3xl font-bold text-warning">{{ leavesStore.stats.overview.pendingLeaves }}</div>
          </div>
        </div>
      </div>

      <div class="card bg-gray-800 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Approved</h3>
              <p class="text-gray-400 text-sm">This year</p>
            </div>
            <div class="text-3xl font-bold text-success">{{ leavesStore.stats.overview.approvedLeaves }}</div>
          </div>
        </div>
      </div>

      <div class="card bg-gray-800 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Rejected</h3>
              <p class="text-gray-400 text-sm">This year</p>
            </div>
            <div class="text-3xl font-bold text-error">{{ leavesStore.stats.overview.rejectedLeaves }}</div>
          </div>
        </div>
      </div>

      <div class="card bg-gray-800 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Total</h3>
              <p class="text-gray-400 text-sm">All requests</p>
            </div>
            <div class="text-3xl font-bold text-primary">{{ leavesStore.stats.overview.totalLeaves }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs tabs-boxed mb-8 bg-gray-800">
      <a 
        class="tab" 
        :class="{ 'tab-active': activeTab === 'requests' }" 
        @click="activeTab = 'requests'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        Leave Requests
      </a>
      <a 
        class="tab" 
        :class="{ 'tab-active': activeTab === 'balances' }" 
        @click="activeTab = 'balances'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Leave Balances
      </a>
    </div>

    <!-- Leave Requests Tab -->
    <div v-if="activeTab === 'requests'" class="space-y-6">
      <!-- Filters -->
      <div class="bg-gray-800 rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="form-control">
            <input 
              v-model="filters.search" 
              type="text" 
              placeholder="Search employee..." 
              class="input input-bordered"
              @input="debouncedSearch"
            />
          </div>
          <div class="form-control">
            <select v-model="filters.status" class="select select-bordered" @change="applyFilters">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-control">
            <select v-model="filters.leaveType" class="select select-bordered" @change="applyFilters">
              <option value="">All Types</option>
              <option v-for="type in leavesStore.leaveTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <BaseInputDate
              v-model="filters.startDate"
              placeholder="Start Date"
              @change="applyFilters"
            />
          </div>
          <div class="form-control">
            <BaseInputDate
              v-model="filters.endDate"
              placeholder="End Date"
              @change="applyFilters"
            />
          </div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="bg-gray-800 rounded-lg overflow-hidden">
        <div v-if="leavesStore.loading" class="flex justify-center py-8">
          <div class="loading loading-spinner loading-lg"></div>
        </div>

        <div v-else-if="leavesStore.error" class="alert alert-error m-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ leavesStore.error }}</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="text-gray-300">Employee</th>
                <th class="text-gray-300">Leave Type</th>
                <th class="text-gray-300">Dates</th>
                <th class="text-gray-300">Days</th>
                <th class="text-gray-300">Reason</th>
                <th class="text-gray-300">Status</th>
                <th class="text-gray-300">Applied</th>
                <th class="text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="leavesStore.leaves.length === 0">
                <td colspan="8" class="text-center py-8 text-gray-400">
                  No leave requests found
                </td>
              </tr>
              <tr v-else v-for="leave in leavesStore.leaves" :key="leave.id">
                <td>
                  <div class="font-medium text-white">{{ leave.employeeName }}</div>
                  <div class="text-gray-400 text-sm">{{ leave.employeeEmail }}</div>
                </td>
                <td>
                  <div 
                    class="badge badge-sm"
                    :class="`badge-${leavesStore.getLeaveTypeColor(leave.leaveType)}`"
                  >
                    {{ leavesStore.getLeaveTypeLabel(leave.leaveType) }}
                  </div>
                </td>
                <td>
                  <div class="text-white">{{ formatDate(leave.startDate) }}</div>
                  <div class="text-gray-400 text-sm">to {{ formatDate(leave.endDate) }}</div>
                </td>
                <td>
                  <div class="font-medium text-white">
                    {{ leave.totalDays }} {{ leave.totalDays === 1 ? 'day' : 'days' }}
                  </div>
                  <div v-if="leave.isHalfDay" class="text-xs text-gray-400">
                    {{ leave.halfDayPeriod }} half-day
                  </div>
                </td>
                <td>
                  <div class="text-white max-w-xs truncate" :title="leave.reason">
                    {{ leave.reason }}
                  </div>
                </td>
                <td>
                  <div 
                    class="badge"
                    :class="`badge-${leavesStore.getStatusColor(leave.status)}`"
                  >
                    {{ leave.status.charAt(0).toUpperCase() + leave.status.slice(1) }}
                  </div>
                  <div v-if="leave.status === 'approved'" class="text-xs text-gray-400 mt-1">
                    by {{ leave.approverName }}
                  </div>
                  <div v-if="leave.status === 'rejected' && leave.rejectionReason" class="text-xs text-red-400 mt-1">
                    {{ leave.rejectionReason }}
                  </div>
                </td>
                <td class="text-gray-400 text-sm">
                  {{ formatDate(leave.appliedAt) }}
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      @click="viewLeave(leave)" 
                      class="btn btn-ghost btn-xs"
                      title="View Details"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    
                    <button 
                      v-if="leave.status === 'pending'"
                      @click="approveLeave(leave)" 
                      class="btn btn-ghost btn-xs text-green-400"
                      title="Approve"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    
                    <button 
                      v-if="leave.status === 'pending'"
                      @click="rejectLeave(leave)" 
                      class="btn btn-ghost btn-xs text-red-400"
                      title="Reject"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="leavesStore.pagination.pages > 1" class="p-4 border-t border-gray-700">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-400">
              Showing {{ ((leavesStore.pagination.page - 1) * leavesStore.pagination.limit) + 1 }} 
              to {{ Math.min(leavesStore.pagination.page * leavesStore.pagination.limit, leavesStore.pagination.total) }} 
              of {{ leavesStore.pagination.total }} results
            </div>
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :disabled="leavesStore.pagination.page <= 1"
                @click="changePage(leavesStore.pagination.page - 1)"
              >
                Previous
              </button>
              <button 
                v-for="page in getVisiblePages()" 
                :key="page"
                class="btn btn-sm" 
                :class="{ 'btn-active': page === leavesStore.pagination.page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
              <button 
                class="btn btn-sm" 
                :disabled="leavesStore.pagination.page >= leavesStore.pagination.pages"
                @click="changePage(leavesStore.pagination.page + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Balances Tab -->
    <div v-if="activeTab === 'balances'" class="space-y-6">
      <LeaveBalanceManager />
    </div>

    <!-- Leave Details Modal -->
    <div v-if="showDetailsModal" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Leave Request Details</h3>
        
        <div v-if="selectedLeave" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text text-gray-300">Employee</span>
              </label>
              <div class="text-white">{{ selectedLeave.employeeName }}</div>
              <div class="text-gray-400 text-sm">{{ selectedLeave.employeeEmail }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text text-gray-300">Leave Type</span>
              </label>
              <div 
                class="badge"
                :class="`badge-${leavesStore.getLeaveTypeColor(selectedLeave.leaveType)}`"
              >
                {{ leavesStore.getLeaveTypeLabel(selectedLeave.leaveType) }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text text-gray-300">Start Date</span>
              </label>
              <div class="text-white">{{ formatDate(selectedLeave.startDate) }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text text-gray-300">End Date</span>
              </label>
              <div class="text-white">{{ formatDate(selectedLeave.endDate) }}</div>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text text-gray-300">Total Days</span>
            </label>
            <div class="text-white">
              {{ selectedLeave.totalDays }} {{ selectedLeave.totalDays === 1 ? 'day' : 'days' }}
              <span v-if="selectedLeave.isHalfDay" class="text-gray-400">
                ({{ selectedLeave.halfDayPeriod }} half-day)
              </span>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text text-gray-300">Reason</span>
            </label>
            <div class="text-white">{{ selectedLeave.reason }}</div>
          </div>

          <div v-if="selectedLeave.emergencyContact">
            <label class="label">
              <span class="label-text text-gray-300">Emergency Contact</span>
            </label>
            <div class="text-white">{{ selectedLeave.emergencyContact }}</div>
          </div>

          <div>
            <label class="label">
              <span class="label-text text-gray-300">Status</span>
            </label>
            <div 
              class="badge"
              :class="`badge-${leavesStore.getStatusColor(selectedLeave.status)}`"
            >
              {{ selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1) }}
            </div>
          </div>

          <div v-if="selectedLeave.status === 'approved'">
            <label class="label">
              <span class="label-text text-gray-300">Approved By</span>
            </label>
            <div class="text-white">{{ selectedLeave.approverName }}</div>
            <div class="text-gray-400 text-sm">{{ formatDate(selectedLeave.approvedAt) }}</div>
          </div>

          <div v-if="selectedLeave.status === 'rejected'">
            <label class="label">
              <span class="label-text text-gray-300">Rejection Reason</span>
            </label>
            <div class="text-red-400">{{ selectedLeave.rejectionReason }}</div>
            <div class="text-gray-400 text-sm">{{ formatDate(selectedLeave.rejectedAt) }}</div>
          </div>

          <!-- Action buttons for pending requests -->
          <div v-if="selectedLeave.status === 'pending'" class="flex gap-4 pt-4">
            <button @click="approveLeave(selectedLeave)" class="btn btn-success btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Approve
            </button>
            <button @click="rejectLeave(selectedLeave)" class="btn btn-error btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reject
            </button>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="closeDetailsModal" class="btn btn-ghost">Close</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeDetailsModal"></div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white">
        <h3 class="font-bold text-lg mb-4">Reject Leave Request</h3>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Reason for Rejection</span>
          </label>
          <textarea 
            v-model="rejectionReason"
            class="textarea textarea-bordered h-32"
            placeholder="Please provide a reason for rejecting this leave request..."
            maxlength="300"
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-gray-400">{{ rejectionReason.length }}/300 characters</span>
          </label>
        </div>
        
        <div class="modal-action">
          <button @click="closeRejectionModal" class="btn btn-ghost">Cancel</button>
          <button @click="confirmReject" class="btn btn-error" :disabled="!rejectionReason.trim()">
            Reject Request
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeRejectionModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLeavesStore } from '~/stores/leaves'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const leavesStore = useLeavesStore()
const authStore = useAuthStore()

// Reactive data
const activeTab = ref('requests')
const filters = reactive({
  search: '',
  status: '',
  leaveType: '',
  startDate: '',
  endDate: ''
})

const showDetailsModal = ref(false)
const selectedLeave = ref(null)
const showRejectionModal = ref(false)
const rejectionReason = ref('')
const leaveToReject = ref(null)

// Methods
const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const applyFilters = async () => {
  const params: any = { page: 1 }
  
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.leaveType) params.leaveType = filters.leaveType
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  
  await leavesStore.fetchLeaves(params)
}

const changePage = async (page: number) => {
  const params: any = { page }
  
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.leaveType) params.leaveType = filters.leaveType
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  
  await leavesStore.fetchLeaves(params)
}

const getVisiblePages = () => {
  const current = leavesStore.pagination.page
  const total = leavesStore.pagination.pages
  const pages = []
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

const viewLeave = (leave: any) => {
  selectedLeave.value = leave
  showDetailsModal.value = true
}

const approveLeave = async (leave: any) => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Approve Leave Request',
    message: `Approve ${leave.leaveType} leave for ${leave.employeeName}?`,
    type: 'info',
    confirmText: 'Approve'
  })
  
  if (confirmed) {
    try {
      await leavesStore.updateLeave(leave.id, { status: 'approved' })
      
      await modal.showAlert({
        title: 'Success',
        message: 'Leave request approved successfully',
        type: 'success'
      })
      
      // Close detail modal if it's open
      if (showDetailsModal.value && selectedLeave.value?.id === leave.id) {
        closeDetailsModal()
      }
      
      // Refresh stats
      await leavesStore.fetchLeaveStats()
    } catch (error) {
      await modal.showAlert({
        title: 'Error',
        message: 'Failed to approve leave request',
        type: 'error'
      })
    }
  }
}

const rejectLeave = (leave: any) => {
  leaveToReject.value = leave
  rejectionReason.value = ''
  showRejectionModal.value = true
}

const confirmReject = async () => {
  if (!rejectionReason.value.trim()) return
  
  const modal = useModal()
  
  try {
    await leavesStore.updateLeave(leaveToReject.value.id, { 
      status: 'rejected',
      rejectionReason: rejectionReason.value.trim()
    })
    
    await modal.showAlert({
      title: 'Success',
      message: 'Leave request rejected',
      type: 'success'
    })
    
    closeRejectionModal()
    
    // Close detail modal if it's open
    if (showDetailsModal.value && selectedLeave.value?.id === leaveToReject.value.id) {
      closeDetailsModal()
    }
    
    // Refresh stats
    await leavesStore.fetchLeaveStats()
  } catch (error) {
    await modal.showAlert({
      title: 'Error',
      message: 'Failed to reject leave request',
      type: 'error'
    })
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLeave.value = null
}

const closeRejectionModal = () => {
  showRejectionModal.value = false
  leaveToReject.value = null
  rejectionReason.value = ''
}

const exportLeaves = () => {
  // TODO: Implement export functionality
  const modal = useModal()
  modal.showAlert({
    title: 'Feature Coming Soon',
    message: 'Export functionality will be available soon',
    type: 'info'
  })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Utility function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    leavesStore.fetchLeaves(),
    leavesStore.fetchLeaveStats()
  ])
})

// Set page title
useHead({
  title: 'Leave Management - Manager'
})
</script>

<style scoped>
.table th {
  background-color: rgb(31 41 55);
}

.table-zebra tbody tr:nth-child(even) {
  background-color: rgb(55 65 81);
}
</style>