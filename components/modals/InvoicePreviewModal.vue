<template>
  <dialog :id="modalId" class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-5xl w-full h-full max-h-[90vh] bg-white text-black p-0 flex flex-col">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white z-20 px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg text-gray-900">
            {{ title || `Invoice Preview - ${invoiceData?.invoice?.number || 'N/A'}` }}
          </h3>
          <div class="flex gap-2">
            <button 
              class="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700" 
              @click="closeModal"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4" style="max-height: calc(90vh - 120px);">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="loading loading-spinner loading-lg"></div>
          <span class="ml-2 text-gray-600">Loading preview...</span>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <div v-else-if="previewHTML" 
             class="invoice-preview-container bg-white"
             v-html="previewHTML">
        </div>
        
        <div v-else-if="invoiceData" class="invoice-preview-fallback">
          <!-- Revamped structured preview -->
          <div class="invoice-container max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-lg">
            <!-- Header with logo on left -->
            <div class="header flex items-start gap-6 mb-6 pb-4 border-b-2 border-gray-800">
              <div class="logo w-32 h-20 flex items-center justify-center bg-gray-100 rounded flex-shrink-0">
                <img 
                  src="/images/logo-moonoi.png"
                  alt="Company Logo" 
                  class="max-w-full max-h-full object-contain"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <div v-if="!showLogo" class="text-gray-500 text-xs text-center p-2">
                  <svg class="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  <div class="font-semibold text-xs">LOGO</div>
                </div>
              </div>
              <div class="company-info flex-1">
                <div class="company-name-th text-lg font-bold mb-1">
                  {{ invoiceData.company?.nameTh || 'บริษัท คอร์ดเอไอเทค จำกัด (สำนักงานใหญ่)' }}
                </div>
                <div class="company-name-en text-base font-bold mb-2">
                  {{ invoiceData.company?.nameEn || 'Claude AI Tech Co., Ltd.' }}
                </div>
                <div class="company-address text-xs leading-relaxed text-gray-700">
                  {{ invoiceData.company?.address || '99/101 ม.พิมุกต์ 1 เฟส 5 ซอย 6 ตำบล สันทรายน้อย อำเภอสันทราย เชียงใหม่ 50210' }}<br>
                  Tel. {{ invoiceData.company?.tel || '085-396-7806, 097-954-8922' }} 
                  Tax ID: {{ invoiceData.company?.taxId || '0505562001590' }}
                </div>
              </div>
            </div>

            <!-- Invoice Title -->
            <div class="invoice-title text-center mb-6">
              <h2 class="text-xl font-bold mb-1">ใบวางบิล/ใบแจ้งหนี้</h2>
              <div class="subtitle text-base text-gray-600">(BILLING NOTE/ INVOICE)</div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details flex justify-between mb-8">
              <div class="customer-info flex-1 pr-6">
                <div class="mb-2"><strong>ลูกค้า / Customer:</strong> {{ invoiceData.customer?.name || 'N/A' }}</div>
                <div class="mb-2"><strong>ที่อยู่/ Address:</strong></div>
                <div class="mb-2 text-sm leading-relaxed" v-html="(invoiceData.customer?.address || 'N/A').replace(/\n/g, '<br>')"></div>
                <div class="mb-2"><strong>เบอร์โทรศัพท์/Tel :</strong> {{ invoiceData.customer?.tel || 'N/A' }}</div>
                <div v-if="invoiceData.customer?.taxId" class="mb-2"><strong>Tax ID:</strong> {{ invoiceData.customer.taxId }}</div>
              </div>
              <div class="invoice-meta w-48 border-2 border-gray-800 p-3">
                <div class="mb-1 font-bold">Date: {{ formatDate(invoiceData.invoice?.date) }}</div>
                <div class="mb-1 font-bold">No. {{ invoiceData.invoice?.number || 'N/A' }}</div>
                <div class="font-bold">Due Date: {{ formatDate(invoiceData.invoice?.dueDate) }}</div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="items-section mb-6">
              <table class="w-full border-collapse border border-gray-800">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-800 p-2 text-center w-12">ลำดับ</th>
                    <th class="border border-gray-800 p-2 text-left">รายละเอียด</th>
                    <th class="border border-gray-800 p-2 text-center w-20">จำนวน</th>
                    <th class="border border-gray-800 p-2 text-center w-24">ราคาต่อหน่วย</th>
                    <th class="border border-gray-800 p-2 text-center w-24">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in invoiceData.items" :key="index">
                    <td class="border border-gray-800 p-2 text-center">{{ index + 1 }}</td>
                    <td class="border border-gray-800 p-2">{{ item.description }}</td>
                    <td class="border border-gray-800 p-2 text-center">{{ item.quantity }}</td>
                    <td class="border border-gray-800 p-2 text-center">{{ formatNumber(item.unitPrice) }}</td>
                    <td class="border border-gray-800 p-2 text-center">{{ formatNumber(item.totalPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bottom Section: Totals with Reference and Signature -->
            <div class="bottom-section">
              <!-- Totals -->
              <div class="totals ml-auto w-80 mb-4">
                <table class="w-full border-collapse border border-gray-800">
                  <tbody>
                    <tr>
                      <td class="border border-gray-800 p-2">จำนวนเงิน</td>
                      <td class="border border-gray-800 p-2 text-right">{{ formatNumber(computedTotals.subtotal) }}</td>
                    </tr>
                    <tr>
                      <td class="border border-gray-800 p-2">ภาษีมูลค่าเพิ่ม(7%)</td>
                      <td class="border border-gray-800 p-2 text-right">{{ formatNumber(computedTotals.vat) }}</td>
                    </tr>
                    <tr class="bg-gray-100 font-bold">
                      <td class="border border-gray-800 p-2">จำนวนเงินรวมทั้งสิ้น</td>
                      <td class="border border-gray-800 p-2 text-right">{{ formatNumber(computedTotals.total) }}</td>
                    </tr>
                    <tr class="bg-gray-100">
                      <td colspan="2" class="border border-gray-800 p-2 text-center text-xs italic">
                        ({{ computedTotals.amountInWords }})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Reference Info below totals -->
              <div v-if="invoiceData.reference" class="reference-info text-xs text-gray-600 mb-6 ml-auto w-80 text-center">
                {{ invoiceData.reference }}
              </div>

              <!-- Signature Section - centered and right aligned -->
              <div class="signature-section flex justify-center mb-4">
                <div class="text-center">
                  <div class="mb-4">เสนอโดย</div>
                  <div class="border-b border-gray-800 w-48 mx-auto mb-2 h-8"></div>
                  <div class="mb-1">({{ invoiceData.signer || 'ผู้มีอำนาจลงนาม' }})</div>
                  <div class="text-sm">ผู้มีอำนาจลงนาม</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Footer (if needed) -->
      <div v-if="showActions && invoiceData" class="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div class="flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-ghost">Close</button>
          <button 
            @click="downloadPDF"
            :disabled="downloadingPDF"
            class="btn btn-primary"
          >
            <span v-if="downloadingPDF" class="loading loading-spinner loading-sm mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Generate PDF
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal backdrop -->
    <form method="dialog" class="modal-backdrop bg-black bg-opacity-50">
      <button type="button" @click="closeModal">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { convertNumberToThaiText } from '~/utils/thaiNumberToText'

interface InvoiceData {
  company?: {
    nameTh?: string
    nameEn?: string
    address?: string
    tel?: string
    taxId?: string
  }
  customer?: {
    name?: string
    address?: string
    tel?: string
    taxId?: string
  }
  invoice?: {
    number?: string
    date?: string
    dueDate?: string
  }
  items?: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totals?: {
    subtotal?: number
    vat?: number
    total?: number
    amountInWords?: string
  }
  reference?: string
  payment?: {
    companyName?: string
    accountNumber?: string
    bankInfo?: string
  }
  signer?: string
}

interface Props {
  isOpen?: boolean
  modalId?: string
  title?: string
  invoiceData?: InvoiceData | null
  showActions?: boolean
  useHtmlPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  modalId: 'invoice-preview-modal',
  title: '',
  invoiceData: null,
  showActions: true,
  useHtmlPreview: true
})

const emit = defineEmits<{
  close: []
  pdfGenerated: [blob: Blob]
  error: [message: string]
}>()

// State
const loading = ref(false)
const error = ref('')
const previewHTML = ref('')
const downloadingPDF = ref(false)
const showLogo = ref(true)

// Computed
const computedTotals = computed(() => {
  if (props.invoiceData?.totals) {
    return props.invoiceData.totals
  }
  
  // Calculate totals from items if not provided
  const items = props.invoiceData?.items || []
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const vat = Math.round(subtotal * 0.07 * 100) / 100
  const total = Math.round((subtotal + vat) * 100) / 100
  
  return {
    subtotal,
    vat,
    total,
    amountInWords: convertNumberToThaiText(total)
  }
})


// Methods
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('th-TH')
  } catch {
    return dateString
  }
}

const formatNumber = (value?: number): string => {
  if (value === undefined || value === null) return '0'
  return Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

const generatePreviewHTML = async () => {
  if (!props.invoiceData || !props.useHtmlPreview) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Use the same transformation logic as the PDF generator
    const transformedData = {
      ...props.invoiceData,
      totals: computedTotals.value
    }
    
    // Fetch the HTML template (you could also embed it or use the server endpoint)
    const response = await $fetch('/api/invoices/preview', {
      method: 'POST',
      body: transformedData
    })
    
    previewHTML.value = response.html
  } catch (err: any) {
    console.error('Error generating preview:', err)
    error.value = 'Failed to generate preview'
    // Fallback to structured preview
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  if (!props.invoiceData) return
  
  downloadingPDF.value = true
  
  try {
    const transformedData = {
      ...props.invoiceData,
      totals: computedTotals.value
    }
    
    // Use the existing export endpoint
    const response = await fetch('/api/reports/invoices/export', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${props.invoiceData.invoice?.number || 'preview'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    emit('pdfGenerated', blob)
  } catch (err: any) {
    console.error('Error generating PDF:', err)
    const errorMessage = 'Failed to generate PDF. Please try again.'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    downloadingPDF.value = false
  }
}


const handleImageError = () => {
  console.warn('Logo image failed to load')
  showLogo.value = false
}

const handleImageLoad = () => {
  console.log('Logo image loaded successfully')
  showLogo.value = true
}


const closeModal = () => {
  emit('close')
  // Reset state
  previewHTML.value = ''
  error.value = ''
  loading.value = false
  showLogo.value = true // Reset logo state
}

// Watch for changes in invoice data to regenerate preview
watch(() => props.invoiceData, (newData) => {
  if (newData && props.isOpen && props.useHtmlPreview) {
    generatePreviewHTML()
  }
}, { deep: true })

// Watch for modal open state
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Reset image state when modal opens
    showLogo.value = true
    console.log('Modal opened, showLogo:', showLogo.value)
    
    if (props.invoiceData && props.useHtmlPreview) {
      generatePreviewHTML()
    }
  } else if (!isOpen) {
    // Reset when closed
    previewHTML.value = ''
    error.value = ''
    loading.value = false
    showLogo.value = true
  }
})
</script>

<style scoped>
/* Invoice Preview Styles */
.invoice-preview-container {
  font-family: 'Sarabun', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.invoice-preview-container .invoice-container {
  max-width: none;
  margin: 0;
  padding: 20px;
  box-shadow: none;
}

.invoice-preview-fallback {
  font-family: 'Sarabun', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

/* Scrolling improvements */
.modal-box {
  overflow: hidden !important;
}

.invoice-preview-container,
.invoice-preview-fallback {
  overflow-y: auto;
  max-height: 100%;
}

/* Custom scrollbar */
.invoice-preview-container::-webkit-scrollbar,
.invoice-preview-fallback::-webkit-scrollbar {
  width: 8px;
}

.invoice-preview-container::-webkit-scrollbar-track,
.invoice-preview-fallback::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.invoice-preview-container::-webkit-scrollbar-thumb,
.invoice-preview-fallback::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.invoice-preview-container::-webkit-scrollbar-thumb:hover,
.invoice-preview-fallback::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Logo fallback styles */
.logo {
  border: 1px dashed #d1d5db;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-box {
    max-width: 95vw !important;
    max-height: 95vh !important;
    margin: 2.5vh auto;
  }
  
  .invoice-details {
    flex-direction: column;
  }
  
  .invoice-meta {
    width: 100%;
    margin-top: 1rem;
  }
  
  .totals {
    width: 100%;
    margin-left: 0;
  }
  
  .signature-section {
    width: 100%;
    margin-left: 0;
  }
  
  .logo {
    width: 24px;
    height: 16px;
  }
  
  .header {
    gap: 4px;
  }
}

/* Print styles */
@media print {
  .modal-box {
    box-shadow: none;
    max-width: none;
    max-height: none;
    height: auto;
  }
  
  .sticky {
    position: static !important;
  }
}
</style>