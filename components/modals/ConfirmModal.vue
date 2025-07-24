<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0">
          <svg v-if="type === 'danger'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-else-if="type === 'warning'" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-else class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-lg text-gray-900">{{ title }}</h3>
        </div>
      </div>
      
      <div class="py-2">
        <p class="whitespace-pre-line text-gray-700">{{ message }}</p>
      </div>
      
      <div class="flex justify-end gap-2 mt-6">
        <button 
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="px-4 py-2 rounded-md focus:outline-none focus:ring-2"
          :class="type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm'
  },
  message: {
    type: String,
    required: true,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  console.log('ConfirmModal: handleConfirm called')
  emit('confirm')
}

const handleCancel = () => {
  console.log('ConfirmModal: handleCancel called')
  emit('cancel')
}

// ConfirmModal component ready
</script>