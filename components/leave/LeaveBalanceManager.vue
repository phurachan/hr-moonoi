<template>
  <div class="space-y-6">
    <!-- Employee Search -->
    <div class="bg-gray-800 rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
          <input 
            v-model="searchEmployee" 
            type="text" 
            placeholder="Search employee..." 
            class="input input-bordered"
            @input="debouncedSearchEmployees"
          />
        </div>
        <div class="form-control">
          <select v-model="selectedYear" class="select select-bordered" @change="loadBalances">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div class="form-control">
          <button @click="initializeAllBalances" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Initialize All Balances
          </button>
        </div>
      </div>
    </div>

    <!-- Employee Selection -->
    <div v-if="filteredEmployees.length > 0" class="bg-gray-800 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-white mb-4">Select Employee</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="employee in filteredEmployees" 
          :key="employee.id"
          class="card bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors"
          @click="selectEmployee(employee)"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-12">
                  <span class="text-sm">{{ getInitials(employee.name) }}</span>
                </div>
              </div>
              <div>
                <div class="font-medium text-white">{{ employee.name }}</div>
                <div class="text-gray-400 text-sm">{{ employee.department }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Balance Editor -->
    <div v-if="selectedEmployee" class="bg-gray-800 rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-semibold text-white">
            Leave Balance - {{ selectedEmployee.name }}
          </h3>
          <p class="text-gray-400">{{ selectedYear }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="resetToDefaults" class="btn btn-ghost btn-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Reset to Defaults
          </button>
          <button @click="saveBalances" class="btn btn-primary" :disabled="leavesStore.loading">
            <span v-if="leavesStore.loading" class="loading loading-spinner loading-sm"></span>
            Save Changes
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="(balance, leaveType) in balanceForm" 
          :key="leaveType"
          class="card bg-gray-700"
        >
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-white capitalize">
                {{ leaveType }}
              </h4>
              <div 
                class="badge"
                :class="`badge-${leavesStore.getLeaveTypeColor(leaveType)}`"
              >
                {{ leavesStore.getLeaveTypeLabel(leaveType) }}
              </div>
            </div>

            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Total Allocation</span>
                </label>
                <input 
                  type="number" 
                  v-model.number="balance.total"
                  class="input input-bordered"
                  min="0"
                  step="0.5"
                  @input="updateRemaining(leaveType)"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Used Days</span>
                </label>
                <input 
                  type="number" 
                  v-model.number="balance.used"
                  class="input input-bordered"
                  min="0"
                  :max="balance.total"
                  step="0.5"
                  @input="updateRemaining(leaveType)"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Remaining Days</span>
                </label>
                <input 
                  type="number" 
                  :value="balance.remaining"
                  class="input input-bordered input-disabled"
                  disabled
                />
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Used: {{ balance.used }}</span>
                  <span>{{ Math.round((balance.remaining / balance.total) * 100) || 0 }}% left</span>
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
      </div>
    </div>

    <!-- All Employees Balance Overview -->
    <div v-if="!selectedEmployee" class="bg-gray-800 rounded-lg overflow-hidden">
      <div class="p-4 border-b border-gray-700">
        <h3 class="text-lg font-semibold text-white">All Employee Balances ({{ selectedYear }})</h3>
      </div>

      <div v-if="leavesStore.loading" class="flex justify-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th class="text-gray-300">Employee</th>
              <th class="text-gray-300">Annual</th>
              <th class="text-gray-300">Sick</th>
              <th class="text-gray-300">Personal</th>
              <th class="text-gray-300">Emergency</th>
              <th class="text-gray-300">Last Updated</th>
              <th class="text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="leavesStore.leaveBalances.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400">
                No leave balances found for {{ selectedYear }}
              </td>
            </tr>
            <tr v-else v-for="balance in leavesStore.leaveBalances" :key="balance.id">
              <td>
                <div class="font-medium text-white">{{ balance.employeeName }}</div>
                <div class="text-gray-400 text-xs">ID: {{ balance.employeeId }}</div>
              </td>
              <td>
                <div class="text-white">{{ balance.leaveBalances.annual.remaining }}/{{ balance.leaveBalances.annual.total }}</div>
                <div class="w-16 h-1 bg-gray-600 rounded">
                  <div 
                    class="h-1 bg-success rounded"
                    :style="{ width: `${(balance.leaveBalances.annual.remaining / balance.leaveBalances.annual.total) * 100}%` }"
                  ></div>
                </div>
              </td>
              <td>
                <div class="text-white">{{ balance.leaveBalances.sick.remaining }}/{{ balance.leaveBalances.sick.total }}</div>
                <div class="w-16 h-1 bg-gray-600 rounded">
                  <div 
                    class="h-1 bg-warning rounded"
                    :style="{ width: `${(balance.leaveBalances.sick.remaining / balance.leaveBalances.sick.total) * 100}%` }"
                  ></div>
                </div>
              </td>
              <td>
                <div class="text-white">{{ balance.leaveBalances.personal.remaining }}/{{ balance.leaveBalances.personal.total }}</div>
                <div class="w-16 h-1 bg-gray-600 rounded">
                  <div 
                    class="h-1 bg-info rounded"
                    :style="{ width: `${(balance.leaveBalances.personal.remaining / balance.leaveBalances.personal.total) * 100}%` }"
                  ></div>
                </div>
              </td>
              <td>
                <div class="text-white">{{ balance.leaveBalances.emergency.remaining }}/{{ balance.leaveBalances.emergency.total }}</div>
                <div class="w-16 h-1 bg-gray-600 rounded">
                  <div 
                    class="h-1 bg-error rounded"
                    :style="{ width: `${(balance.leaveBalances.emergency.remaining / balance.leaveBalances.emergency.total) * 100}%` }"
                  ></div>
                </div>
              </td>
              <td class="text-gray-400 text-sm">
                {{ formatDate(balance.lastUpdated) }}
              </td>
              <td>
                <button 
                  @click="editBalance(balance)" 
                  class="btn btn-ghost btn-xs"
                  title="Edit Balance"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLeavesStore } from '~/stores/leaves'
import { useEmployeesStore } from '~/stores/employees'

const leavesStore = useLeavesStore()
const employeesStore = useEmployeesStore()

// Reactive data
const searchEmployee = ref('')
const selectedYear = ref(new Date().getFullYear())
const selectedEmployee = ref(null)
const balanceForm = reactive({
  annual: { total: 21, used: 0, remaining: 21 },
  sick: { total: 10, used: 0, remaining: 10 },
  personal: { total: 5, used: 0, remaining: 5 },
  maternity: { total: 90, used: 0, remaining: 90 },
  paternity: { total: 15, used: 0, remaining: 15 },
  emergency: { total: 3, used: 0, remaining: 3 }
})

// Computed properties
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const filteredEmployees = computed(() => {
  if (!searchEmployee.value) return []
  
  return employeesStore.employees.filter(employee =>
    employee.name.toLowerCase().includes(searchEmployee.value.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchEmployee.value.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchEmployee.value.toLowerCase())
  )
})

// Methods
const debouncedSearchEmployees = debounce(() => {
  // Search is handled by computed property
}, 300)

const loadBalances = async () => {
  await leavesStore.fetchLeaveBalances({ year: selectedYear.value })
}

const selectEmployee = async (employee: any) => {
  selectedEmployee.value = employee
  
  // Try to load existing balance for this employee
  const existingBalance = leavesStore.leaveBalances.find(
    balance => balance.employeeId === employee.id && balance.year === selectedYear.value
  )
  
  if (existingBalance) {
    // Populate form with existing balance
    Object.keys(balanceForm).forEach(leaveType => {
      if (existingBalance.leaveBalances[leaveType]) {
        balanceForm[leaveType] = { ...existingBalance.leaveBalances[leaveType] }
      }
    })
  } else {
    // Reset to defaults
    resetToDefaults()
  }
}

const editBalance = (balance: any) => {
  const employee = employeesStore.employees.find(emp => emp.id === balance.employeeId)
  if (employee) {
    selectEmployee(employee)
  }
}

const updateRemaining = (leaveType: string) => {
  const balance = balanceForm[leaveType]
  balance.remaining = Math.max(0, balance.total - balance.used)
}

const resetToDefaults = () => {
  balanceForm.annual = { total: 21, used: 0, remaining: 21 }
  balanceForm.sick = { total: 10, used: 0, remaining: 10 }
  balanceForm.personal = { total: 5, used: 0, remaining: 5 }
  balanceForm.maternity = { total: 90, used: 0, remaining: 90 }
  balanceForm.paternity = { total: 15, used: 0, remaining: 15 }
  balanceForm.emergency = { total: 3, used: 0, remaining: 3 }
}

const saveBalances = async () => {
  if (!selectedEmployee.value) return
  
  const modal = useModal()
  
  try {
    await leavesStore.updateLeaveBalance(selectedEmployee.value.id, {
      year: selectedYear.value,
      leaveBalances: balanceForm
    })
    
    await modal.showAlert({
      title: 'Success',
      message: 'Leave balance updated successfully',
      type: 'success'
    })
    
    // Refresh the balances list
    await loadBalances()
  } catch (error) {
    await modal.showAlert({
      title: 'Error',
      message: 'Failed to update leave balance',
      type: 'error'
    })
  }
}

const initializeAllBalances = async () => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Initialize All Employee Balances',
    message: `This will create default leave balances for all employees for ${selectedYear.value}. Existing balances will not be overwritten. Continue?`,
    type: 'info',
    confirmText: 'Initialize'
  })
  
  if (confirmed) {
    try {
      // Get all employees without leave balance for the selected year
      const employeesWithoutBalance = employeesStore.employees.filter(employee => 
        !leavesStore.leaveBalances.find(balance => 
          balance.employeeId === employee.id && balance.year === selectedYear.value
        )
      )
      
      let initializedCount = 0
      
      for (const employee of employeesWithoutBalance) {
        try {
          await leavesStore.updateLeaveBalance(employee.id, {
            year: selectedYear.value,
            leaveBalances: {
              annual: { total: 21, used: 0, remaining: 21 },
              sick: { total: 10, used: 0, remaining: 10 },
              personal: { total: 5, used: 0, remaining: 5 },
              maternity: { total: 90, used: 0, remaining: 90 },
              paternity: { total: 15, used: 0, remaining: 15 },
              emergency: { total: 3, used: 0, remaining: 3 }
            }
          })
          initializedCount++
        } catch (error) {
          console.error(`Failed to initialize balance for ${employee.name}:`, error)
        }
      }
      
      await modal.showAlert({
        title: 'Success',
        message: `Initialized leave balances for ${initializedCount} employees`,
        type: 'success'
      })
      
      // Refresh the balances list
      await loadBalances()
    } catch (error) {
      await modal.showAlert({
        title: 'Error',
        message: 'Failed to initialize employee balances',
        type: 'error'
      })
    }
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
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
    employeesStore.fetchEmployees(),
    loadBalances()
  ])
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