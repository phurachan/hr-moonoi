<template>
  <div class="mb-8">
    <!-- Summary Header with Toggle -->
    <div class="bg-gray-800 rounded-lg shadow mb-4">
      <div class="flex justify-between items-center p-4 cursor-pointer" @click="toggleExpanded">
        <h2 class="text-xl font-bold text-white">Financial Summary</h2>
        <button class="btn btn-ghost btn-sm text-white">
          <svg 
            class="w-5 h-5 transition-transform duration-200" 
            :class="{ 'rotate-180': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          {{ isExpanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>

    <!-- Always Visible: Total Summary Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-green-700 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-green-100">Total Income</div>
            <div class="text-2xl font-bold text-white">{{ formatAmount(summary.totalIncome) }}</div>
          </div>
        </div>
      </div>
      
      <div class="bg-red-700 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-red-100">Total Expense</div>
            <div class="text-2xl font-bold text-white">{{ formatAmount(summary.totalExpense) }}</div>
          </div>
        </div>
      </div>
      
      <div class="bg-slate-700 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-slate-100">Net Amount</div>
            <div class="text-2xl font-bold text-white" :class="summary.netAmount >= 0 ? 'text-green-200' : 'text-red-200'">
              {{ formatAmount(Math.abs(summary.netAmount)) }}
              <span class="text-sm">{{ summary.netAmount >= 0 ? '(Profit)' : '(Loss)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsible: Category Breakdown -->
    <div 
      class="transition-all duration-300 ease-in-out overflow-hidden"
      :class="isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 class="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <!-- Normal Income -->
          <div class="bg-green-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-green-100 uppercase">Normal</div>
                <div class="text-sm font-medium text-green-100">Income</div>
                <div class="text-lg font-bold text-white">{{ formatAmount(summary.normalIncome) }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Normal Expense -->
          <div class="bg-red-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-red-100 uppercase">Normal</div>
                <div class="text-sm font-medium text-red-100">Expense</div>
                <div class="text-lg font-bold text-white">{{ formatAmount(summary.normalExpense) }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Normal Net -->
          <div class="bg-blue-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-blue-100 uppercase">Normal</div>
                <div class="text-sm font-medium text-blue-100">Net</div>
                <div class="text-lg font-bold text-white" :class="summary.normalNet >= 0 ? 'text-green-200' : 'text-red-200'">
                  {{ formatAmount(Math.abs(summary.normalNet)) }}
                </div>
                <div class="text-xs text-blue-100">{{ summary.normalNet >= 0 ? 'Profit' : 'Loss' }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- OD Income -->
          <div class="bg-emerald-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-emerald-100 uppercase">OD</div>
                <div class="text-sm font-medium text-emerald-100">Income</div>
                <div class="text-lg font-bold text-white">{{ formatAmount(summary.odIncome) }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- OD Expense -->
          <div class="bg-rose-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-rose-100 uppercase">OD</div>
                <div class="text-sm font-medium text-rose-100">Expense</div>
                <div class="text-lg font-bold text-white">{{ formatAmount(summary.odExpense) }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- OD Net -->
          <div class="bg-indigo-600 rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-indigo-100 uppercase">OD</div>
                <div class="text-sm font-medium text-indigo-100">Net</div>
                <div class="text-lg font-bold text-white" :class="summary.odNet >= 0 ? 'text-green-200' : 'text-red-200'">
                  {{ formatAmount(Math.abs(summary.odNet)) }}
                </div>
                <div class="text-xs text-indigo-100">{{ summary.odNet >= 0 ? 'Profit' : 'Loss' }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Summary Stats -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-300 mb-2">Normal Category</h4>
            <div class="text-xs text-gray-400">
              <div>Income: {{ formatAmount(summary.normalIncome) }}</div>
              <div>Expense: {{ formatAmount(summary.normalExpense) }}</div>
              <div class="font-semibold" :class="summary.normalNet >= 0 ? 'text-green-400' : 'text-red-400'">
                Net: {{ formatAmount(summary.normalNet) }}
              </div>
            </div>
          </div>
          
          <div class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-300 mb-2">OD Category</h4>
            <div class="text-xs text-gray-400">
              <div>Income: {{ formatAmount(summary.odIncome) }}</div>
              <div>Expense: {{ formatAmount(summary.odExpense) }}</div>
              <div class="font-semibold" :class="summary.odNet >= 0 ? 'text-green-400' : 'text-red-400'">
                Net: {{ formatAmount(summary.odNet) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SummaryData {
  normalIncome: number
  normalExpense: number
  normalNet: number
  odIncome: number
  odExpense: number
  odNet: number
  totalIncome: number
  totalExpense: number
  netAmount: number
}

interface Props {
  summary: SummaryData
}

defineProps<Props>()

const isExpanded = ref(false)

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.transition-all {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
</style>