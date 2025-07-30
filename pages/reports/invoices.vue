<template>
  <div class="container mx-auto px-4 py-8 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Invoice Management</h1>
        <p class="text-base-content/70 mt-2">View and manage all invoices</p>
      </div>
      <div class="flex gap-4">
        <NuxtLink to="/invoices/create" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Invoice
        </NuxtLink>
        <NuxtLink to="/reports" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Reports
        </NuxtLink>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-base-100 rounded-lg shadow p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-base-content">Search</span>
          </label>
          <input 
            v-model="filters.search"
            type="text" 
            class="input input-bordered bg-base-200 text-base-content"
            placeholder="Search invoices..."
            @input="debouncedSearch"
          />
        </div>

        <!-- Status Filter -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-base-content">Status</span>
          </label>
          <select 
            v-model="filters.status"
            class="select select-bordered bg-base-200 text-base-content"
            @change="fetchInvoices"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Date Range -->
        <BaseInputDate
          v-model="filters.startDate"
          label="Start Date"
          placeholder="Select start date"
          @update:model-value="fetchInvoices"
        />

        <BaseInputDate
          v-model="filters.endDate"
          label="End Date"
          placeholder="Select end date"
          @update:model-value="fetchInvoices"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Success State -->
    <div v-if="success" class="alert alert-success mb-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ success }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Invoice Table -->
    <div v-else-if="invoices.length > 0" class="bg-base-100 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200">
              <th class="text-base-content">Invoice #</th>
              <th class="text-base-content">Customer</th>
              <th class="text-base-content">Date</th>
              <th class="text-base-content">Due Date</th>
              <th class="text-base-content">Amount</th>
              <th class="text-base-content">Status</th>
              <th class="text-base-content">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-base-200">
              <td class="text-base-content font-mono">{{ invoice.invoiceNumber }}</td>
              <td class="text-base-content">{{ invoice.customer.name }}</td>
              <td class="text-base-content">{{ formatDate(invoice.date) }}</td>
              <td class="text-base-content">{{ formatDate(invoice.dueDate) }}</td>
              <td class="text-base-content font-semibold">{{ formatAmount(invoice.totals.total) }}</td>
              <td>
                <div class="badge" :class="getStatusBadgeClass(invoice.status)">
                  {{ invoice.status }}
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <button 
                    @click="viewInvoice(invoice)"
                    class="btn btn-ghost btn-xs"
                    title="View Invoice"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <NuxtLink 
                    :to="`/invoices/${invoice.id}/edit`"
                    class="btn btn-ghost btn-xs"
                    title="Edit Invoice"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </NuxtLink>
                  <button 
                    @click="changeStatus(invoice)"
                    class="btn btn-ghost btn-xs"
                    title="Change Status"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-base-300">
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
    <div v-else class="bg-base-100 rounded-lg shadow p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-base-content">No invoices found</h3>
      <p class="mt-1 text-gray-400">Get started by creating your first invoice.</p>
      <div class="mt-6">
        <NuxtLink to="/invoices/create" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Invoice
        </NuxtLink>
      </div>
    </div>

    <!-- Invoice Preview Modal -->
    <dialog id="invoice-modal" class="modal">
      <div class="modal-box max-w-4xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Invoice {{ selectedInvoice?.invoiceNumber }}</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeInvoiceModal">✕</button>
        </div>
        
        <div v-if="selectedInvoice" class="space-y-4">
          <!-- Customer Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">Customer</h4>
              <p>{{ selectedInvoice.customer.name }}</p>
              <p class="text-sm text-gray-400">{{ selectedInvoice.customer.address }}</p>
              <p class="text-sm text-gray-400">{{ selectedInvoice.customer.tel }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-2">Invoice Details</h4>
              <p><strong>Date:</strong> {{ formatDate(selectedInvoice.date) }}</p>
              <p><strong>Due Date:</strong> {{ formatDate(selectedInvoice.dueDate) }}</p>
              <p><strong>Status:</strong> 
                <span class="badge" :class="getStatusBadgeClass(selectedInvoice.status)">
                  {{ selectedInvoice.status }}
                </span>
              </p>
            </div>
          </div>

          <!-- Items -->
          <div>
            <h4 class="font-semibold mb-2">Items</h4>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedInvoice.items" :key="index">
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatAmount(item.unitPrice) }}</td>
                    <td>{{ formatAmount(item.totalPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals -->
          <div class="text-right">
            <p><strong>Subtotal:</strong> {{ formatAmount(selectedInvoice.totals.subtotal) }}</p>
            <p><strong>Tax:</strong> {{ formatAmount(selectedInvoice.totals.tax) }}</p>
            <p class="text-lg"><strong>Total:</strong> {{ formatAmount(selectedInvoice.totals.total) }}</p>
          </div>
        </div>
      </div>
    </dialog>

    <!-- Status Change Modal -->
    <dialog id="status-modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Change Invoice Status</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">New Status</span>
          </label>
          <select v-model="newStatus" class="select select-bordered">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="modal-action">
          <button @click="updateStatus" :disabled="updatingStatus" class="btn btn-primary">
            <span v-if="updatingStatus" class="loading loading-spinner loading-sm mr-2"></span>
            Update
          </button>
          <button @click="closeStatusModal" class="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { debounce } from 'lodash-es'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()

// State
const loading = ref(true)
const error = ref('')
const success = ref('')
const invoices = ref([])
const selectedInvoice = ref(null)
const selectedInvoiceForStatus = ref(null)
const newStatus = ref('')
const updatingStatus = ref(false)

const filters = reactive({
  search: '',
  status: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
})

// Computed
const debouncedSearch = debounce(fetchInvoices, 500)

// Methods
async function fetchInvoices() {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.itemsPerPage.toString()
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    
    const response = await $fetch(`/api/invoices?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    invoices.value = response.invoices
    Object.assign(pagination, response.pagination)
  } catch (err: any) {
    console.error('Error fetching invoices:', err)
    error.value = 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  pagination.currentPage = page
  fetchInvoices()
}

function viewInvoice(invoice: any) {
  selectedInvoice.value = invoice
  const modal = document.getElementById('invoice-modal') as HTMLDialogElement
  modal.showModal()
}

function closeInvoiceModal() {
  selectedInvoice.value = null
  const modal = document.getElementById('invoice-modal') as HTMLDialogElement
  modal.close()
}

function changeStatus(invoice: any) {
  selectedInvoiceForStatus.value = invoice
  newStatus.value = invoice.status
  const modal = document.getElementById('status-modal') as HTMLDialogElement
  modal.showModal()
}

function closeStatusModal() {
  selectedInvoiceForStatus.value = null
  newStatus.value = ''
  const modal = document.getElementById('status-modal') as HTMLDialogElement
  modal.close()
}

async function updateStatus() {
  if (!selectedInvoiceForStatus.value || !newStatus.value) return
  
  updatingStatus.value = true
  
  try {
    const response = await $fetch(`/api/invoices/${selectedInvoiceForStatus.value.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        status: newStatus.value
      }
    })
    
    // Update local data
    const index = invoices.value.findIndex(inv => inv.id === selectedInvoiceForStatus.value.id)
    if (index !== -1) {
      invoices.value[index].status = newStatus.value
    }
    
    // Show success message with income generation info
    if (response.incomeRecords && response.incomeRecords.length > 0) {
      success.value = `Status updated successfully! Generated ${response.incomeRecords.length} income record(s) from invoice items.`
    } else if (response.statusChange && response.statusChange.triggeredIncome) {
      success.value = response.message || 'Status updated successfully!'
    } else {
      success.value = 'Status updated successfully!'
    }
    
    setTimeout(() => success.value = '', 5000)
    closeStatusModal()
  } catch (err: any) {
    console.error('Error updating status:', err)
    error.value = 'Failed to update status'
  } finally {
    updatingStatus.value = false
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

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'draft':
      return 'badge-neutral'
    case 'sent':
      return 'badge-info'
    case 'paid':
      return 'badge-success'
    case 'overdue':
      return 'badge-warning'
    case 'cancelled':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

// Initialize
onMounted(() => {
  fetchInvoices()
})

useHead({
  title: 'Invoice Management - Manager'
})
</script>

<style scoped>
/* Custom styles for invoice management */
</style>