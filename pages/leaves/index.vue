<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">My Leaves</h1>
        <p class="text-gray-300 mt-2">Manage your leave requests and view balances</p>
      </div>
      <div class="flex gap-4">
        <NuxtLink to="/leaves/request" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Request Leave
        </NuxtLink>
      </div>
    </div>

    <!-- Leave Balance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-if="leavesStore.currentBalance" v-for="(balance, type) in leavesStore.currentBalance.leaveBalances" :key="type" class="card bg-gray-800 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white capitalize">{{ type }}</h3>
              <p class="text-gray-400 text-sm">{{ leavesStore.getLeaveTypeLabel(type) }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-primary">{{ balance.remaining }}</div>
              <div class="text-sm text-gray-400">of {{ balance.total }} days</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-400 mb-1">
              <span>Used: {{ balance.used }}</span>
              <span>{{ Math.round((balance.remaining / balance.total) * 100) }}% left</span>
            </div>
            <progress 
              class="progress progress-primary w-full" 
              :value="balance.remaining" 
              :max="balance.total"
            ></progress>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            @input="applyFilters"
            placeholder="Start Date"
          />
        </div>
        <div class="form-control">
          <BaseInputDate
            v-model="filters.endDate"
            @input="applyFilters"
            placeholder="End Date"
          />
        </div>
      </div>
    </div>

    <!-- Leaves Table -->
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
              <td colspan="7" class="text-center py-8 text-gray-400">
                No leave requests found
              </td>
            </tr>
            <tr v-else v-for="leave in leavesStore.leaves" :key="leave.id">
              <td>
                <div class="flex items-center gap-2">
                  <div 
                    class="badge badge-sm"
                    :class="`badge-${leavesStore.getLeaveTypeColor(leave.leaveType)}`"
                  >
                    {{ leavesStore.getLeaveTypeLabel(leave.leaveType) }}
                  </div>
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
                    @click="editLeave(leave)" 
                    class="btn btn-ghost btn-xs"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    v-if="leave.status === 'pending'"
                    @click="cancelLeave(leave)" 
                    class="btn btn-ghost btn-xs text-red-400"
                    title="Cancel"
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

    <!-- Leave Details Modal -->
    <div v-if="showDetailsModal" class="modal modal-open">
      <div class="modal-box bg-gray-800 text-white max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Leave Request Details</h3>
        
        <div v-if="selectedLeave" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
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
        </div>
        
        <div class="modal-action">
          <button @click="closeDetailsModal" class="btn btn-ghost">Close</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeDetailsModal"></div>
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
const filters = reactive({
  status: '',
  leaveType: '',
  startDate: '',
  endDate: ''
})

const showDetailsModal = ref(false)
const selectedLeave = ref(null)

// Methods
const applyFilters = async () => {
  const params: any = { page: 1 }
  
  if (filters.status) params.status = filters.status
  if (filters.leaveType) params.leaveType = filters.leaveType
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  
  await leavesStore.fetchLeaves(params)
}

const changePage = async (page: number) => {
  const params: any = { page }
  
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

const editLeave = (leave: any) => {
  navigateTo(`/leaves/request?edit=${leave.id}`)
}

const cancelLeave = async (leave: any) => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Cancel Leave Request',
    message: `Are you sure you want to cancel this ${leave.leaveType} leave request?`,
    type: 'warning',
    confirmText: 'Cancel Leave'
  })
  
  if (confirmed) {
    try {
      await leavesStore.updateLeave(leave.id, { status: 'cancelled' })
      
      await modal.showAlert({
        title: 'Success',
        message: 'Leave request cancelled successfully',
        type: 'success'
      })
    } catch (error) {
      await modal.showAlert({
        title: 'Error',
        message: 'Failed to cancel leave request',
        type: 'error'
      })
    }
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLeave.value = null
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    leavesStore.fetchLeaves(),
    leavesStore.fetchLeaveBalances()
  ])
})

// Set page title
useHead({
  title: 'My Leaves - Manager'
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