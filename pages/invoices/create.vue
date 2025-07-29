<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Create Invoice</h1>
        <p class="text-gray-300 mt-2">Generate a new invoice with custom items</p>
      </div>
      <div class="flex gap-4">
        <NuxtLink to="/reports/invoices" class="btn btn-outline">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Reports
        </NuxtLink>
      </div>
    </div>

    <!-- Invoice Form -->
    <div class="space-y-8">
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
            <NuxtLink to="/customers/new" class="btn btn-primary btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Customer
            </NuxtLink>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <!-- Customer Selection Dropdown -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Select Customer</span>
              </label>
              <select 
                v-model="selectedCustomerId"
                @change="onCustomerSelect"
                class="select select-bordered bg-gray-700 text-white"
              >
                <option value="">-- Select a customer or enter manually --</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>

            <!-- Manual Entry Fields -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Tax ID</span>
              </label>
              <input 
                v-model="invoiceData.customer.taxId"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="Enter customer tax ID"
              />
            </div>
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
                <span class="label-text text-gray-300">Customer Address</span>
              </label>
              <textarea 
                v-model="invoiceData.customer.address"
                class="textarea textarea-bordered bg-gray-700 text-white"
                rows="3"
                placeholder="Customer address"
              ></textarea>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Phone</span>
              </label>
              <input 
                v-model="invoiceData.customer.tel"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="Customer phone"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Invoice Items (Full Width) -->
      <div class="bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">Invoice Items</h3>
          <div class="flex gap-2">
            <!-- Column Settings Button -->
            <div class="dropdown dropdown-end">
              <button 
                tabindex="0" 
                class="btn btn-ghost btn-sm"
                @click="showColumnSettings = !showColumnSettings"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                Columns
              </button>
              <div v-show="showColumnSettings" tabindex="0" class="dropdown-content z-[1] menu p-4 shadow bg-gray-700 rounded-box w-64">
                <div class="text-white font-semibold mb-2">Show/Hide Columns</div>
                <div class="space-y-2">
                  <label 
                    v-for="[key, config] in Object.entries(columnConfig)" 
                    :key="key"
                    class="label cursor-pointer justify-start gap-2"
                    :class="{ 'opacity-50': config.required }"
                  >
                    <input 
                      type="checkbox" 
                      :checked="config.visible"
                      :disabled="config.required"
                      @change="toggleColumn(key)"
                      class="checkbox checkbox-sm checkbox-primary"
                    />
                    <span class="label-text text-gray-300">{{ config.label }}</span>
                    <span v-if="config.required" class="text-xs text-gray-500">(required)</span>
                  </label>
                </div>
                <div class="divider my-2"></div>
                <div class="flex gap-2">
                  <button @click="resetColumns()" class="btn btn-xs btn-outline">Reset</button>
                  <button @click="setMobileView()" class="btn btn-xs btn-outline">Mobile</button>
                  <button @click="setDesktopView()" class="btn btn-xs btn-outline">Desktop</button>
                </div>
              </div>
            </div>
            
            <!-- Add Item Button -->
            <button 
              @click="addItem"
              class="btn btn-primary btn-sm"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Item
            </button>
          </div>
        </div>

        <!-- Dynamic Columns Table -->
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-sm">
            <thead>
              <tr class="bg-gray-700">
                <th v-for="[key, config] in visibleColumns" :key="key" 
                    :class="[
                      'text-white',
                      config.key === 'description' ? '' : 'text-center',
                      config.width
                    ]">
                  {{ config.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in invoiceData.items" 
                :key="index"
                class="hover:bg-gray-700"
              >
                <!-- Dynamic Column Cells -->
                <td v-for="[key, config] in visibleColumns" :key="key" 
                    :class="[
                      config.key === 'description' ? '' : 'text-center',
                      config.key === 'totalPrice' ? 'text-gray-300 font-semibold' : '',
                      config.width
                    ]">
                  
                  <!-- Index Column -->
                  <span v-if="config.key === 'index'" class="text-gray-300">
                    {{ index + 1 }}
                  </span>
                  
                  <!-- Description Column -->
                  <textarea
                    v-else-if="config.key === 'description'"
                    v-model="item.description"
                    class="textarea textarea-xs w-full bg-gray-700 text-white border-gray-600 resize-none"
                    rows="2"
                    placeholder="Item description..."
                    @input="calculateItemTotal(index)"
                  />
                  
                  <!-- Quantity Column -->
                  <input
                    v-else-if="config.key === 'quantity'"
                    v-model.number="item.quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    class="input input-xs w-20 bg-gray-700 text-white border-gray-600 text-center"
                    @input="calculateItemTotal(index)"
                  />
                  
                  <!-- Unit Price Column -->
                  <input
                    v-else-if="config.key === 'unitPrice'"
                    v-model.number="item.unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    class="input input-xs w-24 bg-gray-700 text-white border-gray-600 text-center"
                    @input="calculateItemTotal(index)"
                  />
                  
                  <!-- Total Price Column -->
                  <div v-else-if="config.key === 'totalPrice'" class="relative">
                    <input
                      v-model.number="item.totalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      :class="[
                        'input input-xs w-24 text-center font-semibold',
                        item.manualTotal 
                          ? 'bg-yellow-700 border-yellow-500 text-yellow-100' 
                          : 'bg-gray-700 border-gray-600 text-white'
                      ]"
                      @input="onTotalPriceChange(index)"
                      @focus="onTotalFocus(index)"
                      @blur="onTotalBlur(index)"
                      :title="item.manualTotal ? 'Manually edited total' : 'Auto-calculated total'"
                    />
                    <button
                      v-if="item.manualTotal"
                      @click="resetItemTotal(index)"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 rounded-full text-xs flex items-center justify-center"
                      title="Reset to auto-calculated total"
                    >
                      ↻
                    </button>
                  </div>
                  
                  <!-- Actions Column -->
                  <button 
                    v-else-if="config.key === 'actions'"
                    @click="removeItem(index)"
                    class="btn btn-xs btn-error"
                    :disabled="invoiceData.items.length === 1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  
                </td>
              </tr>
              <tr v-if="invoiceData.items.length === 0" class="text-center">
                <td :colspan="visibleColumns.length" class="text-gray-400 py-8">
                  No items added yet. Click "Add Item" to get started.
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
          <div class="grid grid-cols-1 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Company Name (Thai)</span>
              </label>
              <input 
                v-model="invoiceData.company.nameTh"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="บริษัท คอร์ดเอไอเทค จำกัด"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Company Name (English)</span>
              </label>
              <input 
                v-model="invoiceData.company.nameEn"
                type="text" 
                class="input input-bordered bg-gray-700 text-white"
                placeholder="Claude AI Tech Co., Ltd."
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-gray-300">Address</span>
              </label>
              <textarea 
                v-model="invoiceData.company.address"
                class="textarea textarea-bordered bg-gray-700 text-white"
                rows="3"
                placeholder="Company address"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Phone</span>
                </label>
                <input 
                  v-model="invoiceData.company.tel"
                  type="text" 
                  class="input input-bordered bg-gray-700 text-white"
                  placeholder="085-396-7806"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-gray-300">Tax ID</span>
                </label>
                <input 
                  v-model="invoiceData.company.taxId"
                  type="text" 
                  class="input input-bordered bg-gray-700 text-white"
                  placeholder="0505562001590"
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

        <!-- Invoice Totals & Actions -->
        <div class="space-y-6">
          <!-- Totals -->
          <div class="bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">Invoice Totals</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-300">Subtotal:</span>
                <span class="text-white font-semibold">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-300">VAT (7%):</span>
                <span class="text-white font-semibold">{{ formatCurrency(vat) }}</span>
              </div>
              <div class="border-t border-gray-600 pt-4">
                <div class="flex justify-between text-lg">
                  <span class="text-white font-bold">Total:</span>
                  <span class="text-primary font-bold">{{ formatCurrency(total) }}</span>
                </div>
              </div>
              <div class="text-sm text-gray-400 italic">
                {{ amountInWords }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">Actions</h3>
            <div class="flex flex-col gap-3">
              <button 
                @click="previewInvoice"
                class="btn btn-primary w-full"
                :disabled="!isValidInvoice"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Preview Invoice
              </button>
              
              <div class="grid grid-cols-2 gap-3">
                <button 
                  @click="generatePDF"
                  :disabled="!isValidInvoice || generatingPDF"
                  class="btn btn-success"
                >
                  <span v-if="generatingPDF" class="loading loading-spinner loading-sm mr-1"></span>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  PDF
                </button>

                <button 
                  @click="saveInvoice"
                  :disabled="!isValidInvoice || saving"
                  class="btn btn-info"
                >
                  <span v-if="saving" class="loading loading-spinner loading-sm mr-1"></span>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Save
                </button>
              </div>

              <button 
                @click="clearForm"
                class="btn btn-ghost w-full"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert alert-error mt-6">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="alert alert-success mt-6">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ success }}</span>
    </div>

    <!-- Invoice Preview Modal -->
    <ModalsInvoicePreviewModal
      :is-open="showPreview"
      :invoice-data="previewInvoiceData"
      :show-actions="true"
      :use-html-preview="true"
      modal-id="invoice-preview-modal"
      title="Invoice Preview"
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

const authStore = useAuthStore()
const route = useRoute()

// Reactive data
const loading = ref(false)
const generatingPDF = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showPreview = ref(false)
const previewInvoiceData = ref(null)

// Customer-related data
const customers = ref([])
const selectedCustomerId = ref('')
const loadingCustomers = ref(false)

// Column visibility management
const columnConfig = reactive({
  index: { visible: true, label: '#', key: 'index', width: 'w-12', required: true },
  description: { visible: true, label: 'Description', key: 'description', width: 'flex-1', required: true },
  quantity: { visible: true, label: 'Qty', key: 'quantity', width: 'w-20' },
  unitPrice: { visible: true, label: 'Unit Price', key: 'unitPrice', width: 'w-24' },
  totalPrice: { visible: true, label: 'Total', key: 'totalPrice', width: 'w-24' },
  actions: { visible: true, label: 'Actions', key: 'actions', width: 'w-20', required: true }
})

const showColumnSettings = ref(false)

const visibleColumns = computed(() => {
  return Object.entries(columnConfig).filter(([key, config]) => config.visible)
})

const toggleColumn = (columnKey) => {
  if (!columnConfig[columnKey].required) {
    columnConfig[columnKey].visible = !columnConfig[columnKey].visible
    saveColumnPreferences()
  }
}

const resetColumns = () => {
  Object.keys(columnConfig).forEach(key => {
    columnConfig[key].visible = true
  })
  saveColumnPreferences()
}

const setMobileView = () => {
  columnConfig.index.visible = false
  columnConfig.unitPrice.visible = false
  columnConfig.totalPrice.visible = true
  columnConfig.quantity.visible = true
  columnConfig.description.visible = true
  columnConfig.actions.visible = true
  saveColumnPreferences()
}

const setDesktopView = () => {
  Object.keys(columnConfig).forEach(key => {
    columnConfig[key].visible = true
  })
  saveColumnPreferences()
}

// Save and load column preferences
const saveColumnPreferences = () => {
  const preferences = {}
  Object.keys(columnConfig).forEach(key => {
    preferences[key] = columnConfig[key].visible
  })
  localStorage.setItem('invoice-columns-preference', JSON.stringify(preferences))
}

const loadColumnPreferences = () => {
  const saved = localStorage.getItem('invoice-columns-preference')
  if (saved) {
    try {
      const preferences = JSON.parse(saved)
      Object.keys(preferences).forEach(key => {
        if (columnConfig[key]) {
          columnConfig[key].visible = preferences[key]
        }
      })
      return true
    } catch (e) {
      console.error('Failed to load column preferences:', e)
    }
  }
  return false
}

// Invoice data structure
const invoiceData = reactive({
  company: {
    nameTh: 'บริษัท คอร์ดเอไอเทค จำกัด (สำนักงานใหญ่)',
    nameEn: 'Claude AI Tech Co., Ltd.',
    address: '99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210',
    tel: '085-396-7806, 097-954-8922',
    taxId: '0505562001590'
  },
  customer: {
    name: '',
    address: '',
    tel: '',
    taxId: ''
  },
  invoice: {
    number: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  items: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      manualTotal: false
    }
  ],
  reference: '',
  payment: {
    companyName: 'Claude AI Tech Co., Ltd.',
    accountNumber: '051-8-44336-4',
    bankInfo: 'Kasikorn Bank: Central Festival Chiang Mai Branch'
  },
  signer: 'ผู้มีอำนาจลงนาม'
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
function generateInvoiceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  return `IV${year}${month}${day}${random}`
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

function calculateItemTotal(index: number) {
  const item = invoiceData.items[index]
  // Only auto-calculate if total hasn't been manually edited
  if (!item.manualTotal) {
    item.totalPrice = Math.round((item.quantity || 0) * (item.unitPrice || 0) * 100) / 100
  }
}

// Handle manual total price changes
function onTotalPriceChange(index: number) {
  const item = invoiceData.items[index]
  item.manualTotal = true
  // Round to 2 decimal places
  item.totalPrice = Math.round((item.totalPrice || 0) * 100) / 100
}

// Track when user starts editing total
function onTotalFocus(index: number) {
  const item = invoiceData.items[index]
  // Store original calculated value for reference
  item._originalCalculated = Math.round((item.quantity || 0) * (item.unitPrice || 0) * 100) / 100
}

// Handle when user finishes editing total
function onTotalBlur(index: number) {
  const item = invoiceData.items[index]
  const calculatedValue = Math.round((item.quantity || 0) * (item.unitPrice || 0) * 100) / 100
  
  // If user set the value back to calculated value, remove manual flag
  if (item.totalPrice === calculatedValue) {
    item.manualTotal = false
  }
}

// Reset manual total flag and recalculate
function resetItemTotal(index: number) {
  const item = invoiceData.items[index]
  item.manualTotal = false
  calculateItemTotal(index)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount)
}


// Customer-related functions
async function fetchCustomers() {
  loadingCustomers.value = true
  try {
    const response = await $fetch('/api/customers', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    customers.value = response.filter(customer => customer.status === 'active') || []
  } catch (err) {
    console.error('Error fetching customers:', err)
    customers.value = []
  } finally {
    loadingCustomers.value = false
  }
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
  } else {
    // Clear customer data when no customer is selected
    invoiceData.customer.name = ''
    invoiceData.customer.address = ''
    invoiceData.customer.tel = ''
    invoiceData.customer.taxId = ''
  }
}

function checkPreselectedCustomer() {
  const customerId = route.query.customer as string
  if (customerId && customers.value.length > 0) {
    const customer = customers.value.find(c => c.id === customerId)
    if (customer) {
      selectedCustomerId.value = customerId
      onCustomerSelect()
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

async function saveInvoice() {
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
        total: total.value,
        amountInWords: amountInWords.value
      }
    }

    const response = await $fetch('/api/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: apiData
    })
    
    success.value = 'Invoice saved successfully!'
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    console.error('Error saving invoice:', err)
    error.value = 'Failed to save invoice. Please try again.'
  } finally {
    saving.value = false
  }
}

function clearForm() {
  // Reset all form data except company defaults
  Object.assign(invoiceData, {
    company: {
      nameTh: 'บริษัท คอร์ดเอไอเทค จำกัด (สำนักงานใหญ่)',
      nameEn: 'Claude AI Tech Co., Ltd.',
      address: '99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210',
      tel: '085-396-7806, 097-954-8922',
      taxId: '0505562001590'
    },
    customer: {
      name: '',
      address: '',
      tel: '',
      taxId: ''
    },
    invoice: {
      number: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
      companyName: 'Claude AI Tech Co., Ltd.',
      accountNumber: '051-8-44336-4',
      bankInfo: 'Kasikorn Bank: Central Festival Chiang Mai Branch'
    },
    signer: 'ผู้มีอำนาจลงนาม'
  })
  
  error.value = ''
  success.value = ''
  selectedCustomerId.value = ''
}

// Initialize component
onMounted(async () => {
  await fetchCustomers()
  // Check if there's a preselected customer from URL params
  checkPreselectedCustomer()
  
  // Set initial responsive columns
  handleResize()
  
  // Add window resize listener
  window.addEventListener('resize', handleResize)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Handle responsive columns
const handleResize = () => {
  // Only apply responsive defaults if no user preferences are saved
  if (!loadColumnPreferences()) {
    if (window.innerWidth < 768) {
      setMobileView()
    } else {
      setDesktopView()
    }
  }
}

// Watch for changes in customers to handle preselected customer
watch(customers, () => {
  checkPreselectedCustomer()
}, { deep: true })

// Set page title
useHead({
  title: 'Create Invoice - Manager'
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