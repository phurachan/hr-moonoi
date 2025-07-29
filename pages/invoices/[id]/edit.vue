<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Edit Invoice</h1>
        <p class="text-gray-300 mt-2">Update invoice details</p>
      </div>
      <div class="flex gap-4">
        <NuxtLink to="/reports/invoices" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Invoices
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingInvoice" class="flex justify-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="alert alert-error mb-8">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ loadError }}</span>
    </div>

    <!-- Invoice Form (using the same structure as create page) -->
    <div v-else class="space-y-8">
      <!-- Success/Error Messages -->
      <div v-if="success" class="alert alert-success">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>{{ success }}</span>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Row 1: Invoice Details | Customer Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Invoice Details -->
        <div class="bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4 text-white">Invoice Details</h3>
          <div class="grid grid-cols-1 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Invoice Number</span>
              </label>
              <input 
                v-model="invoiceData.invoice.number"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="IV2025015"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <BaseInputDate
                v-model="invoiceData.invoice.date"
                label="Invoice Date"
                placeholder="Select invoice date"
              />
              <BaseInputDate
                v-model="invoiceData.invoice.dueDate"
                label="Due Date"
                placeholder="Select due date"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Status</span>
              </label>
              <select 
                v-model="invoiceData.status"
                class="select select-bordered bg-gray-700 text-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Reference Information</span>
              </label>
              <textarea 
                v-model="invoiceData.reference"
                class="textarea textarea-bordered bg-gray-700 text-white"
                rows="2"
                placeholder="Reference information..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="bg-gray-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">Customer Information</h3>
            <NuxtLink to="/customers/new" class="btn btn-sm btn-primary">
              Add New Customer
            </NuxtLink>
          </div>
          
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text text-gray-300">Select Customer</span>
            </label>
            <select 
              v-model="selectedCustomerId"
              @change="onCustomerSelect"
              class="select select-bordered bg-gray-700 text-white"
            >
              <option value="">Select a customer...</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>

          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Customer Name</span>
              </label>
              <input 
                v-model="invoiceData.customer.name"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="Enter customer name"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Address</span>
              </label>
              <textarea 
                v-model="invoiceData.customer.address"
                class="textarea textarea-bordered bg-gray-700 text-white h-20"
                placeholder="Enter customer address"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Phone</span>
                </label>
                <input 
                  v-model="invoiceData.customer.tel"
                  type="tel" 
                  class="input input-bordered bg-gray-700 text-white"
                  placeholder="Enter phone number"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Tax ID</span>
                </label>
                <input 
                  v-model="invoiceData.customer.taxId"
                  type="text" 
                  class="input input-bordered bg-gray-700 text-white"
                  placeholder="Enter tax ID"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Invoice Items -->
      <div class="bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">Invoice Items</h3>
          <button 
            @click="addItem" 
            class="btn btn-sm btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Item
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-gray-700">
                <th class="text-white">#</th>
                <th class="text-white">Description</th>
                <th class="text-white">Qty</th>
                <th class="text-white">Unit Price</th>
                <th class="text-white">Total</th>
                <th class="text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoiceData.items" :key="index" class="hover:bg-gray-700">
                <td class="text-gray-300">{{ index + 1 }}</td>
                <td>
                  <input 
                    v-model="item.description"
                    type="text" 
                    class="input input-bordered input-sm bg-gray-600 text-white w-full"
                    placeholder="Item description"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="item.quantity"
                    @input="updateItemTotal(index)"
                    type="number" 
                    min="1"
                    class="input input-bordered input-sm bg-gray-600 text-white w-20"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="item.unitPrice"
                    @input="updateItemTotal(index)"
                    type="number" 
                    step="0.01"
                    min="0"
                    class="input input-bordered input-sm bg-gray-600 text-white w-24"
                  />
                </td>
                <td>
                  <input 
                    v-model.number="item.totalPrice"
                    @input="markManualTotal(index)"
                    type="number" 
                    step="0.01"
                    min="0"
                    class="input input-bordered input-sm bg-gray-600 text-white w-24"
                    :class="{ 'bg-yellow-600': item.manualTotal }"
                  />
                </td>
                <td>
                  <button 
                    @click="removeItem(index)"
                    class="btn btn-ghost btn-xs text-red-400 hover:text-red-300"
                    :disabled="invoiceData.items.length === 1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Row 3: Company Information | Invoice Totals/Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Company Information -->
        <div class="bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4 text-white">Company Information</h3>
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Company Name</span>
              </label>
              <input 
                v-model="invoiceData.company.name"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Address</span>
              </label>
              <textarea 
                v-model="invoiceData.company.address"
                class="textarea textarea-bordered bg-gray-700 text-white h-20"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Phone</span>
                </label>
                <input 
                  v-model="invoiceData.company.tel"
                  type="tel" 
                  class="input input-bordered bg-gray-700 text-white"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Email</span>
                </label>
                <input 
                  v-model="invoiceData.company.email"
                  type="email" 
                  class="input input-bordered bg-gray-700 text-white"
                />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Signer</span>
              </label>
              <input 
                v-model="invoiceData.signer"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="ผู้มีอำนาจลงนาม"
              />
            </div>
          </div>
        </div>

        <!-- Invoice Totals and Actions -->
        <div class="bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4 text-white">Invoice Totals</h3>
          
          <!-- Totals Summary -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-300">Subtotal:</span>
              <span class="text-white font-semibold">{{ subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-300">VAT (7%):</span>
              <span class="text-white font-semibold">{{ vat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="border-t border-gray-600 pt-2">
              <div class="flex justify-between text-lg">
                <span class="text-white font-bold">Total:</span>
                <span class="text-white font-bold">{{ total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button 
              @click="updateInvoice"
              :disabled="saving || !isValidInvoice"
              class="btn btn-primary btn-block"
              :class="{ 'loading': saving }"
            >
              <svg v-if="!saving" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ saving ? 'Updating...' : 'Update Invoice' }}
            </button>
            
            <button 
              @click="previewInvoice"
              :disabled="!isValidInvoice"
              class="btn btn-outline btn-block"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Preview Invoice
            </button>

            <button 
              @click="generatePDF"
              :disabled="!isValidInvoice || generatingPDF"
              class="btn btn-success btn-block"
            >
              <span v-if="generatingPDF" class="loading loading-spinner loading-sm mr-2"></span>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ generatingPDF ? 'Generating...' : 'Download PDF' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Preview Modal -->
    <ModalsInvoicePreviewModal
      :is-open="showPreview"
      :invoice-data="previewInvoiceData"
      :show-actions="true"
      :use-html-preview="true"
      modal-id="invoice-edit-preview-modal"
      :title="`Invoice Preview - ${invoiceData.invoice.number}`"
      @close="closePreview"
      @pdf-generated="onPDFGenerated"
      @error="onPreviewError"
    />
  </div>
</template>

<script setup lang="ts">
import { convertNumberToThaiText } from '~/utils/thaiNumberToText'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()

// State
const invoiceId = route.params.id as string
const loadingInvoice = ref(true)
const loadError = ref('')
const saving = ref(false)
const generatingPDF = ref(false)
const error = ref('')
const success = ref('')
const showPreview = ref(false)
const previewInvoiceData = ref(null)
const customers = ref([])
const selectedCustomerId = ref('')

// Invoice data (same structure as create page)
const invoiceData = reactive({
  company: {
    name: '',
    address: '',
    tel: '',
    email: ''
  },
  customer: {
    name: '',
    address: '',
    tel: '',
    taxId: ''
  },
  invoice: {
    number: '',
    date: '',
    dueDate: ''
  },
  items: [{
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    manualTotal: false
  }],
  reference: '',
  payment: {
    companyName: '',
    accountNumber: '',
    bankInfo: ''
  },
  signer: '',
  status: 'draft'
})

// Computed properties
const subtotal = computed(() => {
  return invoiceData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
})

const vat = computed(() => {
  return Math.round(subtotal.value * 0.07 * 100) / 100
})

const total = computed(() => {
  return Math.round((subtotal.value + vat.value) * 100) / 100
})

const amountInWords = computed(() => {
  return convertNumberToThaiText(total.value)
})

const isValidInvoice = computed(() => {
  return invoiceData.customer.name && 
         invoiceData.invoice.number && 
         invoiceData.items.some(item => item.description && item.quantity > 0 && item.unitPrice >= 0)
})

// Methods
async function fetchInvoice() {
  try {
    const invoice = await $fetch(`/api/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    // Map invoice data to form structure
    Object.assign(invoiceData, {
      company: {
        name: invoice.company?.name || '',
        address: invoice.company?.address || '',
        tel: invoice.company?.tel || '',
        email: invoice.company?.email || ''
      },
      customer: {
        name: invoice.customer?.name || '',
        address: invoice.customer?.address || '',
        tel: invoice.customer?.tel || '',
        taxId: invoice.customer?.taxId || ''
      },
      invoice: {
        number: invoice.invoiceNumber || '',
        date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : ''
      },
      items: invoice.items?.length ? invoice.items : [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        manualTotal: false
      }],
      reference: invoice.reference || '',
      payment: {
        companyName: invoice.payment?.method || '',
        accountNumber: '',
        bankInfo: invoice.payment?.terms || ''
      },
      signer: invoice.signer || '',
      status: invoice.status || 'draft'
    })
    
  } catch (err: any) {
    console.error('Error fetching invoice:', err)
    loadError.value = 'Failed to load invoice'
  } finally {
    loadingInvoice.value = false
  }
}

async function fetchCustomers() {
  try {
    const response = await $fetch('/api/customers', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    customers.value = response.customers || []
  } catch (err: any) {
    console.error('Error fetching customers:', err)
  }
}

async function updateInvoice() {
  if (!isValidInvoice.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  saving.value = true
  error.value = ''
  
  try {
    const apiData = {
      ...invoiceData,
      totals: {
        subtotal: subtotal.value,
        vat: vat.value,
        total: total.value
      }
    }

    await $fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: apiData
    })
    
    success.value = 'Invoice updated successfully!'
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    console.error('Error updating invoice:', err)
    error.value = 'Failed to update invoice. Please try again.'
  } finally {
    saving.value = false
  }
}

function addItem() {
  invoiceData.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    manualTotal: false
  })
}

function removeItem(index: number) {
  if (invoiceData.items.length > 1) {
    invoiceData.items.splice(index, 1)
  }
}

function updateItemTotal(index: number) {
  const item = invoiceData.items[index]
  if (!item.manualTotal) {
    item.totalPrice = Math.round((item.quantity * item.unitPrice) * 100) / 100
  }
}

function markManualTotal(index: number) {
  invoiceData.items[index].manualTotal = true
}

function onCustomerSelect() {
  if (selectedCustomerId.value) {
    const customer = customers.value.find(c => c.id === selectedCustomerId.value)
    if (customer) {
      invoiceData.customer.name = customer.name
      invoiceData.customer.address = customer.address
      invoiceData.customer.tel = customer.tel
      invoiceData.customer.taxId = customer.taxId || ''
    }
  }
}

async function previewInvoice() {
  if (!isValidInvoice.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  try {
    // Prepare invoice data with calculated totals for the modal
    previewInvoiceData.value = {
      ...invoiceData,
      totals: {
        subtotal: subtotal.value,
        vat: vat.value,
        total: total.value,
        amountInWords: amountInWords.value
      }
    }
    
    showPreview.value = true
  } catch (err) {
    console.error('Error preparing preview:', err)
    error.value = 'Failed to prepare preview'
  }
}

function closePreview() {
  showPreview.value = false
  previewInvoiceData.value = null
}

function onPDFGenerated(blob: Blob) {
  success.value = 'PDF generated successfully!'
  setTimeout(() => success.value = '', 3000)
}

function onPreviewError(message: string) {
  error.value = message
  setTimeout(() => error.value = '', 5000)
}



async function generatePDF() {
  if (!isValidInvoice.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  generatingPDF.value = true
  error.value = ''
  
  try {
    // Prepare invoice data for API
    const apiData = {
      ...invoiceData,
      totals: {
        subtotal: subtotal.value,
        vat: vat.value,
        total: total.value,
        amountInWords: amountInWords.value
      }
    }

    const response = await fetch('/api/invoices/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(apiData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceData.invoice.number}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    success.value = 'PDF generated successfully!'
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    console.error('Error generating PDF:', err)
    error.value = 'Failed to generate PDF. Please try again.'
  } finally {
    generatingPDF.value = false
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchInvoice(),
    fetchCustomers()
  ])
})

useHead(() => ({
  title: `Edit Invoice ${invoiceData.invoice.number} - Manager`
}))
</script>

<style scoped>
.invoice-preview-content {
  font-family: 'Sarabun', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.invoice-preview-content .invoice-container {
  max-width: none;
  margin: 0;
  padding: 20px;
  box-shadow: none;
}

/* Make preview modal content responsive */
@media (max-width: 768px) {
  .modal-box {
    max-width: 95vw;
  }
}
</style>