<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Income/Expense Management</h1>
        <p class="text-gray-300 mt-2">Track and manage income and expense records</p>
      </div>
      <div class="flex gap-2">
        <!-- Export Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a @click="openExportModal">Configure Export</a></li>
            <li><a @click="quickExportCSV">Quick Export CSV</a></li>
            <li><a @click="quickExportExcel">Quick Export Excel</a></li>
          </ul>
        </div>
        
        <button @click="openCreateModal" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Record
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <IncomeExpenseSummaryCards :summary="summary" />

    <!-- Filters and Search -->
    <div class="bg-gray-800 rounded-lg shadow p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Search -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Search</span>
          </label>
          <input 
            v-model="filters.search"
            type="text" 
            class="input input-bordered bg-gray-700 text-white"
            placeholder="Search description..."
            @input="debouncedSearch"
          />
        </div>

        <!-- Type Filter -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Type</span>
          </label>
          <select 
            v-model="filters.type"
            class="select select-bordered bg-gray-700 text-white"
            @change="fetchRecords"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-gray-300">Category</span>
          </label>
          <select 
            v-model="filters.category"
            class="select select-bordered bg-gray-700 text-white"
            @change="fetchRecords"
          >
            <option value="">All Categories</option>
            <option value="normal">Normal</option>
            <option value="od">OD</option>
          </select>
        </div>

        <!-- Date Range -->
        <BaseInputDate
          v-model="filters.startDate"
          label="Start Date"
          placeholder="Select start date"
          @update:model-value="fetchRecords"
        />

        <BaseInputDate
          v-model="filters.endDate"
          label="End Date"
          placeholder="Select end date"
          @update:model-value="fetchRecords"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Records Table -->
    <div v-else-if="records.length > 0" class="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="text-white">Date</th>
              <th class="text-white">Description</th>
              <th class="text-white">Type</th>
              <th class="text-white">Category</th>
              <th class="text-white">Amount</th>
              <th class="text-white">Note</th>
              <th class="text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id" class="hover:bg-gray-700">
              <td class="text-gray-300">{{ formatDate(record.date) }}</td>
              <td class="text-gray-300">{{ record.description }}</td>
              <td>
                <div class="badge" :class="record.type === 'income' ? 'badge-success' : 'badge-error'">
                  {{ record.type }}
                </div>
              </td>
              <td>
                <div class="badge" :class="record.category === 'normal' ? 'badge-primary' : 'badge-warning'">
                  {{ record.category }}
                </div>
              </td>
              <td class="text-gray-300 font-semibold" :class="record.type === 'income' ? 'text-green-400' : 'text-red-400'">
                {{ formatAmount(record.amount) }}
              </td>
              <td class="text-gray-300 text-sm">{{ record.note || '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button 
                    @click="openEditModal(record)"
                    class="btn btn-ghost btn-xs"
                    title="Edit Record"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    @click="deleteRecord(record)"
                    class="btn btn-ghost btn-xs text-red-400 hover:text-red-300"
                    title="Delete Record"
                  >
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

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-600">
        <BasePagination
          :currentPage="pagination.currentPage"
          :totalPages="pagination.totalPages"
          :totalItems="pagination.totalItems"
          :pageSize="pagination.itemsPerPage"
          @page-changed="onPageChange"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-white">No records found</h3>
      <p class="mt-1 text-gray-400">Get started by adding your first income or expense record.</p>
      <div class="mt-6">
        <button @click="openCreateModal" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Record
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <dialog id="record-modal" class="modal">
      <div class="modal-box bg-gray-800 text-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">{{ editingRecord ? 'Edit Record' : 'Add New Record' }}</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeModal">✕</button>
        </div>
        
        <form @submit.prevent="saveRecord" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInputDate
              v-model="formData.date"
              label="Date"
              placeholder="Select date"
              required
            />
            
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Amount *</span>
              </label>
              <input 
                v-model.number="formData.amount"
                type="number" 
                step="0.01"
                min="0"
                class="input input-bordered bg-gray-700 text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Description *</span>
            </label>
            <input 
              v-model="formData.description"
              type="text" 
              class="input input-bordered bg-gray-700 text-white"
              placeholder="Enter description..."
              required
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Type *</span>
              </label>
              <select 
                v-model="formData.type"
                class="select select-bordered bg-gray-700 text-white"
                required
              >
                <option value="">Select type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Category *</span>
              </label>
              <select 
                v-model="formData.category"
                class="select select-bordered bg-gray-700 text-white"
                required
              >
                <option value="">Select category</option>
                <option value="normal">Normal</option>
                <option value="od">OD</option>
              </select>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-gray-300">Note</span>
            </label>
            <textarea 
              v-model="formData.note"
              class="textarea textarea-bordered bg-gray-700 text-white"
              rows="3"
              placeholder="Additional notes (optional)..."
            ></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" :disabled="saving" class="btn btn-primary">
              <span v-if="saving" class="loading loading-spinner loading-sm mr-2"></span>
              {{ saving ? 'Saving...' : (editingRecord ? 'Update' : 'Create') }}
            </button>
            <button type="button" @click="closeModal" class="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- Export Modal -->
    <dialog id="export-modal" class="modal">
      <div class="modal-box bg-gray-800">
        <h3 class="font-bold text-lg text-white mb-4">Export Income/Expense Data</h3>
        
        <form @submit.prevent="handleExport" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Export Format -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Format *</span>
              </label>
              <select 
                v-model="exportData.format"
                class="select select-bordered bg-gray-700 text-white"
                required
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel (XLSX)</option>
              </select>
            </div>

            <!-- Date Range Type -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Date Range *</span>
              </label>
              <select 
                v-model="exportData.dateRange"
                class="select select-bordered bg-gray-700 text-white"
                @change="handleDateRangeChange"
                required
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="specific-month">Specific Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          <!-- Month/Year Selection -->
          <div v-if="exportData.dateRange === 'specific-month'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Month</span>
              </label>
              <select 
                v-model="exportData.month"
                class="select select-bordered bg-gray-700 text-white"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Year</span>
              </label>
              <input 
                v-model="exportData.year"
                type="number" 
                class="input input-bordered bg-gray-700 text-white"
                :min="2020"
                :max="2030"
              />
            </div>
          </div>

          <!-- Custom Date Range -->
          <div v-if="exportData.dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInputDate
              v-model="exportData.startDate"
              label="Start Date"
              placeholder="Select start date"
            />
            <BaseInputDate
              v-model="exportData.endDate"
              label="End Date"
              placeholder="Select end date"
            />
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Type</span>
              </label>
              <select 
                v-model="exportData.type"
                class="select select-bordered bg-gray-700 text-white"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Category</span>
              </label>
              <select 
                v-model="exportData.category"
                class="select select-bordered bg-gray-700 text-white"
              >
                <option value="all">All Categories</option>
                <option value="normal">Normal</option>
                <option value="od">OD</option>
              </select>
            </div>
          </div>
          
          <div class="modal-action">
            <button type="submit" :disabled="exporting" class="btn btn-primary">
              <span v-if="exporting" class="loading loading-spinner loading-sm mr-2"></span>
              {{ exporting ? 'Exporting...' : 'Export Data' }}
            </button>
            <button type="button" @click="closeExportModal" class="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { debounce } from 'lodash-es'
import { exportToExcel, downloadCSV, getMonthName } from '~/utils/export'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()

// State
const loading = ref(true)
const saving = ref(false)
const exporting = ref(false)
const error = ref('')
const records = ref([])
const editingRecord = ref(null)

const filters = reactive({
  search: '',
  type: '',
  category: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
})

const summary = reactive({
  normalIncome: 0,
  normalExpense: 0,
  normalNet: 0,
  odIncome: 0,
  odExpense: 0,
  odNet: 0,
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0
})

const formData = reactive({
  date: new Date().toISOString().split('T')[0],
  description: '',
  amount: 0,
  type: '',
  category: '',
  note: ''
})

const exportData = reactive({
  format: 'csv',
  dateRange: 'current-month',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  startDate: '',
  endDate: '',
  type: 'all',
  category: 'all'
})

// Computed
const debouncedSearch = debounce(fetchRecords, 500)

// Methods
async function fetchRecords() {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.itemsPerPage.toString()
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.type) params.append('type', filters.type)
    if (filters.category) params.append('category', filters.category)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    
    const response = await $fetch(`/api/income-expense?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    records.value = response.records
    Object.assign(pagination, response.pagination)
    Object.assign(summary, response.summary)
  } catch (err: any) {
    console.error('Error fetching records:', err)
    error.value = 'Failed to load records'
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  pagination.currentPage = page
  fetchRecords()
}

function openCreateModal() {
  editingRecord.value = null
  resetForm()
  const modal = document.getElementById('record-modal') as HTMLDialogElement
  modal.showModal()
}

function openEditModal(record: any) {
  editingRecord.value = record
  formData.date = record.date.split('T')[0]
  formData.description = record.description
  formData.amount = record.amount
  formData.type = record.type
  formData.category = record.category
  formData.note = record.note || ''
  
  const modal = document.getElementById('record-modal') as HTMLDialogElement
  modal.showModal()
}

function closeModal() {
  editingRecord.value = null
  resetForm()
  const modal = document.getElementById('record-modal') as HTMLDialogElement
  modal.close()
}

function resetForm() {
  formData.date = new Date().toISOString().split('T')[0]
  formData.description = ''
  formData.amount = 0
  formData.type = ''
  formData.category = ''
  formData.note = ''
}

async function saveRecord() {
  saving.value = true
  
  try {
    const url = editingRecord.value 
      ? `/api/income-expense/${editingRecord.value.id}`
      : '/api/income-expense'
    
    const method = editingRecord.value ? 'PUT' : 'POST'
    
    await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: formData
    })
    
    closeModal()
    await fetchRecords()
  } catch (err: any) {
    console.error('Error saving record:', err)
    error.value = 'Failed to save record'
  } finally {
    saving.value = false
  }
}

async function deleteRecord(record: any) {
  if (!confirm(`Are you sure you want to delete this ${record.type} record for ${formatAmount(record.amount)}?`)) {
    return
  }
  
  try {
    await $fetch(`/api/income-expense/${record.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    await fetchRecords()
  } catch (err: any) {
    console.error('Error deleting record:', err)
    error.value = 'Failed to delete record'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Export Functions
function openExportModal() {
  const modal = document.getElementById('export-modal') as HTMLDialogElement
  modal.showModal()
}

function closeExportModal() {
  const modal = document.getElementById('export-modal') as HTMLDialogElement
  modal.close()
}

function handleDateRangeChange() {
  const now = new Date()
  
  switch (exportData.dateRange) {
    case 'current-month':
      exportData.month = now.getMonth() + 1
      exportData.year = now.getFullYear()
      break
    case 'last-month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      exportData.month = lastMonth.getMonth() + 1
      exportData.year = lastMonth.getFullYear()
      break
    case 'specific-month':
      exportData.month = now.getMonth() + 1
      exportData.year = now.getFullYear()
      break
    case 'custom':
      exportData.startDate = ''
      exportData.endDate = ''
      break
  }
}

async function handleExport() {
  exporting.value = true
  
  try {
    const params = new URLSearchParams()
    params.append('format', exportData.format)
    
    // Date parameters
    if (exportData.dateRange === 'custom') {
      if (exportData.startDate) params.append('startDate', exportData.startDate)
      if (exportData.endDate) params.append('endDate', exportData.endDate)
    } else {
      params.append('month', exportData.month.toString())
      params.append('year', exportData.year.toString())
    }
    
    // Filter parameters
    if (exportData.type !== 'all') params.append('type', exportData.type)
    if (exportData.category !== 'all') params.append('category', exportData.category)
    
    if (exportData.format === 'excel') {
      // For Excel, get JSON data and use frontend library
      params.set('format', 'excel')
      const response = await $fetch(`/api/income-expense/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      if (response.success) {
        const result = exportToExcel({
          data: response.data,
          summary: response.summary,
          filename: response.filename
        })
        
        if (result.success) {
          // Success message will be shown by the export function
        } else {
          error.value = result.message
        }
      }
    } else {
      // For CSV, download directly
      const response = await fetch(`/api/income-expense/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      if (response.ok) {
        const csvContent = await response.text()
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'income-expense-export.csv'
        
        downloadCSV(csvContent, filename)
      } else {
        throw new Error('Failed to export CSV')
      }
    }
    
    closeExportModal()
  } catch (err: any) {
    console.error('Error exporting data:', err)
    error.value = 'Failed to export data'
  } finally {
    exporting.value = false
  }
}

async function quickExportCSV() {
  const now = new Date()
  const params = new URLSearchParams({
    format: 'csv',
    month: (now.getMonth() + 1).toString(),
    year: now.getFullYear().toString()
  })
  
  try {
    const response = await fetch(`/api/income-expense/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const csvContent = await response.text()
      const filename = `income-expense-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`
      downloadCSV(csvContent, filename)
    } else {
      throw new Error('Failed to export CSV')
    }
  } catch (err: any) {
    console.error('Error exporting CSV:', err)
    error.value = 'Failed to export CSV'
  }
}

async function quickExportExcel() {
  const now = new Date()
  const params = new URLSearchParams({
    format: 'excel',
    month: (now.getMonth() + 1).toString(),
    year: now.getFullYear().toString()
  })
  
  try {
    const response = await $fetch(`/api/income-expense/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      const filename = `income-expense-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`
      exportToExcel({
        data: response.data,
        summary: response.summary,
        filename
      })
    }
  } catch (err: any) {
    console.error('Error exporting Excel:', err)
    error.value = 'Failed to export Excel'
  }
}

// Initialize
onMounted(() => {
  fetchRecords()
})

useHead({
  title: 'Income/Expense Management - Manager'
})
</script>

<style scoped>
.table th {
  background-color: rgb(55, 65, 81);
  color: white;
}

.table td {
  border-bottom: 1px solid rgb(75, 85, 99);
}
</style>